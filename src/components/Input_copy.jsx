import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

// Separate component for search history suggestions
const SearchHistorySuggestions = ({ userEmail, isVisible, onSuggestionClick }) => {
  const [topSearches, setTopSearches] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTopSearches = async () => {
      if (!userEmail || !isVisible) return;

      try {
        const response = await axios.get(`${apiUrl}/searches/${userEmail}`, {
          params: { email: userEmail, limit: 5 }
        });
        setTopSearches(response.data);
      } catch (error) {
        console.error('Error fetching top searches:', error);
      }
    };

    fetchTopSearches();
  }, [userEmail, isVisible]);

  if (!isVisible || !userEmail || topSearches.length === 0) return null;

  return (
    <div className="absolute w-full bg-white shadow-lg rounded-md mt-1 border border-gray-200 z-50">
      <div className="p-2 text-sm text-gray-500">Recent Searches</div>
      <ul className="divide-y divide-gray-100">
        {topSearches.map((search, index) => (
          <li 
            key={index}
            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
            onClick={() => onSuggestionClick(search.searchTerm)}
          >
            <span className="text-gray-400 mr-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="text-gray-700">{search.searchTerm}</span>
            <span className="text-gray-400 text-sm ml-auto">
              {search.count} searches
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

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
  const trackSearch = async (searchTerm, submitTerm = null, searchId = null) => {
    // if dev mode is enabled, don't track search
    if (import.meta.env.VITE_ENV === "dev") return;
    // Generate a timestamp
    const timestamp = new Date().toISOString();

    // Determine which email to use: logged‑in user's email(if logged in) or "Anonymous"(if not logged in)
    const emailToTrack = isLoggedIn && userEmail ? userEmail : "Anonymous";
    
    try {
      // Send the search track to the backend
      await axios.post(`${apiUrl}/searches/track`, {
        email: emailToTrack,
        searchTerm,
        submitTerm: submitTerm || null,
        searchId: searchId || null,
        timestamp,
      });
    } catch (error) {
      console.error("Error sending search track to backend:", error);
    }
  };

  // Custom hook for debouncing input value changes
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

  // Debounced input value
  const debouncedInputValue = useDebounce(inputValue, 300);

  /**
   * Initial data fetch effect
   * Retrieves airports, flight numbers, and gates from the API when homepage is requested initially.
   * Data is used for search dropdown selection
   */
  useEffect(() => {
    const fetchData = async () => {
      if (isFetched || isLoading) return;

      setIsLoading(true);
      try {
        // TODO: This needs to be changed such that the data fetched is incremental instead of lumpsum
        // This section fetches all data in parallel.
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
   * Effect for handling search suggestions(Drop down suggestions)
   * Filters local data for matches and shows in dropdown and talks to API if no matches found.
   */
  useEffect(() => {
    // Function to fetch suggestions. Runs depending on debounced input value,
    const fetchSuggestions = async () => {
      if (!debouncedInputValue) {
        setFilteredSuggestions([]);
        setInlinePrediction("");
        return;
      }

      // Track search for each keystroke
      trackSearch(debouncedInputValue, null, null);

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



  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    trackSearch(inputValue, searchValue.label, searchValue.id ? searchValue.id : null);
    navigate("/details", { state: { searchValue } });
  };

  const handleSuggestionClick = (searchTerm) => {
    setInputValue(searchTerm);
    const matchingSuggestion = filteredSuggestions.find(
      suggestion => suggestion.label.toLowerCase() === searchTerm.toLowerCase()
    );
    if (matchingSuggestion) {
      setSelectedValue(matchingSuggestion);
      navigate("/details", { state: { searchValue: matchingSuggestion } });
    }
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

  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && inlinePrediction) {
      event.preventDefault();
      const newValue = inputValue + inlinePrediction;
      setInputValue(newValue);
      
      const matchingSuggestion = filteredSuggestions.find(
        suggestion => suggestion.label.toLowerCase() === newValue.toLowerCase()
      );
      
      if (matchingSuggestion) {
        setSelectedValue(matchingSuggestion);
      }
    }
  };

  return (
    <div className="searchbar-container relative">
      <form onSubmit={handleSubmit}>
        <Autocomplete
          open={true}     // Controls whether the Autocomplete dropdown is open or closed
          options={filteredSuggestions} // list of filtered dropdown items
          value={selectedValue}
          inputValue={inputValue}       // The current text input value in the Autocomplete
          onInputChange={(event, newInputValue) => {
            // This function is called whenever the input text changes
            setInputValue(newInputValue);
            if (!newInputValue) {
              setSelectedValue(null);
            }
            setIsExpanded(true);
          }}
          onChange={(event, newValue) => {
            // This function is called when the user selects a value from the dropdown
            setSelectedValue(newValue);
            if (newValue) {
              setInputValue(newValue.label);
              trackSearch(newValue.label, newValue.label, newValue.id ? newValue.id : null);
              navigate("/details", { state: { searchValue: newValue } });
            }
            setIsExpanded(false);
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
              {/* {inlinePrediction && (
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
              )} */}
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
          // Custom message when no options match user input
          noOptionsText="Where are you flying to?"
          
          // Custom filtering function (identity function disables filtering)
          filterOptions={(x) => x}
          
          // Hide clear button
          disableClearable
          
          // Hide popup icon (dropdown arrow)
          forcePopupIcon={false}
          
          // Allow free text input (not just select from options)
          freeSolo
          
          // Automatically select input text when focused
          selectOnFocus
          
          // Prevent clearing input on blur
          clearOnBlur={false}
          
          // Enable Home/End key navigation
          handleHomeEndKeys
          
          // Custom focus event handler
          onFocus={handleFocus}
          
          // Custom blur event handler
          onBlur={handleBlur}
          
          // Render popup inline (instead of portal)
          disablePortal

          // noOptionsText="Where are you flying to?"
          // filterOptions={(x) => x}
          // disableClearable
          // forcePopupIcon={false}
          // freeSolo
          // selectOnFocus
          // clearOnBlur={false}
          // handleHomeEndKeys
          // onFocus={handleFocus}
          // onBlur={handleBlur}
          // disablePortal
        />

        {/* Search History Suggestions */}
        {isLoggedIn && (
          <SearchHistorySuggestions
            userEmail={userEmail}
            isVisible={isExpanded}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        <button className="home__search" type="submit">
          Search
        </button>
      </form>
    </div>
  );
};

export default Input;