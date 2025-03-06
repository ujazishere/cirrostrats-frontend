import { useState, useEffect } from "react";
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
export default function useSearch(userEmail, isLoggedIn, inputValue, debouncedInputValue) {
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  // const searchSuggestions = await searchService.fetchMostSearched(userEmail);


//   Fetches most searched and sets it to suggestions.
//   Only triggers once on the initial render of the homepage.
  useEffect(() => {
    const fetchMostSearched = async () => {
      const searchSuggestions = await searchService.fetchMostSearched(userEmail, inputValue);
      const typeMap = {
        flightNumber: 'flightNumber',
        name: 'airport',
        Gate: 'gate',
      };
      //prone to errors what if mdb fields change?
      const getObjectType = (obj) => {
        if (obj.name && obj.code) return 'name';  // It's an airport
        if (obj.flightNumber) return 'flightNumber';  // It's a flight
        if (obj.Gate) return 'Gate';  // It's a gate
        return null;
      };
      const formattedSuggestions = Object.keys(searchSuggestions).map(eachItem => ({
        id: searchSuggestions[eachItem]._id,
        label: searchSuggestions[eachItem].flightNumber
          ? searchSuggestions[eachItem].flightNumber.startsWith('GJS')
            ? `UA${searchSuggestions[eachItem].flightNumber.slice(3)} (${searchSuggestions[eachItem].flightNumber})`
            : searchSuggestions[eachItem].flightNumber
          : `${searchSuggestions[eachItem].name} (${searchSuggestions[eachItem].code})`,
        type: typeMap[getObjectType(searchSuggestions[eachItem])],
        // count: searchSuggestions[eachItem].count, // Optional
        // fuzzyFind: searchSuggestions[eachItem].fuzzyFind // Optional (if available)
      }));
      console.log("formattedSuggestions", formattedSuggestions);
      setInitialSuggestions(formattedSuggestions);
    };

    fetchMostSearched();
  }, [userEmail]);


  useEffect(() => {
    setFilteredSuggestions(initialSuggestions);
    setAllSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  // This function matches suggestions for the live inputValue in search and updates the filteredSuggestions state based on matches
  useEffect(() => {
    const lowercaseInputValue = inputValue.toLowerCase();
    // Filter local data
    const newfilteredSuggestions = allSuggestions.filter(
      (searches) =>
        searches.label.toLowerCase().includes(lowercaseInputValue) ||
        searches.label.toLowerCase().includes(lowercaseInputValue)
    );

    setFilteredSuggestions(newfilteredSuggestions);

  }, [inputValue]);

  // useEffect(() => {
  //   const fetchRawQuery = async (debouncedInputValue) => {
  //     const searchSuggestions = await searchService.fetchRawQuery(debouncedInputValue);
  //   }
  //   fetchRawQuery(debouncedInputValue);
  // }, [debouncedInputValue]);


  // FetchMore -- This function is supposed to be triggered when the suggestions are running out. 
  // The idea is to always have something in the dropdown.
  useEffect(() => {
    const updateSuggestions = () =>{
      // console.log('debouncedInputValue', debouncedInputValue);
      if (filteredSuggestions.length < 10 && debouncedInputValue) {      // if suggestions are less than 2 and debouncedInputValue is not empty
        console.log('updating suggestions');
        const flights = searchService.fetchJmsuggestions();
        const trimmedFlightNumbers = flights.flightNumbers.slice(0, 50);     // A samle array for testing.
        // setFilteredSuggestions(xx => [...filteredSuggestions, ...fetchedSuggestions]);
        // append to suggestions:
        const flightNumberSuggestions = trimmedFlightNumbers.map(flightNumber => ({
          id: flightNumber,
          label: flightNumber,
          type: 'flightNumber'
        }));
        setFilteredSuggestions(xx => [...filteredSuggestions, ...flightNumberSuggestions]);
        // setAllSuggestions(xx => [...allSuggestions, ...flightNumberSuggestions]);
      }
    }

    updateSuggestions();
  }, [filteredSuggestions]);

  // console.log("filteredSuggestions outside of ue", filteredSuggestions);

  return {
    filteredSuggestions
  };
}