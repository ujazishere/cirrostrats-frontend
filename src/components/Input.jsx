/**
 * This file implements a complex search input component with autocomplete functionality.
 * Features:
 * - Autocomplete for airports, flight numbers, and gates
 * - Debounced search to prevent excessive API calls
 * - Dynamic UI adjustments on focus/blur
 * - Integration with backend API for data fetching
 * - Support for partial matches and highlighting
 * - Responsive design with mobile support
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

// Get API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

const Input = () => {
  // State management for search functionality
  const [airports, setAirports] = useState([]);          // List of all airports
  const [flightNumbers, setFlightNumbers] = useState([]); // List of all flight numbers
  const [gates, setGates] = useState([]);                // List of all gates
  const [filteredSuggestions, setFilteredSuggestions] = useState([]); // Current filtered suggestions
  const [isLoading, setIsLoading] = useState(false);     // Loading state for API calls
  const [inputValue, setInputValue] = useState("");      // Current input value
  const [selectedValue, setSelectedValue] = useState(null); // Currently selected option
  const [isExpanded, setIsExpanded] = useState(false);   // Dropdown expansion state
  const [isFetched, setIsFetched] = useState(false);     // Data fetch status
  
  const minCharsForAutofill = 3;  // Minimum characters needed for autofill
  const navigate = useNavigate();
  const inputRef = useRef(null);

  /**
   * Custom hook for debouncing input value changes
   * Prevents excessive API calls while user is typing
   */
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedInputValue = useDebounce(inputValue, 300);

  /**
   * Checks if there's exactly one matching suggestion for the input
   * Used for auto-selection of unique matches
   */
  const isUniqueMatch = (input, suggestions) => {
    const matchingSuggestions = suggestions.filter(suggestion => 
      suggestion.label.toLowerCase().startsWith(input.toLowerCase())
    );
    return matchingSuggestions.length === 1;
  };

  /**
   * Initial data fetch effect
   * Retrieves airports, flight numbers, and gates from the API
   */
  useEffect(() => {
    const fetchData = async () => {
      if (isFetched || isLoading) return;

      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [resAirports, resFlightNumbers, resGates] = await Promise.all([
          axios.get(`${apiUrl}/airports`),
          axios.get(`${apiUrl}/flightNumbers`),
          axios.get(`${apiUrl}/gates`),
        ]);

        // Format airport data
        const airportOptions = resAirports.data.map((airport) => ({
          value: `${airport.name} (${airport.code})`,
          label: `${airport.name} (${airport.code})`,
          name: airport.name,
          code: airport.code,
          id: airport._id,
          type: "airport",
        }));

        // Format flight number data
        const flightNumberOptions = resFlightNumbers.data.map((f) => ({
          value: f.flightNumber,
          label: f.flightNumber,
          flightNumber: f.flightNumber,
          type: "flightNumber",
        }));

        // Format gate data
        const gateOptions = resGates.data.map((c) => ({
          value: c.Gate,
          label: c.Gate,
          gate: c.Gate,
          flightStatus: c.flightStatus,
          type: "gate",
        }));

        // Update state with formatted data
        setAirports(airportOptions);
        setFlightNumbers(flightNumberOptions);
        setGates(gateOptions);
        setIsFetched(true);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Effect for handling search suggestions
   * Filters local data and fetches from API if needed
   */
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedInputValue) {
        setFilteredSuggestions([]);
        return;
      }

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

      const newFilteredSuggestions = [
        ...filteredAirports,
        ...filteredFlightNumbers,
        ...filteredGates,
      ];

      setFilteredSuggestions(newFilteredSuggestions);

      // Handle auto-selection for unique matches
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

      // Fetch from API if no local matches found
      if (newFilteredSuggestions.length === 0) {
        try {
          const data = await axios.get(`${apiUrl}/query?search=${debouncedInputValue}`);
          if (data.data && data.data.length > 0) {
            setFilteredSuggestions(data.data);
          }
        } catch (error) {
          console.error("Error fetching API data from backend:", error);
        }
      }
    };

    fetchSuggestions();
  }, [debouncedInputValue, airports, flightNumbers, gates]);

  /**
   * Handles form submission
   * Navigates to details page with selected or entered value
   */
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    navigate("/details", { state: { searchValue } });
  };

  /**
   * Handles input focus
   * Expands search bar and hides other UI elements
   */
  const handleFocus = () => {
    setIsExpanded(true);
    const elements = {
      navbar: ".navbar",
      searchbar: ".searchbar-container",
      title: ".home__title",
      googleButton: ".google-button",
      utcContainer: ".utc__container"
    };

    Object.entries(elements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        if (key === "searchbar") {
          element.classList.add("expanded");
        } else {
          element.classList.add("hidden");
        }
      }
    });
  };

  /**
   * Handles input blur
   * Collapses search bar and shows other UI elements
   */
  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTimeout(() => {
        setIsExpanded(false);
        const elements = {
          navbar: ".navbar",
          searchbar: ".searchbar-container",
          title: ".home__title",
          googleButton: ".google-button",
          utcContainer: ".utc__container"
        };

        Object.entries(elements).forEach(([key, selector]) => {
          const element = document.querySelector(selector);
          if (element) {
            if (key === "searchbar") {
              element.classList.remove("expanded");
            } else {
              element.classList.remove("hidden");
            }
          }
        });
      }, 300);
    }
  };

  return (
    <div className="searchbar-container">
      <form onSubmit={handleSubmit}>
        <Autocomplete
          open={isExpanded}
          options={filteredSuggestions}
          value={selectedValue}
          inputValue={inputValue}
          onChange={(event, newValue) => {
            setSelectedValue(newValue);
            if (newValue) {
              setInputValue(newValue.label);
              // Automatically navigate when selecting from dropdown
              navigate("/details", { state: { searchValue: newValue } });
            }
            setIsExpanded(false);
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
            if (!newInputValue) {
              setSelectedValue(null);
            }
            setIsExpanded(true);
          }}
          className="home__input"
          getOptionLabel={(option) => option.label || ""}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={inputRef}
              label="Try searching a gate in newark. Eg. 71x"
              margin="normal"
              InputProps={{
                ...params.InputProps,
                endAdornment: null,
              }}
            />
          )}
          renderOption={(props, option, { inputValue }) => {
            const matches = match(option.label, inputValue, { insideWords: true });
            const parts = parse(option.label, matches);
            return (
              <li {...props}>
                <div>
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        fontWeight: part.highlight ? 700 : 400,
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              </li>
            );
          }}
          noOptionsText="Where are you flying to?"
          filterOptions={(x) => x}
          disableClearable
          forcePopupIcon={false}
          freeSolo
          selectOnFocus
          clearOnBlur={false}
          handleHomeEndKeys
          onFocus={handleFocus}
          onBlur={handleBlur}
          disablePortal
        />
        <button className="home__search" type="submit">
          Search
        </button>
      </form>
    </div>
  );
};

export default Input;