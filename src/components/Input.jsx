import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl${apiUrl}`)

const Input = () => {
  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/airports`);
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
        console.error("Error fetching airports from backend's MongoDB. Check backend server connection:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);


  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 3) {
      console.log(`Keystroke logged: ${newInputValue}`);
      const filtered = airports.filter(airport => 
        airport.name.toLowerCase().includes(newInputValue.toLowerCase()) ||
        airport.code.toLowerCase().includes(newInputValue.toLowerCase())
      );
      setFilteredAirports(filtered);

      try {
        // airport is the optional parameter its not serving any good purpose at the moment check backend route in route.py for explanation.
        const res = await axios.get(`http://127.0.0.1:8000/query/airport?search=${newInputValue}`);
        const { data } = res;
        console.log("API data", data); // You can do whatever you want with the data here.
    } catch (error) {
      console.error("Error fetching airport data:", error);
    }

    } else {
      setFilteredAirports([]);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (selectedValue) {
      navigate("/details", { state: { searchValue: selectedValue } });
    } else if (inputValue) {
      navigate("/details", { state: { searchValue: inputValue } });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Autocomplete
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
      />
      <button className="home__search" type="submit">
        Search
      </button>
    </form>
  );
};

export default Input;
