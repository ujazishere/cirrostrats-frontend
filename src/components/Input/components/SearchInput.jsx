import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
// import { trackSearch} from "../hooks/useTracksearch";
import useDebounce from "../hooks/useDebounce";
import useFetchData from "../hooks/useFetchData";
import useFetchSuggestions from "../hooks/useFetchSuggestions";

// components/SearchInput.jsx
export default function SearchInput({ 
  // userEmail,
  searchTerm,
  suggestions,
  loading,
  autocompleteProps
}) {
  // const { searchSuggestions, isFetched, isLoading } = useFetchData(userEmail);
  // const { filteredSuggestions} = useFetchSuggestions(debouncedInputValue, searchSuggestions, userEmail, isLoggedIn);
  const { 
    open, 
    selectedOption, 
    handleOptionSelect, 
    handleInputChange,
    handleFocus,
    handleBlur
  } = autocompleteProps;
  
  return (
    <Autocomplete
      // open={true}     // controls whether the autocomplete dropdown is open or closed
      // options={filteredsuggestions} // list of filtered dropdown items
      // value={selectedsuggestion}
      // inputvalue={searchvalue}       // the current text input value in the autocomplete
      // oninputchange={(event, newsearchvalue) => {
      //   // this function is called whenever the input text changes
      //   setsearchvalue(newsearchvalue);
      //   if (!newsearchvalue) {
      //     setselectedsuggestion(null);
      //   }
      //   setissuggestionslistvisible(true);
      // }}

      // onchange={(event, newsuggestion) => {
      //   // this function is called when the user selects a value from the dropdown
      //   console.log("new suggestion:", newSuggestion)
      //   setSelectedSuggestion(newSuggestion);
      //   if (newSuggestion) {
      //     setSearchValue(newSuggestion.label);
      //     navigate("/details", { state: { searchValue: newSuggestion } });
      //   }
      //   setIsSuggestionsListVisible(false);
      // }}
      open={open}
      // loading={filteredSuggestions}
      options={suggestions}
      value={selectedOption}
      inputValue={searchTerm}
      onInputChange={handleInputChange}
      onChange={(event, newValue) => handleOptionSelect(newValue)}
      groupBy={(option) => option.type}
      getOptionLabel={(option) => option.label || ""}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search airports, flights, or gates..."
          onFocus={handleFocus}
          onBlur={handleBlur}
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div className="flex items-center justify-between w-full">
            <span>{option.label}</span>
            <span className="text-gray-500 text-sm">{option.type}</span>
          </div>
        </li>
      )}
    />
  );
}