import { useState, useEffect, useCallback, useRef } from "react";
import useDebounce from "./useDebounce";
import { 
  formatSuggestions, 
  matchingSuggestions,
} from "../utils/searchUtils";
import searchService from "../api/searchservice";

/**
 * Enhanced search suggestions hook with proper caching and backspace handling
 */
export default function useSearchSuggestions(userEmail, isLoggedIn, inputValue, dropOpen) {
  // Core suggestion state
  const [suggestions, setSuggestions] = useState({
    initial: [],       // Popular suggestions loaded once (up to 500)
    backend: [],       // Additional suggestions from backend searches
    filtered: [],      // Currently displayed suggestions (max 5)
    hasMore: true      // Whether more suggestions might be available
  });

  // Cache for display history to handle backspace scenarios
  const [displayCache, setDisplayCache] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  // Debounce for backend queries (only when initial suggestions run out)
  const debouncedInputValue = useDebounce(inputValue, 500);
  
  // Track if initial suggestions have been loaded
  const initialLoadedRef = useRef(false);
  const lastInputRef = useRef('');

  // Initial fetch of popular suggestions (called once)
  useEffect(() => {
    if (!initialLoadedRef.current && userEmail) {
      const fetchInitialSuggestions = async () => {
        try {
          setIsLoading(true);
          const rawData = await searchService.fetchPopularSuggestions(userEmail, '');
          const formatted = formatSuggestions(rawData);
          
          setSuggestions(prev => ({
            ...prev,
            initial: formatted,
            filtered: formatted.slice(0, 5)
          }));
          
          initialLoadedRef.current = true;
        } catch (error) {
          console.error("Failed to fetch initial suggestions:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialSuggestions();
    }
  }, [userEmail, formatSuggestions]);

  // Handle input changes and filtering
  useEffect(() => {
    // early return if dropdown not open or initial suggestions are not loaded.
    if (!dropOpen || !initialLoadedRef.current) return;

    const currentInput = inputValue || '';
    const lastInput = lastInputRef.current;
    
    // Determine if user is backspacing
    const isBackspacing = currentInput.length < lastInput.length && 
                         lastInput.startsWith(currentInput);
    
    // Get all available suggestions
    const allSuggestions = [...suggestions.initial, ...suggestions.backend];
    
    if (isBackspacing && displayCache.has(currentInput)) {
      // Use cached results for backspace
      const cachedResults = displayCache.get(currentInput);
      setSuggestions(prev => ({
        ...prev,
        filtered: cachedResults
      }));
    } else {
      // Filter suggestions normally
      const filtered = matchingSuggestions(allSuggestions, currentInput);
      
      setSuggestions(prev => ({
        ...prev,
        filtered
      }));
      
      // Cache the results
      setDisplayCache(prev => new Map(prev).set(currentInput, filtered));
    }
    
    lastInputRef.current = currentInput;
  }, [inputValue, dropOpen, suggestions.initial, suggestions.backend, matchingSuggestions, displayCache]);

  // Fetch additional suggestions when needed
  const fetchAdditionalSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) return;
    
    try {
      setIsLoading(true);
      const rawData = await searchService.fetchPopularSuggestions(userEmail, query);
      
      if (rawData && rawData.length > 0) {
        const formatted = formatSuggestions(rawData);
        
        setSuggestions(prev => {
          // Avoid duplicates
          // TODO: inspect this .id -- this will prevent me from feeding data to the sti outside of the id realm and may break the code. 
          const existingIds = new Set([...prev.initial, ...prev.backend].map(s => s.id));
          
          // Filters formatted (newly fetched suggestions) to exclude any items whose IDs already exist in existingIds.
          const newSuggestions = formatted.filter(s => !existingIds.has(s.id));
          
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
  }, [userEmail, formatSuggestions]);

  // Trigger backend fetch when filtered suggestions are low and input is debounced
  useEffect(() => {
    if (!dropOpen || !debouncedInputValue) return;
    
    const shouldFetchMore = suggestions.filtered.length < 5 && 
                           debouncedInputValue.length >= 2 &&
                           suggestions.hasMore;
    
    if (shouldFetchMore) {
      fetchAdditionalSuggestions(debouncedInputValue);
    }
  }, [debouncedInputValue, suggestions.filtered.length, dropOpen, fetchAdditionalSuggestions, suggestions.hasMore]);

  // Parse query for complex searches (when all else fails)
  const parseQuery = useCallback(async (query) => {
    if (!query || query.length < 3) return;
    
    try {
      setIsLoading(true);
      // Implement your parse query logic here
      // const results = await searchService.parseQuery(userEmail, query);
      // Handle parse query results...
    } catch (error) {
      console.error("Parse query failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  // Cleanup cache periodically to prevent memory leaks
  useEffect(() => {
    const cleanup = () => {
      setDisplayCache(prev => {
        const newCache = new Map();
        // Keep only recent entries (last 10)
        const entries = Array.from(prev.entries()).slice(-10);
        entries.forEach(([key, value]) => newCache.set(key, value));
        return newCache;
      });
    };

    const interval = setInterval(cleanup, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, []);

  return {
    filteredSuggestions: suggestions.filtered,
    isLoading,
    hasMore: suggestions.hasMore,
    // Additional utilities you might need
    clearCache: () => setDisplayCache(new Map()),
    refetch: () => {
      initialLoadedRef.current = false;
      setSuggestions({
        initial: [],
        backend: [],
        filtered: [],
        hasMore: true
      });
    }
  };
}
