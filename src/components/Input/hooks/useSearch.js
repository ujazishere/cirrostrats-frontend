import { useState, useEffect } from "react";
import { getObjectType } from "../utils/getObjectType";
import { typeMap } from "../utils/typeMap";
import { formatSuggestions, matchingSuggestion, fetchAndFilterSuggestions } from "../utils/formatSuggestions";
import useDebounce from "./useDebounce";
import searchService from "../api/searchservice";
import useFetchSuggestions from "./useFetchSuggestions";
// import useTrackSearch from "./useTrackSearch"

/**
 * @function useSearch
 * @description Centralized State Management Hook. Role: Manages all search-related state and logic.
 *      Responsibilities: Combines smaller hooks (useDebounce, useFetchData, useFetchSuggestions, etc.).
 *      Exposes state and handlers to the parent component
 * @param {*} userEmail 
 * @param {*} isLoggedIn 
 * @param {*} debouncedInputValue 
 * @returns 
 */
export default function useSearch(userEmail, isLoggedIn, inputValue, debouncedInputValue, dropOpen) {
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [page, setPage] = useState(0);
  const [filterChange, setFilterChange] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [freshSuggestions, setFreshSuggestions] = useState([]);
  // const searchSuggestions = await searchService.fetchMostSearched(userEmail);

  // Initial fetch 
  useEffect(() => {
    /**
     * Fetches most searched items from backend, formats suggestions,
     * and assigns them to initialSuggestions state.
     * Only triggers once on the initial render of the homepage.
   * @async
   * @function
   * @returns {Promise<void>}
   */
    const fetchMostSearched = async () => {
      // fetches most searched from backend
      const searchSuggestions = await searchService.fetchMostSearched(userEmail, inputValue);
      // Formats suggestions, assigns value,label, type, etc.
      const formattedSuggestions = formatSuggestions(searchSuggestions);
      setInitialSuggestions(formattedSuggestions);
    };

    fetchMostSearched();
  }, [userEmail]);


  // Sets filteredaSuggestions and allSuggestions from initialSuggestions.
  useEffect(() => {
    setFilteredSuggestions(initialSuggestions);
    setAllSuggestions(initialSuggestions);
  }, [initialSuggestions]);


  // This function matches suggestions with dropdown for the live inputValue in search and updates the filteredSuggestions state based on matches
  useEffect(() => {
    if (freshSuggestions.length >= 0) {
      const newfilteredSuggestions = matchingSuggestion(initialSuggestions, inputValue);
      setFilteredSuggestions(newfilteredSuggestions);
      // if the number of suggestions is less than 10 and dropdown is open
      if (newfilteredSuggestions.length < 10 && dropOpen && inputValue) {      // if suggestions are less than 2 and debouncedInputValue is not empty
        // setPage(page + 1);
        // setFilterChange(true);
        console.log('triggering update sug', freshSuggestions.length);
        updateSuggestions();
        // setFilteredSuggestions(freshSuggestions)
      };
    } else {
      console.log('freshSug length else', freshSuggestions.length <= 0);
      console.log('length', freshSuggestions.length);
      setFilteredSuggestions([]);
      setFilteredSuggestions(freshSuggestions);
    }

  
  }, [inputValue, dropOpen]);

  const updateSuggestions = async () =>{
    // TODO- March 7 25. This update suggestion is triggering before filteredSuggestions is updated.
      // Better way to handle it is through the useEffect and state change through filterChange
    // console.log('newfilteredSuggestions less than 10', filteredSuggestions.length);
    setIsLoading(true);
    
    try {
      const { newSuggestions, currentPage, hasMorePages } = 
        await fetchAndFilterSuggestions({
          currentSuggestions: filteredSuggestions,
          inputValue,
          userEmail,
          page,
          searchService
        });
        console.log('updating sugs');
        setFreshSuggestions(newSuggestions);
        setFilteredSuggestions([]);
        setFilteredSuggestions(newSuggestions);
        setPage(currentPage);



      // // Update state with new data
      // setFilteredSuggestions([...filteredSuggestions, ...newSuggestions]);
      // setAllSuggestions(prev => [...new Set([...prev, ...newSuggestions])]);
      // setFilteredSuggestions(newSuggestions);
      
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const updateSuggestions = async () =>{
      // if page is more than or equal to 2 then fetch more suggestions
      if (page >= 2) {
        console.log('newfilteredSuggestions less than 10', filteredSuggestions.length);
        const updatedSuggestions = await searchService.fetchMostSearched(userEmail, null, page, ); // fetch more suggestions

      console.log('page changed', page);
      }
    }
    updateSuggestions();
  }, [filterChange]);



  // Fetch raw query
  useEffect(() => {
    const fetchRawQuery = async (debouncedInputValue) => {
      if (!debouncedInputValue) return;
      // console.log('raw query debouncedInputValue', debouncedInputValue);
      // const searchSuggestions = await searchService.fetchRawQuery(debouncedInputValue);
    }
    fetchRawQuery(debouncedInputValue);
  }, [debouncedInputValue]);



  return {
    filteredSuggestions
  };
}



  // // FetchMore -- This function is supposed to be triggered when the suggestions are running out. 
  // // The idea is to always have something in the dropdown.
  // useEffect(() => {
  //   const updateSuggestions = async () =>{
  //     // console.log('debouncedInputValue', debouncedInputValue);
  //     // if (filteredSuggestions.length < 9) {      // if suggestions are less than 2 and debouncedInputValue is not empty
  //     //   console.log('updating suggestions');
  //     //   setPage(page + 0);
  //     //   console.log('page', page);
  //     //   const updatedSuggestions = await searchService.fetchMostSearched(userEmail, inputValue, page, 49); // fetch more suggestions
  //     //   // if updatedSuggestions is less than 49, increment page. 
  //     //   const formattedSuggestions = formatSuggestions(updatedSuggestions);
  //     // }
  //   }

  //   updateSuggestions();
  // }, [filteredSuggestions]);







