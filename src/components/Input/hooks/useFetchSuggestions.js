import React, { useState, useEffect } from "react";
// Custom hook for debouncing input value changes
const useFetchSuggestions = (debouncedInputValue, airports, flightNumbers, gates, userEmail, isLoggedIn) => {
  useEffect(() => {
    // Function to fetch suggestions. Runs depending on debounced input value,
    const fetchSuggestions = async () => {
      if (!debouncedInputValue) {
        setFilteredSuggestions([]);
        setInlinePrediction("");
        return;
      }

      // Track search for each keystroke
      trackSearch(debouncedInputValue);

      const lowercaseInputValue = debouncedInputValue.toLowerCase();

      // Filter local data
      const filteredAirports = airports.filter(
        (airport) =>
          airport.name.toLowerCase().includes(lowercaseInputValue) ||
          airport.code.toLowerCase().includes(lowercaseInputValue)
      );

      const filteredFlightNumbers = flightNumbers.filter((flight) =>
        flight.flightNumber.toLowerCase().includes(lowercaseInputValue)
      );

      const filteredGates = gates.filter((gate) =>
        gate.gate.toLowerCase().includes(lowercaseInputValue)
      );

      // Merge all filtered results
      const newFilteredSuggestions = [
        ...filteredAirports,
        ...filteredFlightNumbers,
        ...filteredGates,
      ];

      setFilteredSuggestions(newFilteredSuggestions);

      // Update inline prediction
      const prediction = findInlinePrediction(debouncedInputValue, newFilteredSuggestions);
      setInlinePrediction(prediction);

      if (debouncedInputValue.length >= minCharsForAutofill && newFilteredSuggestions.length > 0) {
        if (isUniqueMatch(debouncedInputValue, newFilteredSuggestions)) {
          const exactMatch = newFilteredSuggestions.find(suggestion => 
            suggestion.label.toLowerCase().startsWith(lowercaseInputValue)
          );
          
          if (exactMatch) {
            setSelectedValue(exactMatch);
            setIsExpanded(true);
          }
        } else {
          setSelectedValue(null);
        }
      }

      // Fetch from API if no matches found
      if (newFilteredSuggestions.length === 0) {
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
  }, [debouncedInputValue, airports, flightNumbers, gates, userEmail, isLoggedIn]);

  return { filteredSuggestions, inlinePrediction, selectedValue, isExpanded };
};

export default useFetchSuggestions;