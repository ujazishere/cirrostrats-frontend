import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
// import { trackSearch} from "../hooks/useTracksearch";
import useSearch from "../hooks/useSearch";
import useInputHandlers from "../hooks/useInputHandlers";

// components/SearchInput.jsx
/**
 * @function SearchInput
 * @description Renders the search input UI (e.g., Autocomplete).
 *  Receives props from the parent (Input/index.jsx).
 *  Renders the Autocomplete component.
 *  Passes user interactions (e.g., typing, selecting) back to the parent via callback props.
  */ 
export default function SearchInput({ 
  userEmail,
  isLoggedIn,
}) {

  const inputRef = useRef(null);

  // returns the input handlers that will be passed to the Autocomplete component
  const {
    open,
    inputValue,
    // This debouncedInputValue comes from input handlers since inputValue is updated there which is used by debouncedInputValue
    debouncedInputValue,
    handleSubmit,
    selectedValue,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
  } = useInputHandlers();     // useInputHandlers.handleInputChange has the initial search value that gets passed to all others.
  
  // Initial filteredSuggestions comes from useSearch which is updated as homepage loads initially.
  const { filteredSuggestions } = useSearch(userEmail, isLoggedIn, inputValue, debouncedInputValue);
  // console.log("filteredSuggestions", filteredSuggestions);

  return (
    <Autocomplete
      open={open}     // Controls whether the Autocomplete dropdown is open or closed
      options={filteredSuggestions} // list of filtered dropdown items
      value={selectedValue}
      inputValue={inputValue}       // The current text input value in the Autocomplete
      
      // This function is called whenever the input text changes in the search bar.
      onInputChange={(event, newInputValue) => {handleInputChange(event, newInputValue, userEmail,filteredSuggestions)}}
      // This function is called when a dropdown suggestion is selected
      onChange={(e, submitTerm) => {handleSubmit(e, submitTerm, userEmail)}}

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
  );
}