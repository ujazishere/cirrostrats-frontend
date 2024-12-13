import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

const apiUrl = import.meta.env.VITE_API_URL;

const Input = () => {
  const [airports, setAirports] = useState([]);
  const [flightNumbers, setFlightNumbers] = useState([]);
  const [gates, setGates] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Debounce function
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

  // Fetch initial data
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

  // Handle input changes and fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedInputValue) {
        setFilteredSuggestions([]);
        return;
      }

      const lowercaseInputValue = debouncedInputValue.toLowerCase();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
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
          open={isExpanded}
          options={filteredSuggestions}
          value={selectedValue}
          inputValue={inputValue}
          onChange={(event, newValue) => {
            setSelectedValue(newValue);
            setIsExpanded(false);
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
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