import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import { debounce } from 'lodash';

const Input = () => {

  const [query, setQuery] = useState('');     
  const [results, setResults] = useState([]);     
  const [airports, setAirports] = useState([]);     
  const [filteredAirports, setFilteredAirports] = useState([]);     // filteredAirports is an empty array and setFilteredAirports is filling it up with search matches of all airports
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [inputValue, setInputValue] = useState("");         // handeling key strokes into the searchbar.
  const navigate = useNavigate();

  useEffect(() => {
    // This runs as soon as the homepage page loads up. It will load up all the airports from the backend's mongodb for use in react.
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
        console.error("Error fetching airports from backend's MongoDB. Check backend server connection:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // This is called when an option from the auto complete is selected
  const handleChange = (e, value) => {
    setSearchValue(value ? { ...value } : "");    // `?` operator checks if value is truthy. kinda like if statement. sets that to searchValue if it is, else sets to empty "".
  };

  // newInputValue are the keystrokes. The following function is ran for 3 or more key strokes.
  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 3) {
      console.log(`Keystroke logged: ${newInputValue}`);
      const filtered = airports.filter(airport => 
        airport.name.toLowerCase().includes(newInputValue.toLowerCase()) ||
        airport.code.toLowerCase().includes(newInputValue.toLowerCase())
      );
      // before this above code the `filtered`object is none but then its populated with airports that match the newInputValue
      setFilteredAirports(filtered);

      try {
        // airport is the optional parameter its not serving any good purpose at the moment check backend route in route.py for explanation.
        const res = await axios.get(`http://127.0.0.1:8000/search/airport?search=${newInputValue}`);
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
            label="Try searching a gate in newark. Eg. 71x"
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