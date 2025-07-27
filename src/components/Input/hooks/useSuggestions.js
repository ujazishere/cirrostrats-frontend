import { useState, useEffect, useCallback, useRef } from "react";
import useDebounce from "./useDebounce";
import {
  formatSuggestions,
  matchingSuggestions,
} from "../utils/searchUtils";
import searchService from "../api/searchservice";

// Helper to get recent searches from local storage and filter out old ones
const getRecentSearchesFromLocalStorage = () => {
  const storedSearches = localStorage.getItem('recentSearches');
  if (storedSearches) {
    const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000); // Milliseconds in 24 hours
    try {
      const searches = JSON.parse(storedSearches);
      // Filter out searches older than 24 hours and ensure they have a timestamp
      return searches.filter(s => s.timestamp && s.timestamp > twentyFourHoursAgo);
    } catch (e) {
      console.error("Error parsing recent searches from localStorage:", e);
      // If parsing fails, it indicates corrupted data; clear it and return empty
      localStorage.removeItem('recentSearches');
      return [];
    }
  }
  return [];
};

/**
 * Enhanced search suggestions hook with search history priority.
 */
export default function useSearchSuggestions(userEmail, isLoggedIn, inputValue, dropOpen) {
  // Core suggestion state
  const [suggestions, setSuggestions] = useState({
    initial: [],       // Popular suggestions loaded once
    backend: [],       // Additional suggestions from backend searches
    filtered: [],      // Currently displayed suggestions
    hasMore: true      // Whether more suggestions might be available
  });

  const [isLoading, setIsLoading] = useState(false);
  
  // Debounce for backend queries (only when initial suggestions run out)
  const debouncedInputValue = useDebounce(inputValue, 240);
  // Why 240ms? because human response/reaction time is around 200-250ms
  // const debouncedInputValue = useDebounce(inputValue, 1000);
  
  // Track if initial suggestions have been loaded
  const initialLoadedRef = useRef(false);
  const [localRecentSearches, setLocalRecentSearches] = useState([]);
  const localRecentSearchesRef = useRef(localRecentSearches);
  const lastFetchedQueryRef = useRef(''); // Track last fetched query to avoid duplicates

  useEffect(() => {
    localRecentSearchesRef.current = localRecentSearches;
  }, [localRecentSearches]);

  const markSuggestionsAsRecent = useCallback((suggs) => {
    if (!Array.isArray(suggs)) return [];
    const currentRecentSearches = localRecentSearchesRef.current;
    return suggs.map(s => {
      const isRecent = currentRecentSearches.some(rs => {
        if (s.id && rs.id) return s.id === rs.id;
        return s.label.toLowerCase() === rs.label.toLowerCase();
      });
      return { ...s, isRecent };
    });
  }, []);

  // Initial fetch of popular suggestions and local recent searches (called once)
  useEffect(() => {
    if (!initialLoadedRef.current) {
      const fetchInitialData = async () => {
        try {
          setIsLoading(true);
          const recent = getRecentSearchesFromLocalStorage();
          setLocalRecentSearches(recent);

          const rawData = await searchService.fetchPopularSuggestions(userEmail, '');
          const formatted = formatSuggestions(rawData);
          const initialWithRecentStatus = markSuggestionsAsRecent(formatted);

          setSuggestions(prev => ({
            ...prev,
            initial: initialWithRecentStatus,
          }));

          initialLoadedRef.current = true;
        } catch (error) {
          console.error("Failed to fetch initial suggestions:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialData();
    }
  }, [userEmail, markSuggestionsAsRecent]);

  // Periodically refresh localRecentSearches from localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshedRecent = getRecentSearchesFromLocalStorage();
      if (JSON.stringify(refreshedRecent) !== JSON.stringify(localRecentSearchesRef.current)) {
        setLocalRecentSearches(refreshedRecent);
      }
    }, 2000); // Check for new recent searches every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch additional suggestions when needed
  const fetchAdditionalSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) return;
    
    // Avoid fetching the same query multiple times
    if (lastFetchedQueryRef.current === query.toLowerCase()) return;
    
    try {
      setIsLoading(true);
      lastFetchedQueryRef.current = query.toLowerCase();
      
      const rawData = await searchService.fetchPopularSuggestions(userEmail, query);
      
      if (rawData && rawData.length > 0) {
        const formatted = formatSuggestions(rawData);
        setSuggestions(prev => {
          // Avoid duplicates
          // TODO: inspect this .id -- this will prevent me from feeding data to the sti outside of the id realm and may break the code. 
          const existingIds = new Set([...prev.initial.map(s => s.stId), ...prev.backend.map(s => s.stId)].filter(Boolean)); 
          
          // Filters formatted (newly fetched suggestions) to exclude any items whose IDs already exist in existingIds.
          const newSuggestions = formatted
            .filter(s => s.stId ? !existingIds.has(s.stId) : true) 
            .map(s => ({ 
              ...s,
              isRecent: localRecentSearchesRef.current.some(rs => {
                if (s.stId && rs.stId) return s.stId === rs.stId;
                return s.label.toLowerCase() === rs.label.toLowerCase();
              })
            }));
          
          return {
            ...prev,
            backend: [...prev.backend, ...newSuggestions]
          };
        });
      }
    } catch (error) {
      console.error("Failed to fetch additional suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  // **NEW**: Trigger additional suggestions when user types
  useEffect(() => {
    if (debouncedInputValue && 
        debouncedInputValue.length >= 2 && 
        dropOpen && 
        initialLoadedRef.current) {
      fetchAdditionalSuggestions(debouncedInputValue);
    }
  }, [debouncedInputValue, dropOpen, fetchAdditionalSuggestions]);

  // Handle input changes to filter and prioritize recent searches
  useEffect(() => {
    if (!dropOpen || !initialLoadedRef.current) {
      return;
    }

    const currentInput = (inputValue || "").toLowerCase();

    // 1. Get user's recent searches, sorted with newest first. Mark for styling.
    const recentSearchesWithFlag = localRecentSearches.map(s => ({ ...s, isRecent: true }));

    // 2. Get all other suggestions (popular, backend).
    const allOtherSuggestions = [...suggestions.initial, ...suggestions.backend];

    // 3. Filter both lists based on the current input.
    const filteredRecent = recentSearchesWithFlag.filter(s =>
      s.label.toLowerCase().includes(currentInput)
    );

    const filteredOther = matchingSuggestions(allOtherSuggestions, inputValue);

    // 4. Combine lists, prioritizing recent matches and ensuring no duplicates.
    const combinedSuggestions = [...filteredRecent, ...filteredOther];
    const uniqueSuggestions = [];
    const seenLabels = new Set();

    for (const suggestion of combinedSuggestions) {
      const lowerLabel = suggestion.label.toLowerCase();
      if (!seenLabels.has(lowerLabel)) {
        seenLabels.add(lowerLabel);
        uniqueSuggestions.push(suggestion);
      }
    }
    
    // 5. Update state with the final, ordered list, capped at a max number.
    const MAX_DISPLAY_SUGGESTIONS = 10;
    setSuggestions(prev => ({
      ...prev,
      filtered: uniqueSuggestions.slice(0, MAX_DISPLAY_SUGGESTIONS),
    }));

  }, [inputValue, dropOpen, localRecentSearches, suggestions.initial, suggestions.backend]);

  return {
    filteredSuggestions: suggestions.filtered,
    isLoading,
    hasMore: suggestions.hasMore,
    fetchAdditionalSuggestions, // Expose for manual calls if needed
    refetch: () => {
      initialLoadedRef.current = false;
      lastFetchedQueryRef.current = ''; // Reset last fetched query
      setSuggestions({ initial: [], backend: [], filtered: [], hasMore: true });
      setLocalRecentSearches([]);
      localStorage.removeItem('recentSearches');
    }
  };
}