import { useState, useEffect } from "react";
import { getObjectType } from "../utils/getObjectType";
import { typeMap } from "../utils/typeMap";
import { formatSuggestions } from "../utils/formatSuggestions";
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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // const searchSuggestions = await searchService.fetchMostSearched(userEmail);
//   Fetches most searched and sets it to suggestions.
//   Only triggers once on the initial render of the homepage.
  useEffect(() => {
    const fetchMostSearched = async () => {
      // fetches most searched from backend
      const searchSuggestions = await searchService.fetchMostSearched(userEmail, inputValue);
      // Formats suggestions, assigns value,label, type, etc.
      const formattedSuggestions = formatSuggestions(searchSuggestions);
      setInitialSuggestions(formattedSuggestions);
    };

    fetchMostSearched();
  }, [userEmail]);

  // Sets filteredaSuggestions and allSuggestions
  useEffect(() => {
    setFilteredSuggestions(initialSuggestions);
    setAllSuggestions(initialSuggestions);
  }, [initialSuggestions]);


  useEffect(() => {
    const fetchRawQuery = async (debouncedInputValue) => {
      if (!debouncedInputValue) return;
      // console.log('within fetch raw query debouncedInputValue', debouncedInputValue);
      // const searchSuggestions = await searchService.fetchRawQuery(debouncedInputValue);
    }
    fetchRawQuery(debouncedInputValue);
  }, [debouncedInputValue]);


  // FetchMore -- This function is supposed to be triggered when the suggestions are running out. 
  // The idea is to always have something in the dropdown.
  useEffect(() => {
    const updateSuggestions = async () =>{
      // console.log('debouncedInputValue', debouncedInputValue);
      // if (filteredSuggestions.length < 10) {      // if suggestions are less than 2 and debouncedInputValue is not empty
      //   console.log('updating suggestions');
      //   setPage(page + 1);
      //   console.log('page', page);
      //   const updatedSuggestions = await searchService.fetchMostSearched(userEmail, inputValue, page, 50); // fetch more suggestions
      //   // if updatedSuggestions is less than 50, increment page. 
      //   const formattedSuggestions = formatSuggestions(updatedSuggestions);
      // }
    }

    updateSuggestions();
  }, [filteredSuggestions]);

  // This function matches suggestions for the live inputValue in search and updates the filteredSuggestions state based on matches
  useEffect(() => {
    const lowercaseInputValue = inputValue.toLowerCase();
    // Filter local data
    const newfilteredSuggestions = initialSuggestions.filter(
      (searches) =>
        searches.label.toLowerCase().includes(lowercaseInputValue) ||
        searches.label.toLowerCase().includes(lowercaseInputValue)
    );
    // if the number of suggestions is less than 10 and dropdown is open
    if (newfilteredSuggestions.length < 10 && dropOpen) {      // if suggestions are less than 2 and debouncedInputValue is not empty
      setPage(page + 1);
      // console.log('newfilteredSuggestions less than 10', newfilteredSuggestions.length, page);
      //
      // setPage(page + 1// console.log('updating suggestions', newfilteredSuggestions.length, page);
      const updatedSuggestions = searchService.fetchMostSearched(userEmail, inputValue, page); // fetch more suggestions
      // if updatedSuggestions is less than 50, increment page. 
      // const formattedSuggestions = formatSuggestions(updatedSuggestions);
    };

    const updateSuggestions = async () =>{
      // console.log('debouncedInputValue', debouncedInputValue);
      // if (filteredSuggestions.length < 10) {      // if suggestions are less than 2 and debouncedInputValue is not empty
      //   console.log('updating suggestions');
      //   setPage(page + 1);
      //   console.log('page', page);
      //   const updatedSuggestions = await searchService.fetchMostSearched(userEmail, inputValue, page, 50); // fetch more suggestions
      //   // if updatedSuggestions is less than 50, increment page. 
      //   const formattedSuggestions = formatSuggestions(updatedSuggestions);
      // }
    } 
    updateSuggestions();
    setFilteredSuggestions(newfilteredSuggestions);
  
  }, [inputValue, dropOpen]);

  useEffect(() => {
    const updateSuggestions = async () =>{
      // if page is more than or equal to 2 then fetch more suggestions
      if (page >= 2) {
        console.log('newfilteredSuggestions less than 10', page);
        const updatedSuggestions = await searchService.fetchMostSearched(userEmail, null, page, ); // fetch more suggestions

      console.log('page changed', page);
      }
    }
    updateSuggestions();
  }, [page]);
  return {
    filteredSuggestions
  };
}