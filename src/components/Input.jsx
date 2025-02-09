import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

// Get API URL from environment variables in .env file
const apiUrl = import.meta.env.VITE_API_URL;

const Input = ({ userEmail, isLoggedIn }) => {
  // State management for search functionality
  const [airports, setAirports] = useState([]);
  const [flightNumbers, setFlightNumbers] = useState([]);
  const [gates, setGates] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  
  const minCharsForAutofill = 3;
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Track search keystroke
  const trackSearch = async (searchTerm) => {
    if (!isLoggedIn || !userEmail) return;

    const timestamp = new Date().toISOString();
    console.log(`Search tracked - User: ${userEmail}, Term: ${searchTerm}, Time: ${timestamp}`);

    try {
      await axios.post("http://localhost:8000/track-search", {
        email: userEmail,
        searchTerm,
        timestamp,
      });
    } catch (error) {
      console.error("Error tracking search:", error);
    }
  };

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

  // Debounced input value. used to limit the rate of function calls.
  // For example, when typing in a search box, you might not want to trigger an API request on every keystroke,
  // as this could lead to unnecessary calls. Instead, 
  // you can use a debounce hook to wait until the user has stopped typing for a specific delay (e.g., 300ms), and then perform the action
  const debouncedInputValue = useDebounce(inputValue, 300);

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
  useEffect(() => {       // fetching data from backend - airports, flight numbers, gates for search dropdown selection
    const fetchData = async () => {
      if (isFetched || isLoading) return;

      setIsLoading(true);
      try {
        // TODO: This needs to be changed such that the data fetched is incremental instead of lumpsum
        // Fetch all data in parallel
        const [resAirports, resFlightNumbers, resGates] = await Promise.all([
          axios.get(`${apiUrl}/airports`),
          axios.get(`${apiUrl}/flightNumbers`),
          axios.get(`${apiUrl}/gates`),
        ]);

        const airportOptions = resAirports.data.map((airport) => ({
          value: `${airport.name} (${airport.code})`,
          label: `${airport.name} (${airport.code})`,
          name: airport.name,
          code: airport.code,
          id: airport._id,
          type: "airport",
        }));

        const flightNumberOptions = resFlightNumbers.data.map((f) => ({
          value: f.flightNumber,
          label: f.flightNumber,
          flightNumber: f.flightNumber,
          type: "flightNumber",
        }));

        const gateOptions = resGates.data.map((c) => ({
          value: c.Gate,
          label: c.Gate,
          gate: c.Gate,
          flightStatus: c.flightStatus,
          type: "gate",
        }));

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
   * Filters local data for matches and shows in dropdown and talks to API if no matches found.
   */
  useEffect(() => {       // this useEffect is running every 300ms
    const fetchSuggestions = async () => {
      if (!debouncedInputValue) {
        setFilteredSuggestions([]);
        return;
      }

      // Track search for each keystroke
      trackSearch(debouncedInputValue);
      console.log('debouncedInputValue', debouncedInputValue);

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

      // Merging all filtered results together to show in dropdown
      const newFilteredSuggestions = [
        ...filteredAirports,
        ...filteredFlightNumbers,
        ...filteredGates,
      ];

      setFilteredSuggestions(newFilteredSuggestions);

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

      // Fetch from API if no matches found in the dropdown
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
  }, [debouncedInputValue, airports, flightNumbers, gates, userEmail, isLoggedIn]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    console.log('searchValue in handleSubmit', searchValue); // Log searchValue
    navigate("/details", { state: { searchValue } });
  };

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
          open={isExpanded} // Controls whether the dropdown is open
          options={filteredSuggestions} // List of suggestions shown in the dropdown
          value={selectedValue} // The selected item from the dropdown
          inputValue={inputValue} // The current text in the input field
          onChange={(event, newValue) => { // Handles selection from the dropdown
            setSelectedValue(newValue);
            if (newValue) {
              setInputValue(newValue.label);
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