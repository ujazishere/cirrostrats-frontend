import { useState, useEffect, useCallback, useRef } from "react";
import useDebounce from "./useDebounce";
import { formatSuggestions, FormattedSuggestion } from "../utils/searchUtils";
import searchService from "../api/searchservice";

interface SuggestionsState {
  initial: FormattedSuggestion[];
  backend: FormattedSuggestion[];
  filtered: FormattedSuggestion[];
  hasMore: boolean;
}

interface UseSearchSuggestionsReturn {
  filteredSuggestions: FormattedSuggestion[];
  isLoading: boolean;
  hasMore: boolean;
  fetchAdditionalSuggestions: (query: string) => Promise<void>;
  refreshRecentSearches: () => void;
  refetch: () => void;
}

/**
 * @function getRecentSearchesFromLocalStorage
 * @description A helper function to safely retrieve and validate recent searches from localStorage.
 * It ensures that the data is not corrupted and filters out any searches older than 24 hours.
 * @returns {Array} An array of recent search objects.
 */
const getRecentSearchesFromLocalStorage = (): FormattedSuggestion[] => {
  const storedSearches = localStorage.getItem("recentSearches");
  if (storedSearches) {
    const twentyFourHoursAgo = new Date().getTime() - 24 * 60 * 60 * 1000; // Milliseconds in 24 hours
    try {
      const searches = JSON.parse(storedSearches);
      // Filter out any searches that are older than 24 hours to keep the list fresh.
      return searches.filter(
        (s: FormattedSuggestion) =>
          s.timestamp && s.timestamp > twentyFourHoursAgo,
      );
    } catch (e) {
      console.error("Error parsing recent searches from localStorage:", e);
      // If parsing fails, the data is likely corrupted. Clear it to prevent further errors.
      localStorage.removeItem("recentSearches");
      return [];
    }
  }
  return [];
};

/**
 * @function useSearchSuggestions
 * @description Search suggestions hook that fetches popular and backend suggestions,
 * correctly prioritizes the user's recent search history, and handles dynamic updates.
 */
