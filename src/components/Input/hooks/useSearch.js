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
    const [suggestions, setSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([suggestions]);
    const [loading, setLoading] = useState(false);
    // const searchSuggestions = await searchService.fetchMostSearched(userEmail);


//   Fetches most searched and sets it to suggestions.
//   Only triggers once on the initial render of the homepage.
  useEffect(() => {
    const fetchMostSearched = async () => {
      const searchSuggestions = await searchService.fetchMostSearched(userEmail);
      const formattedSuggestions = Object.keys(searchSuggestions).map(key => ({
        id: key,
        label: key,
        type: searchSuggestions[key].id ? 'Airport' : 'Terminal/Gate', // Optional
        mdb: searchSuggestions[key].id,
        count: searchSuggestions[key].count, // Optional
        fuzzyFind: searchSuggestions[key].fuzzyFind // Optional (if available)
      }));
        setSuggestions(formattedSuggestions);
    };

    fetchMostSearched();
  }, [userEmail]);


  // Fetch other search data. currently unused.
  useEffect(() => {
    // if debouncedInputValue is empty or less than 3 characters, return early to avoid unnecessary API calls.
    if (!debouncedInputValue || debouncedInputValue.length < 3) return;
    setLoading(true);
    // console.log("Fetching suggestions for:", debouncedInputValue);
    // Combine all your data fetching here
    const fetchAllData = async () => {
      // console.log("Fetching suggestions for:", debouncedInputValue);
      try {
        // You can split these into separate API calls if needed
        // const {searchSuggestions} = await searchService.fetchMostSearched(
        //   userEmail,
        // );
        console.log("Fetching suggestions for:", debouncedInputValue);
        
        // Format all suggestions consistently
        // const formattedSuggestions = [
        //   ...airports.map(a => ({ id: `airport-${a.id}`, label: a.name, type: 'Airport' })),
        //   ...flights.map(f => ({ id: `flight-${f.id}`, label: f.number, type: 'Flight' })),
        //   ...gates.map(g => ({ id: `gate-${g.id}`, label: g.name, type: 'Gate' }))
        // ];
        
        // setSuggestions(formattedSuggestions);
        // setSuggestions(searchSuggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [debouncedInputValue, userEmail, isLoggedIn]);


  // This function is supposed to be triggered when the suggestions are running out. 
  // The idea is to always have something in the dropdown.
  useEffect(() => {
    const updateSuggestions = () =>{
      console.log("filteredSuggestions length", filteredSuggestions.length);
      // console.log('debouncedInputValue', debouncedInputValue);
      if (filteredSuggestions.length < 3 && debouncedInputValue) {      // if suggestions are less than 2 and debouncedInputValue is not empty
        const flights = searchService.fetchJmsuggestions();
        const trimmedFlightNumbers = flights.flightNumbers.slice(0, 50);     // A samle array for testing.
        // const parsedFlightNumbersData = JSON.parse(JSON.stringify(flights));
        console.log("trimmed", (trimmedFlightNumbers));
        // append to suggestions:
        console.log("sugg",typeof filteredSuggestions);
        const flightNumberSuggestions = trimmedFlightNumbers.map(flightNumber => ({
          id: flightNumber,
          label: flightNumber,
          type: 'Flight Number'
        }));
        setFilteredSuggestions(filteredSuggestions => [...filteredSuggestions, ...flightNumberSuggestions]);
        console.log("filteredSuggestions fetched", filteredSuggestions);

      }
    }

    updateSuggestions();
  }, [filteredSuggestions]);


  // This function matches suggestions for the live inputValue in search and updates the filteredSuggestions state based on matches
  useEffect(() => {
    const lowercaseInputValue = inputValue.toLowerCase();

    // Filter local data
    const filteredSuggestions = suggestions.filter(
      (searches) =>
        // searches.label.toLowerCase().includes(lowercaseInputValue) ||
        searches.label.toLowerCase().includes(lowercaseInputValue)
    );

    setFilteredSuggestions(filteredSuggestions);
    console.log("debouncedInputValue in useEffect", debouncedInputValue);
  }, [inputValue, suggestions]);


  return {
    suggestions,
    filteredSuggestions,
  };
}