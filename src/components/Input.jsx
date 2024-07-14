import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

const Input = () => {
  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/airports`);
        const { data } = res;
        const options = data.map(d => ({
          value: `${d.name} (${d.code})`,
          label: `${d.name} (${d.code})`,
          name: d.name,
          code: d.code,
          id: d.id,
        }));
        setAirports(options);
      } catch (error) {
        console.error("Error fetching airports:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e, value) => {
    setSearchValue(value ? { ...value } : "");
  };

  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);
    // Log keystrokes to console

    if (newInputValue.length >= 3) {
      console.log(`Keystroke logged: ${newInputValue}`);
      const filtered = airports.filter(airport => 
        airport.name.toLowerCase().includes(newInputValue.toLowerCase()) ||
        airport.code.toLowerCase().includes(newInputValue.toLowerCase())
      );
      setFilteredAirports(filtered);

      try {
        const res = await axios.get(`http://127.0.0.1:8000/airports/airport?search=${newInputValue}`);
        const { data } = res;
        // console.log("API data", data); You can do whatever you want with the data here.
    } catch (error) {
      console.error("Error fetching airport data:", error);
    }

    } else {
      setFilteredAirports([]);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log("searchValue", searchValue);
    // This /details will go into the App.jsx look for the route thenn go the pages/Details.jsx
    navigate("/details", { state: { searchValue } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Autocomplete
        options={filteredAirports}
        onChange={handleChange}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        className="home__input"
        renderInput={(params) => (
          <TextField
            {...params}
            label="Airports"
            margin="normal"
            InputProps={{
              ...params.InputProps,
              endAdornment: null, // This removes the dropdown arrow
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
        disableClearable // This removes the clear button
        forcePopupIcon={false} // This ensures the popup icon (dropdown arrow) is not shown
      />
      <button className="home__search" type="submit">
        Search
      </button>
    </form>
  );
};

export default Input;