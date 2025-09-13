// Imports necessary hooks from React, the custom debounce hook, utility functions, and the search API service.
import { useState, useEffect, useCallback, useRef } from "react";
import useDebounce from "./useDebounce";
import {
  formatSuggestions,
  matchingSuggestions,
} from "../utils/searchUtils";
import searchService from "../api/searchservice";

/**
 * @function getRecentSearchesFromLocalStorage
 * @description A helper function to safely retrieve and validate recent searches from localStorage.
 * It ensures that the data is not corrupted and filters out any searches older than 24 hours.
 * @returns {Array} An array of recent search objects.
 */
// This helper function isolates the logic for retrieving search history from the browser's localStorage.
const getRecentSearchesFromLocalStorage = () => {
  // Retrieves the raw string data associated with the 'recentSearches' key.
  const storedSearches = localStorage.getItem('recentSearches');
  // Proceeds only if data actually exists for that key.
  if (storedSearches) {
    // Calculates the timestamp for exactly 24 hours ago to filter out old searches.
    const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000); // Milliseconds in 24 hours
    // A try-catch block is used to handle potential errors if the stored data is not valid JSON.
    try {
      // Parses the JSON string back into a JavaScript array.
      const searches = JSON.parse(storedSearches);
      // Filter out any searches that are older than 24 hours to keep the list fresh.
      // Returns a new array containing only the searches with a timestamp from the last 24 hours.
      return searches.filter(s => s.timestamp && s.timestamp > twentyFourHoursAgo);
    } catch (e) {
      // If parsing fails, logs the error to the console.
      console.error("Error parsing recent searches from localStorage:", e);
      // If parsing fails, the data is likely corrupted. Clear it to prevent further errors.
      // Removes the corrupted item from storage to prevent future errors.
      localStorage.removeItem('recentSearches');
      // Returns an empty array as a safe fallback.
      return [];
    }
  }
  // If no data was found in localStorage, return an empty array.
  return [];
};

/**
 * @function useSearchSuggestions
 * @description An enhanced search suggestions hook that fetches popular and backend suggestions,
 * correctly prioritizes the user's recent search history, and handles dynamic updates.
 */
