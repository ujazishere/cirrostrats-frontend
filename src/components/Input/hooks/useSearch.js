import { useState, useEffect } from "react";
import useDebounce from "./useDebounce";
import searchService from "../api/searchservice";
import useFetchSuggestions from "./useFetchSuggestions";

export default function useSearch(userEmail, isLoggedIn) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  // Fetch all search data in one place
  useEffect(() => {
    // if debouncedSearchTerm is empty or less than 3 characters, return early to avoid unnecessary API calls.
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) return;
    setLoading(true);
    
    // Combine all your data fetching here
    const fetchAllData = async () => {
      console.log("Fetching suggestions for:", debouncedSearchTerm);
      try {
        // You can split these into separate API calls if needed
        const {searchSuggestions} = await searchService.fetchMostSearched(
          userEmail,
        );
        
        // Format all suggestions consistently
        const formattedSuggestions = [
          ...airports.map(a => ({ id: `airport-${a.id}`, label: a.name, type: 'Airport' })),
          ...flights.map(f => ({ id: `flight-${f.id}`, label: f.number, type: 'Flight' })),
          ...gates.map(g => ({ id: `gate-${g.id}`, label: g.name, type: 'Gate' }))
        ];
        
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [debouncedSearchTerm, userEmail, isLoggedIn]);
  
  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    loading
  };
}