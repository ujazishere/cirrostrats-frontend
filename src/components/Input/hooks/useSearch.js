import { useState, useEffect } from "react";
import useDebounce from "./useDebounce";
import searchService from "../api/searchservice";
import useFetchSuggestions from "./useFetchSuggestions";
// import useTrackSearch from "./useTrackSearch"

export default function useSearch(userEmail, isLoggedIn, debouncedInputValue) {
    const [searchTerm, setSearchTerm] = useState("");

    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
  
//   Fetch most searched
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

  // Fetch all search data in one place
  useEffect(() => {
    // if debouncedInputValue is empty or less than 3 characters, return early to avoid unnecessary API calls.
    if (!debouncedInputValue || debouncedInputValue.length < 3) return;
    setLoading(true);
    console.log("Fetching suggestions for:", debouncedInputValue);
    // Combine all your data fetching here
    const fetchAllData = async () => {
      console.log("Fetching suggestions for:", debouncedInputValue);
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
//   console.log("Suggestions:", suggestions);
  return {
    searchTerm,
    // setSearchTerm,
    suggestions,
    loading
  };
}