// This is the main custom hook for managing all search suggestion logic.
export default function useSearchSuggestions(userEmail, isLoggedIn, inputValue, dropOpen) {
  // Core state to hold all types of suggestions.
  // A single state object is used to manage different categories of suggestions.
  const [suggestions, setSuggestions] = useState({
    initial: [],       // Popular suggestions loaded once on mount.
    backend: [],       // Additional suggestions fetched as the user types.
    filtered: [],      // The final, de-duplicated list shown to the user.
    hasMore: true      // A flag for future use (e.g., infinite scroll).
  });

  // A state variable to track whether an API call is currently in progress.
  const [isLoading, setIsLoading] = useState(false);
  
  // Debounces the input value to prevent firing off a network request on every keystroke.
  // Why 240ms? Human reaction time is typically around 200-250ms, so this feels responsive.
  // Utilizes the useDebounce hook to delay updates to the inputValue, reducing API calls.
  const debouncedInputValue = useDebounce(inputValue, 240);
  
  // Refs to track the loading state and avoid redundant fetches.
  // A ref is used to track if the initial popular suggestions have been loaded.
  const initialLoadedRef = useRef(false);
  // A ref to store the last query that was fetched to prevent duplicate API calls for the same text.
  const lastFetchedQueryRef = useRef('');

  // State to hold the user's recent searches, synced with localStorage.
  // This state holds the recent searches and is used to trigger re-renders when they change.
  const [localRecentSearches, setLocalRecentSearches] = useState([]);

  // --- HOOKS ---

  // Effect 1: Initial Data Fetch (runs only once).
  // Fetches the initial "popular" suggestions and the user's recent searches from storage.
  // This useEffect hook is responsible for fetching the initial data when the component mounts.
  useEffect(() => {
    // The check against the ref ensures this logic only runs a single time.
    if (!initialLoadedRef.current) {
      // An async function is defined inside the effect to handle the data fetching.
      const fetchInitialData = async () => {
        try {
          // Sets the loading state to true before starting the API call.
          setIsLoading(true);
          // Step 1: Get recent searches from localStorage on initial load.
          // Populates the recent searches state from our helper function.
          setLocalRecentSearches(getRecentSearchesFromLocalStorage());

          // Step 2: Fetch the general list of popular suggestions from the backend.
          // Calls the search service to get popular suggestions without a specific query.
          const rawData = await searchService.fetchPopularSuggestions(userEmail, '');
          // Formats the raw API data into a standardized structure.
          const formatted = formatSuggestions(rawData);

          // Step 3: Store the raw popular suggestions.
          // FIX: The 'isRecent' flag is NOT applied here. It will be added dynamically in the filtering
          // logic to ensure the UI is always in sync with the latest recent searches.
          // Updates the 'initial' suggestions in the main state object.
          setSuggestions(prev => ({
            ...prev,
            initial: formatted,
          }));

          // Marks the initial load as complete to prevent this effect from running again.
          initialLoadedRef.current = true;
        } catch (error) {
          // Logs any errors that occur during the initial fetch.
          console.error("Failed to fetch initial suggestions:", error);
        } finally {
          // Ensures the loading state is set to false after the operation, regardless of success or failure.
          setIsLoading(false);
        }
      };
      // Invokes the data fetching function.
      fetchInitialData();
    }
  }, [userEmail]); // Dependency on userEmail to refetch if the user changes.

  // Effect 2: Periodic Sync with localStorage.
  // This keeps the component's recent searches in sync if they are changed in another browser tab.
  // This effect sets up a recurring interval to check for changes in localStorage.
  useEffect(() => {
    // Creates an interval that runs a function every 2000 milliseconds (2 seconds).
    const interval = setInterval(() => {
      // Retrieves the latest recent searches from localStorage.
      const refreshedRecent = getRecentSearchesFromLocalStorage();
      // Only update state if the data has actually changed to avoid unnecessary re-renders.
      // Compares the stringified versions of the arrays to efficiently check for differences.
      if (JSON.stringify(refreshedRecent) !== JSON.stringify(localRecentSearches)) {
        // If they are different, the component's state is updated.
        setLocalRecentSearches(refreshedRecent);
      }
    }, 2000); // Checks for changes every 2 seconds.

    // Cleanup function to clear the interval when the component unmounts.
    // This is crucial to prevent memory leaks.
    return () => clearInterval(interval);
  }, [localRecentSearches]); // Depends on localRecentSearches to avoid a stale closure.

  // Function to fetch more suggestions from the backend based on user input.
  // This function is memoized with useCallback to prevent it from being recreated on every render.
  const fetchAdditionalSuggestions = useCallback(async (query) => {
    // Exits early if the query is too short to be meaningful.
    if (!query || query.length < 2) return;
    
    // Avoid fetching the same query multiple times in a row.
    // Checks against the ref to prevent redundant API calls for the same query text.
    if (lastFetchedQueryRef.current === query.toLowerCase()) return;
    
    try {
      // Sets loading state and updates the ref with the current query.
      setIsLoading(true);
      lastFetchedQueryRef.current = query.toLowerCase();
      
      // Makes the API call to fetch suggestions for the specific query.
      const rawData = await searchService.fetchPopularSuggestions(userEmail, query);
      
      // Proceeds only if the API returned valid data.
      if (rawData && rawData.length > 0) {
        // Formats the returned data.
        const formatted = formatSuggestions(rawData);
        // Updates the state with the new suggestions.
        setSuggestions(prev => {
          // TODO: inspect this .id and the syntax -- this will prevent me from feeding data to the sti outside of the id realm and may break the code.
          // Creates a Set of existing suggestion IDs for efficient de-duplication.
          const existingIds = new Set([...prev.initial.map(s => s.stId), ...prev.backend.map(s => s.stId)].filter(Boolean));
          
          // Filters newly fetched suggestions to exclude any items whose IDs already exist.
          // This prevents duplicate entries from appearing in the list.
          const newSuggestions = formatted
            .filter(s => s.stId ? !existingIds.has(s.stId) : true);
          
          // Returns the new state, merging the previous backend suggestions with the new, unique ones.
          return {
            ...prev,
            backend: [...prev.backend, ...newSuggestions]
          };
        });
      }
    } catch (error) {
      // Logs any errors during the fetch.
      console.error("Failed to fetch additional suggestions:", error);
    } finally {
      // Resets the loading state.
      setIsLoading(false);
    }
  }, [userEmail]); // Memoization depends on userEmail.

  // Effect 3: Trigger for Additional Suggestions.
  // Calls the fetch function when the debounced input value changes.
  // This effect acts as a trigger to call the fetch function.
  useEffect(() => {
    // The fetch is only triggered if several conditions are met to ensure efficiency.
    if (debouncedInputValue && 
        debouncedInputValue.length >= 2 && 
        dropOpen && 
        initialLoadedRef.current) {
      fetchAdditionalSuggestions(debouncedInputValue);
    }
  }, [debouncedInputValue, dropOpen, fetchAdditionalSuggestions]); // Runs when these dependencies change.

  // Effect 4: Main Filtering and Sorting Logic (The Core of the Hook).
  // This runs every time the input value or recent searches change, creating the final list to display.
  // This is the primary effect for combining and filtering all suggestion sources into the final list.
  useEffect(() => {
    // Exits early if the dropdown is not open or initial data hasn't loaded yet.
    if (!dropOpen || !initialLoadedRef.current) {
      return;
    }

    // Normalizes the current input value to lowercase for case-insensitive matching.
    const currentInput = (inputValue || "").toLowerCase();

    // Step 1: Prepare the list of recent searches. These are *always* marked as recent.
    // Creates a new array of recent items, adding an 'isRecent' flag to each.
    const recentItems = localRecentSearches.map(s => ({ ...s, isRecent: true }));
    // Filters this list to include only items that match the current input.
    const filteredRecent = recentItems.filter(s =>
      s.label.toLowerCase().includes(currentInput)
    );

    // Step 2: Prepare all other suggestions (initial popular + backend fetched).
    // Combines the initial and backend suggestions into a single source array.
    const otherItems = [...suggestions.initial, ...suggestions.backend];

    // Step 3: Create a Set of recent labels for efficient de-duplication. Using a Set is much faster than array.includes().
    // Creates a Set of recent labels for fast lookups to avoid duplicates.
    const recentLabels = new Set(recentItems.map(item => item.label.toLowerCase()));

    // Step 4: Filter the "other" items to exclude any that are already in the recent list.
    // This is the key fix: it prevents an item from appearing twice (e.g., once as purple/recent, once as normal).
    // Creates a new array of suggestions that are not present in the recent searches list.
    const uniqueOtherItems = otherItems.filter(item => !recentLabels.has(item.label.toLowerCase()));
    // Filters this unique list to include only items that match the current input.
    const filteredOther = uniqueOtherItems.filter(s =>
      s.label.toLowerCase().includes(currentInput)
  );


  // 3. Apply the dynamic count rule.
      // Defines the maximum number of suggestions to show in the dropdown.
      const MAX_TOTAL_SUGGESTIONS = 5;
  // The number of other suggestions to show is 5 minus the number of recent ones shown.
      // Calculates how many non-recent suggestions can be shown to not exceed the max total.
      const numOtherToShow = MAX_TOTAL_SUGGESTIONS - filteredRecent.length;
  
  // 4. Combine the lists according to the new rule.
      // Assembles the final list, prioritizing recent matches.
      const finalSuggestions = [
        ...filteredRecent, // Include all matching recent items.
        ...filteredOther.slice(0, numOtherToShow) // Add the calculated number of other items.
      ];

  // 5. Update the state with the final, correctly sized list.
      // Updates the 'filtered' suggestions in the main state object with the final list.
      setSuggestions(prev => ({
        ...prev,
        filtered: finalSuggestions,
      }));

}, [inputValue, dropOpen, localRecentSearches, suggestions.initial, suggestions.backend]); // Runs when any of these data sources or inputs change.

  // --- RETURNED VALUES ---
  // The hook returns an object with state values and functions to be used by the component.
  return {
    // The final, filtered list of suggestions to be rendered.
    filteredSuggestions: suggestions.filtered,
    // The current loading state.
    isLoading,
    // A flag for potential future features like "load more".
    hasMore: suggestions.hasMore,
    // The function to fetch additional suggestions can be called manually if needed.
    fetchAdditionalSuggestions, // Expose for manual calls if needed.
    // Expose a function to allow other components to instantly refresh recent searches from localStorage.
    // This is used after a user deletes a recent search item.
    // Provides a way for other components to trigger a manual refresh of recent searches.
    refreshRecentSearches: () => {
      setLocalRecentSearches(getRecentSearchesFromLocalStorage());
    },
    // A function to completely reset the hook's state and clear storage.
    // Provides a hard reset capability for the entire hook's state.
    refetch: () => {
      initialLoadedRef.current = false;
      lastFetchedQueryRef.current = '';
      setSuggestions({ initial: [], backend: [], filtered: [], hasMore: true });
      localStorage.removeItem('recentSearches');
      setLocalRecentSearches([]);
    }
  };
}