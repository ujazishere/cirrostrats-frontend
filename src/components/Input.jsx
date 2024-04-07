import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

//use material ui to search and filter when the data is large
//send request each key stroke for now in future use debounce delays the request by a time frame
const Input = () => {
  const [airports, setAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const res = await axios.get(`http://127.0.0.1:8000/airports`); //replace dep_dest with above endpoints as needed

      if (!res.status === 200) {
        throw new Error("network error occured");
      }

      const { data } = res;

      const options = data.map(d => ({
        value: `${d.name} (${d.code})`,
        label: `${d.name} (${d.code})`,
        name: d.name,
        code: d.code,
        id: d.id,
      }));

      setAirports(options);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (e, value) => {
    // if (e === null) {
    //   setSearchValue("");
    //   return;
    // }
    setSearchValue({ ...value });
  };

  const handleInputChange = async (inputValue, e) => {
    if (e === "") {
      return;
    }

    const res = await axios.get(`http://127.0.0.1:8000/airports/airport?search=${e}`);
    const { data } = res;
    console.log("data", data);
  };
  const handleSubmit = e => {
    e.preventDefault();
    console.log("searchValue", searchValue);
    //pass the seach value here, details will fetch the data from api and render it
    navigate("/details", { state: { searchValue } });
  };

  return (
    <form action="" onSubmit={handleSubmit}>
      {/* <label htmlFor="Check weather, gate and flight information"></label> */}
      {/* <input type="text" className="home__input" onChange={handleChange} /> */}
      <Autocomplete
        options={airports}
        onChange={handleChange}
        autoComplete
        onInputChange={handleInputChange}
        className="home__input"
        renderInput={params => <TextField {...params} label="airports" margin="normal" />}
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
      />
      <button className="home__search" disabled={searchValue === "" ? true : false}>
        Search
      </button>
    </form>
  );
};

export default Input;
