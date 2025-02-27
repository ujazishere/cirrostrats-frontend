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

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const inputRef = useRef(null);
  // const { searchSuggestions, isFetched, isLoading } = useFetchData(userEmail);
  // const { filteredSuggestions} = useFetchSuggestions(debouncedInputValue, searchSuggestions, userEmail, isLoggedIn);
  const { 
    open, 
    handleSubmit,
    handleInputChange,
    handleSuggestionClick,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleOptionSelect, 
  } = autocompleteProps;


  
  return (
    <Autocomplete
      open={open}     // Controls whether the Autocomplete dropdown is open or closed
      options={suggestions} // list of filtered dropdown items
      value={selectedValue}
      inputValue={inputValue}       // The current text input value in the Autocomplete
      
      // This function is called whenever the input text changes
      onInputChange={(event, newInputValue) => {
        console.log("new input value:", newInputValue);
        setInputValue(newInputValue);
        if (!newInputValue) {
          setSelectedValue(null);
        }
        // setIsExpanded(true);
      }}
      onChange={(event, newValue) => {
        // This function is called when the user selects a value from the dropdown
        setSelectedValue(newValue);
        if (newValue) {
          setInputValue(newValue.label);
          // trackSearch(inputValue, newValue.label);
          navigate("/details", { state: { searchValue: newValue } });
        }
        // setIsExpanded(false);
      }}

      // open={open}
      // // loading={filteredSuggestions}
      // options={suggestions}
      // value={selectedOption}
      // inputValue={searchTerm}
      // onInputChange={(event, newsearchvalue) => {
      //   console.log("new search value:", newsearchvalue);
      //   // this function is called whenever the input text changes
      //   // setsearchvalue(newsearchvalue);
      //   // if (!newsearchvalue) {
      //   //   setselectedsuggestion(null);
      //   // }
      //   // setissuggestionslistvisible(true);
      // }}
      // // onInputChange={handleInputChange}
      // onChange={(event, newValue) => handleOptionSelect(newValue)}



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






    //   groupBy={(option) => option.type}
    //   className="home__input"
    //   getOptionLabel={(option) => option.label || ""}
    //   renderInput={(params) => (
    //     <TextField
    //       {...params}
    //       label="Try searching a gate in newark. Eg. 71x"
    //       placeholder="Search airports, flights, or gates..."
    //       onFocus={handleFocus}
    //       onBlur={handleBlur}
    //       fullWidth
    //     />
    //   )}
    //   renderOption={(props, option) => (
    //     <li {...props}>
    //       <div className="flex items-center justify-between w-full">
    //         <span>{option.label}</span>
    //         <span className="text-gray-500 text-sm">{option.type}</span>
    //       </div>
    //     </li>
    //   )}
    // />
  );
}