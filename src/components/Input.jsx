import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl${apiUrl}`);

const Input = () => {
  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [typingTimer, setTypingTimer] = useState(null);

  // TODO: This is being run two times
  useEffect(() => {     // UseEffect renders the data from the /airports route right away which returns the mongo db for airports collection.
    async function fetchData() {
      console.log("Fetching data from backend");
      setIsLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/airports`);    // Returns id, name and code as mongo document field keys from the backend using http://127.0.0.1:8000/airports.
        const { data } = res;
        const options = data.map(d => ({
          value: `${d.name} (${d.code})`,   // This value item isnt the most helpful it seems
          label: `${d.name} (${d.code})`,
          name: d.name,
          code: d.code,
          id: d.id,
        }));
        setAirports(options);     // This will set airports to the fetched airports from the backend.
      } catch (error) {
        console.error("Error fetching airports from backend's MongoDB. Check backend server connection:", error);
      } finally {
        setIsLoading(false);    // Once fetch is completed the setLoading is set to false.
      }

      console.log("Done fetching data");
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
      setFilteredAirports([]);
    }
  };

  const fetchSuggestions = async (value) => {
    // TODO: This only includes filters that look into the airport collection. Need it to include flight numbers and gates as well.
    console.log(`Fetching suggestions for: ${value}`);
    const filtered = airports.filter(airport => 
      airport.name.toLowerCase().includes(value.toLowerCase()) ||
      airport.code.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAirports(filtered);

    try {
      // Not sure how or why the `airport` bit in the route is a variable and I cannot change it anything else.
      // Wanted it to be 
      const res = await axios.get(`${apiUrl}/query/airport?search=${value}`);
      
      const { data } = res;
      console.log("API data", data);
    } catch (error) {
      console.error("Error fetching airport data:", error);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    // selectedValue is the mongodb document with value, label, name, code and id
    if (selectedValue) {
      navigate("/details", { state: { searchValue: selectedValue } });
    } else if (inputValue) {
      navigate("/details", { state: { searchValue: inputValue } });
    }
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
      console.log("UTC time element hidden");
    } else {
      console.log("UTC time element not found");
    }
  };

  const handleBlur = (event) => {
    // Check if the related target is within the Autocomplete component
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTimeout(() => {
        setIsExpanded(false);
        document.querySelector(".navbar").classList.remove("hidden");
        document.querySelector(".searchbar-container").classList.remove("expanded");

        // Show additional elements again
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
          options={filteredAirports}
          value={selectedValue}
          onChange={(event, newValue) => {
            setSelectedValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
            handleInputChange(event, newInputValue);
          }}
          className="home__input"
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
            const matches = match(option.name, inputValue, { insideWords: true });
            const parts = parse(option.name, matches);
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