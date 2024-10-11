import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl: ${apiUrl}`);

const Input = () => {
  const [airports, setAirports] = useState([]);
  const [flightNumbers, setFlightNumbers] = useState([]);
  const [gates, setGates] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [typingTimer, setTypingTimer] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log("Fetching data from backend");
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
          type: "gate",
        }));

        setAirports(airportOptions);
        setFlightNumbers(flightNumberOptions);
        setGates(gateOptions);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);

    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    if (newInputValue.length > 0) {
      const newTimer = setTimeout(() => {
        fetchSuggestions(newInputValue);
      }, 300);
      setTypingTimer(newTimer);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const fetchSuggestions = async (value) => {
    console.log(`Fetching suggestions for: ${value}`);
    const lowercaseValue = value.toLowerCase();

    const filteredAirports = airports.filter(
      (airport) =>
        airport.name.toLowerCase().includes(lowercaseValue) ||
        airport.code.toLowerCase().includes(lowercaseValue)
    );

    const filteredFlightNumbers = flightNumbers.filter((flight) =>
      flight.flightNumber.toLowerCase().includes(lowercaseValue)
    );

    const filteredGates = gates.filter((gate) =>
      gate.gate.toLowerCase().includes(lowercaseValue)
    );

    const filteredSuggestions = [
      ...filteredAirports,
      ...filteredFlightNumbers,
      ...filteredGates,
    ];

    setFilteredSuggestions(filteredSuggestions);
    if (filteredSuggestions.length === 0) {
      console.log("No local matches found. Quering backend");
      try {
        const res = await axios.get(`${apiUrl}/query/airport?search=${value}`);
        const { data } = res;
        console.log("API data since no local matches found: ", data);
      } catch (error) {
        console.error("Error fetching api data from backend: ", error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    console.log("search submit", searchValue);
    navigate("/details", { state: { searchValue } });
  };

  const handleFocus = () => {
    setIsExpanded(true);
    document.querySelector(".navbar").classList.add("hidden");
    document.querySelector(".searchbar-container").classList.add("expanded");
    document.querySelector(".home__title").classList.add("hidden");
    document.querySelector(".google-button").classList.add("hidden");

    const utcElement = document.querySelector(".utc__container");
    if (utcElement) {
      utcElement.classList.add("hidden");
    } else {
      console.log("UTC time element not found");
    }
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTimeout(() => {
        setIsExpanded(false);
        document.querySelector(".navbar").classList.remove("hidden");
        document.querySelector(".searchbar-container").classList.remove("expanded");
        document.querySelector(".home__title").classList.remove("hidden");
        document.querySelector(".google-button").classList.remove("hidden");

        const utcElement = document.querySelector(".utc__container");
        if (utcElement) {
          utcElement.classList.remove("hidden");
          console.log("UTC time element shown");
        } else {
          console.log("UTC time element not found");
        }
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
          onChange={(event, newValue) => {
            setSelectedValue(newValue);
            setIsExpanded(false); // Collapse the dropdown when an option is selected
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
            handleInputChange(event, newInputValue);
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