export default function useSearchSuggestions(
  userEmail: string,
  _isLoggedIn: boolean,
  inputValue: string,
  dropOpen: boolean,
): UseSearchSuggestionsReturn {
  // Core state to hold all types of suggestions.
  const [suggestions, setSuggestions] = useState<SuggestionsState>({
    initial: [], // Popular suggestions loaded once on mount.
    backend: [], // Additional suggestions fetched as the user types.
    filtered: [], // The final, de-duplicated list shown to the user.
    hasMore: true, // A flag for future use (e.g., infinite scroll).
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Debounces the input value to prevent firing off a network request on every keystroke.
  // Why 240ms? Human reaction time is typically around 200-250ms, so this feels responsive.
  const debouncedInputValue = useDebounce<string>(inputValue, 240);

  // Refs to track the loading state and avoid redundant fetches.
  const initialLoadedRef = useRef<boolean>(false);
  const lastFetchedQueryRef = useRef<string>("");

  // State to hold the user's recent searches, synced with localStorage.
  const [localRecentSearches, setLocalRecentSearches] = useState<
    FormattedSuggestion[]
  >([]);

  // --- HOOKS ---

  // Effect 1: Initial Data Fetch (runs only once).
  // Fetches the initial "popular" suggestions and the user's recent searches from storage.
  useEffect(() => {
    if (!initialLoadedRef.current) {
      const fetchInitialData = async () => {
        try {
          setIsLoading(true);
          // Step 1: Get recent searches from localStorage on initial load.
          setLocalRecentSearches(getRecentSearchesFromLocalStorage());

          // Step 2: Fetch the general list of popular suggestions from the backend.
          const rawData = await searchService.fetchPopularSuggestions(
            userEmail,
            "",
          );
          const formatted = formatSuggestions(rawData);
          // console.log('formatted data', formatted);

          // Step 3: Store the raw popular suggestions.
          // FIX: The 'isRecent' flag is NOT applied here. It will be added dynamically in the filtering
          // logic to ensure the UI is always in sync with the latest recent searches.
          setSuggestions((prev) => ({
            ...prev,
            initial: formatted,
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
  }, [userEmail]); // Dependency on userEmail to refetch if the user changes.

  // Effect 2: Periodic Sync with localStorage.
  // This keeps the component's recent searches in sync if they are changed in another browser tab.
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshedRecent = getRecentSearchesFromLocalStorage();
      // Only update state if the data has actually changed to avoid unnecessary re-renders.
      if (
        JSON.stringify(refreshedRecent) !== JSON.stringify(localRecentSearches)
      ) {
        setLocalRecentSearches(refreshedRecent);
      }
    }, 2000); // Checks for changes every 2 seconds.

    // Cleanup function to clear the interval when the component unmounts.
    return () => clearInterval(interval);
  }, [localRecentSearches]); // Depends on localRecentSearches to avoid a stale closure.

  // Function to fetch more suggestions from the backend based on user input.
  const fetchAdditionalSuggestions = useCallback(
    async (query: string): Promise<void> => {
      if (!query || query.length < 2) return;

      // Avoid fetching the same query multiple times in a row.
      if (lastFetchedQueryRef.current === query.toLowerCase()) return;

      try {
        setIsLoading(true);
        lastFetchedQueryRef.current = query.toLowerCase();

        // TODO: labeling is inappropriate here - 
        const additionalRawData = await searchService.fetchPopularSuggestions(
          userEmail,
          query,
        );
        if (additionalRawData && additionalRawData.length > 0) {
          const formatted = formatSuggestions(additionalRawData);
          setSuggestions((prev) => {
            // TODO: inspect this .id and the syntax -- this will prevent me from feeding data to the sti outside of the id realm and may break the code.
            const existingIds = new Set(
              [
                ...prev.initial.map((s) => s.id),
                ...prev.backend.map((s) => s.id),
              ].filter(Boolean),
            );
            const existingDisplays = new Set(
              [
                ...prev.initial.map((s) => s.display),
                ...prev.backend.map((s) => s.display),
              ].filter(Boolean),
            );

            // Filters newly fetched suggestions to exclude any items whose IDs already exist.
            const newSuggestions = formatted.filter((s) =>  {
              const hasDuplicateId = s.id && existingIds.has(s.id);
              const hasDuplicateDisplay = s.display && existingDisplays.has(s.display);
              return !(hasDuplicateId || hasDuplicateDisplay);
            });

            return {
              ...prev,
              backend: [...prev.backend, ...newSuggestions],
            };
          });
        }
      } catch (error) {
        console.error("Failed to fetch additional suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userEmail],
  );

  // Effect 3: Trigger for Additional Suggestions.
  // Calls the fetch function when the debounced input value changes.
  useEffect(() => {
    if (
      debouncedInputValue &&
      debouncedInputValue.length >= 2 &&
      dropOpen &&
      initialLoadedRef.current
    ) {
      fetchAdditionalSuggestions(debouncedInputValue);
    }
  }, [debouncedInputValue, dropOpen, fetchAdditionalSuggestions]);

  // Effect 4: Main Filtering and Sorting Logic (The Core of the Hook).
  // This runs every time the input value or recent searches change, creating the final list to display.
  useEffect(() => {
    if (!dropOpen || !initialLoadedRef.current) {
      return;
    }

    const currentInput = (inputValue || "").toLowerCase();

    // Step 1: Prepare the list of recent searches. These are *always* marked as recent.
    const recentItems = localRecentSearches.map((s) => ({
      ...s,
      isRecent: true,
    }));
    const filteredRecent = recentItems.filter((s) =>
      s.label.toLowerCase().includes(currentInput),
    );

    // Step 2: Prepare all other suggestions (initial popular + backend fetched).
    const otherItems = [...suggestions.initial, ...suggestions.backend];

    // Step 3: Create a Set of recent labels for efficient de-duplication. Using a Set is much faster than array.includes().
    const recentLabels = new Set(
      recentItems.map((item) => item.label.toLowerCase()),
    );

    // Step 4: Filter the "other" items to exclude any that are already in the recent list.
    // This is the key fix: it prevents an item from appearing twice (e.g., once as purple/recent, once as normal).
    const uniqueOtherItems = otherItems.filter(
      (item) => !recentLabels.has(item.label.toLowerCase()),
    );
    const filteredOther = uniqueOtherItems.filter((s) =>
      s.label.toLowerCase().includes(currentInput),
    );

    // 3. Apply the dynamic count rule.
    const MAX_TOTAL_SUGGESTIONS = 5;
    // The number of other suggestions to show is 5 minus the number of recent ones shown.
    const numOtherToShow = MAX_TOTAL_SUGGESTIONS - filteredRecent.length;

    // 4. Combine the lists according to the new rule.
    const finalSuggestions = [
      ...filteredRecent, // Include all matching recent items.
      ...filteredOther.slice(0, numOtherToShow), // Add the calculated number of other items.
    ];

    // 5. Update the state with the final, correctly sized list.
    setSuggestions((prev) => ({
      ...prev,
      filtered: finalSuggestions,
    }));
  }, [
    inputValue,
    dropOpen,
    localRecentSearches,
    suggestions.initial,
    suggestions.backend,
  ]);

  // --- RETURNED VALUES ---
  return {
    filteredSuggestions: suggestions.filtered,
    isLoading,
    hasMore: suggestions.hasMore,
    fetchAdditionalSuggestions, // Expose for manual calls if needed.
    // Expose a function to allow other components to instantly refresh recent searches from localStorage.
    // This is used after a user deletes a recent search item.
    refreshRecentSearches: () => {
      setLocalRecentSearches(getRecentSearchesFromLocalStorage());
    },
    // A function to completely reset the hook's state and clear storage.
    refetch: () => {
      initialLoadedRef.current = false;
      lastFetchedQueryRef.current = "";
      setSuggestions({ initial: [], backend: [], filtered: [], hasMore: true });
      localStorage.removeItem("recentSearches");
      setLocalRecentSearches([]);
    },
  };
}
