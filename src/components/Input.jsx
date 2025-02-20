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
  const [inlinePrediction, setInlinePrediction] = useState("");

  const minCharsForAutofill = 3;
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Track search keystroke
  const trackSearch = async (searchTerm, submitTerm = null) => {
    // if dev mode is enabled, don't track search
    if (import.meta.env.VITE_ENV === "dev") return;
    // Generate a timestamp
    const timestamp = new Date().toISOString();

    // Determine which email to use: logged‑in user's email(if logged in) or "Anonymous"(if not logged in)
    const emailToTrack = isLoggedIn && userEmail ? userEmail : "Anonymous";

    try {
      // Send the search track to the backend
      await axios.post(`${apiUrl}/track-search`, {
        email: emailToTrack,
        searchTerm,
        submitTerm: submitTerm || null,
        timestamp,
      });
    } catch (error) {
      console.error("Error sending search track to backend:", error);
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
  const debouncedInputValue = useDebounce(inputValue, 300);

  const isUniqueMatch = (input, suggestions) => {
    const matchingSuggestions = suggestions.filter(suggestion => 
      suggestion.label.toLowerCase().startsWith(input.toLowerCase())
    );
    return matchingSuggestions.length === 1;
  };

  // Find and return inline prediction text
  const findInlinePrediction = (input, suggestions) => {
    if (!input) return "";
    
    const lowercaseInput = input.toLowerCase();
    const matchingSuggestion = suggestions.find(suggestion => 
      suggestion.label.toLowerCase().startsWith(lowercaseInput)
    );
    
    if (matchingSuggestion) {
      return matchingSuggestion.label.slice(input.length);
    }
    return "";
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
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedInputValue) {
        setFilteredSuggestions([]);
        setInlinePrediction("");
        return;
      }

      // Track search for each keystroke - runs every 300ms or as assigned
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

      // Merging all filtered results together to show in dropdown
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

      // Fetch from API if no matches found in the dropdown
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    // Track the final submitted search term
    trackSearch(inputValue, searchValue.label);
    console.log('searchValue in handleSubmit', searchValue);
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

  // Handle Tab key for autocompleting the input with the predicted text
  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && inlinePrediction) {
      event.preventDefault();
      const newValue = inputValue + inlinePrediction;
      setInputValue(newValue);
      
      // Find and set matching suggestion
      const matchingSuggestion = filteredSuggestions.find(
        suggestion => suggestion.label.toLowerCase() === newValue.toLowerCase()
      );
      
      if (matchingSuggestion) {
        setSelectedValue(matchingSuggestion);
      }
    }
  };

  return (
    <div className="searchbar-container">
      <form onSubmit={handleSubmit}>
        <Autocomplete
          open={false}
          options={filteredSuggestions}
          value={selectedValue}
          inputValue={inputValue}
          onChange={(event, newValue) => {
            setSelectedValue(newValue);
            if (newValue) {
              setInputValue(newValue.label);
              // Track the selection as both search and submit term
              trackSearch(inputValue, newValue.label);
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
            <div style={{ position: 'relative' }}>
              <TextField
                {...params}
                inputRef={inputRef}
                label="Try searching a gate in newark. Eg. 71x"
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: null,
                  onKeyDown: handleKeyDown,
                }}
              />
              {inlinePrediction && (
                <div
                  style={{
                    position: 'absolute',
                    left: params.InputProps.startAdornment ? 'auto' : '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999',
                    pointerEvents: 'none',
                    whiteSpace: 'pre',
                  }}
                >
                  <span style={{ visibility: 'hidden' }}>{inputValue}</span>
                  <span>{inlinePrediction}</span>
                </div>
              )}
            </div>
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