import { useState, useEffect, useCallback } from "react";
import { formatSuggestions, matchingSuggestion, fetchAndFilterSuggestions } from "../utils/formatSuggestions";
import useDebounce from "./useDebounce";
import searchService from "../api/searchservice";
// import useTrackSearch from "./useTrackSearch"

/**
 * @function useSearch
 * @description Centralized State Management Hook. Role: Manages all search-related state and logic.
 *      Responsibilities: Combines smaller hooks (useDebounce, useFetchData, etc.).
 *      Exposes state and handlers to the parent component
 * @param {*} userEmail 
 * @param {*} isLoggedIn 
 * @param {*} debouncedInputValue 
 * @returns 
 */
export default function useSearchSuggestions(userEmail, isLoggedIn, inputValue, dropOpen) {

  const [suggestions, setSuggestions] = useState({
    initial: [],       // Popular suggestions loaded once
    filtered: [],      // Currently displayed suggestions
    backend: [],       // Suggestions from backend search
    hasMore: true      // Whether more suggestions might be available
  });

  const [isloading, setIsLoading] = useState(false);
  let debounceDelay = 1000
  const debouncedInputValue = useDebounce(inputValue, debounceDelay);

  const formatAndSetSuggestions = useCallback((rawSuggestions, source) => {
    const formatted = formatSuggestions(rawSuggestions || []);
    setSuggestions(prev => ({
      ...prev,
      [source]: formatted,
      filtered: source === 'initial' 
        ? matchingSuggestion(formatted, inputValue)
        : [...prev.filtered, ...formatted]
    }));
  }, [inputValue]);

  const [freshSuggestions, setFreshSuggestions] = useState([]);
   const [hasRawLength, sethasRawLength] = useState(null);

  // Initial fetch of popular suggestions : Triggered only once on the initial render of the homepage.
  useEffect(() => {
    /**
     * Fetches most searched items from backend, formats suggestions and sets suggestions state.
   * @async
   * @function
   * @returns {Promise<void>}
   */
    const fetchPopularSuggestions = async () => {
      const rawData = await searchService.fetchPopularSuggestions(userEmail, inputValue);
      // Formats suggestions, assigns value,label, type, etc and sets the filtered suggestions.
      formatAndSetSuggestions(rawData, 'initial');
    };

    fetchPopularSuggestions();
  }, [userEmail]);


  // This function matches suggestions with dropdown for the live inputValue in search and updates the filteredSuggestions state based on matches
  useEffect(() => {
    if (dropOpen){
      setSuggestions(prev => ({
        ...prev,
        filtered: matchingSuggestion([...prev.initial, ...prev.backend], inputValue)
      }));
    }
  }, [inputValue, dropOpen]);

  // 
  useEffect(()=> {
    if (dropOpen && suggestions.filtered.length < 5) {
      console.log('loggind div');
      updateSuggestions();
    };
    
  },[suggestions.filtered])

  useEffect(()=> {
    // Should be triggered when rawSuggestions initial suggestions run out.
    if (dropOpen && hasRawLength < 5) {
      // updateSuggestions();
    };
    
  },[debouncedInputValue && hasRawLength])

  const updateSuggestions = async () =>{
    setIsLoading(true);
    try {
      // let newSuggestions = null
      // console.log('updating suggestions');
      const { newSuggestions, rawSuggestionsLength} = 
        await fetchAndFilterSuggestions({
          inputValue,
          userEmail,
          searchService
        });
        // updating the state
        console.log('ns l', newSuggestions.length);
        // console.log('rs l', rawSuggestionsLength);
        if (newSuggestions){
          formatAndSetSuggestions(newSuggestions,'initial')
        };

    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    filteredSuggestions: suggestions.filtered
  };
}
