import React, { useState, useEffect } from "react";
import useTrackSearch from "./useTrackSearch";
// Custom hook for debouncing input value changes
const useFetchSuggestions = (debouncedInputValue, searchSuggestions, userEmail, isLoggedIn) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState(Object.keys(searchSuggestions));
  const [isLoading, setIsLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  
  useEffect(() => {
    // Function to fetch suggestions. Runs depending on debounced input value,
    const fetchSuggestions = async () => {
      if (!debouncedInputValue) {
        // setFilteredSuggestions(Object.keys(searchSuggestions));
        // setInlinePrediction("");
        return;
      }
      
      // TODO: Search
      // Track search for each keystroke
      // useTrackSearch(debouncedInputValue);
      
      const lowercaseInputValue = debouncedInputValue.toLowerCase();
      
      const filtered = Object.keys(searchSuggestions).filter(
        (airportName) => airportName.toLowerCase().includes(lowercaseInputValue)
      );

      setFilteredSuggestions(filtered);
      console.log("Filtered Suggestions:", filtered.length);
      // Filter local data
      // const filteredAirports = searchSuggestions.filter(
      //   (searchItem) =>
      //     searchItem.name.toLowerCase().includes(lowercaseInputValue) ||
      //     searchItem.code.toLowerCase().includes(lowercaseInputValue)
      // );

      // const filteredFlightNumbers = flightNumbers.filter((flight) =>
      //   flight.flightNumber.toLowerCase().includes(lowercaseInputValue)
      // );

      // const filteredGates = gates.filter((gate) =>
      //   gate.gate.toLowerCase().includes(lowercaseInputValue)
      // );

      // // Merge all filtered results
      // const newFilteredSuggestions = [
      //   ...filteredAirports,
      //   ...filteredFlightNumbers,
      //   ...filteredGates,
      // ];

      // Update inline prediction
      // const prediction = findInlinePrediction(debouncedInputValue, newFilteredSuggestions);
      // setInlinePrediction(prediction);

      // if (debouncedInputValue.length >= minCharsForAutofill && newFilteredSuggestions.length > 0) {
      //   if (isUniqueMatch(debouncedInputValue, newFilteredSuggestions)) {
      //     const exactMatch = newFilteredSuggestions.find(suggestion => 
      //       suggestion.label.toLowerCase().startsWith(lowercaseInputValue)
      //     );
          
      //     if (exactMatch) {
      //       setSelectedValue(exactMatch);
      //       setIsExpanded(true);
      //     }
      //   } else {
      //     setSelectedValue(null);
      //   }
      // }

      // Fetch from API if no matches found
      if (filtered.length === 0) {
        try {
          const data = await axios.get(`${apiUrl}/query?search=${debouncedInputValue}`);
          trackSearch(debouncedInputValue);
          if (data.data && data.data.length > 0) {
            setFilteredSuggestions(data.data);
            const apiPrediction = findInlinePrediction(debouncedInputValue, data.data);
            setInlinePrediction(apiPrediction);
          }
        } catch (error) {
          console.error("Error fetching API data from backend:", error);
        }
      }
    };

    fetchSuggestions();
  }, [debouncedInputValue, userEmail, isLoggedIn]);

  return {filteredSuggestions};
};

export default useFetchSuggestions;