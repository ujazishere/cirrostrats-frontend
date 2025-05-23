import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
// import { trackSearch} from "../hooks/useTracksearch";
import useSearch from "../hooks/useSuggestions";
import useInputHandlers from "../hooks/useInputHandlers";


/**
 * @function SearchInput
 * @description Renders the search input UI (e.g., Autocomplete).
 *  Receives props from the parent (Input/index.jsx).
 *  Renders the Autocomplete component.
 *  Passes user interactions (e.g., typing, selecting) back to the parent via callback props.
  */ 
export default function SearchInput({ 
  userEmail,
}) {
  const inputRef = useRef(null);
  // returns the input handlers that will be passed to the Autocomplete component
  const {
    open: dropOpen,
    inputValue,
    handleSubmit,
    selectedValue,
    debouncedInputValue,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
  } = useInputHandlers();     // useInputHandlers.handleInputChange has the initial search value that gets passed to all others.

  const { filteredSuggestions } = useSearch(userEmail, null, inputValue, debouncedInputValue, dropOpen);

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <Autocomplete
          open={dropOpen}     // Controls whether the Autocomplete dropdown is open or closed
          options={filteredSuggestions} // list of filtered dropdown items
          value={selectedValue}
          inputValue={inputValue}       // The current text input value in the Autocomplete

          // This function is called whenever the input text changes in the search bar.
          onInputChange={(event, newInputValue) => {handleInputChange(event, newInputValue, userEmail)}}
          // This function is called when a dropdown suggestion is selected
          onChange={(e, submitTerm) => {handleSubmit(e, submitTerm, userEmail)}}

          className="search-autocomplete"
          getOptionLabel={(option) => option.label || ""}
          renderInput={(params) => (
            <div style={{ position: 'relative' }} className="search-input-container">
              <TextField
                {...params}
                inputRef={inputRef}
                placeholder="Search flight, gate or airport code"
                margin="none"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <div className="search-icon-container">
                      <span className="search-icon-text">Search</span>
                    </div>
                  ),
                  onKeyDown: handleKeyDown,
                  className: "search-input-field",
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
          // the renderOption function is being used to highlight matching parts of the option's label based on the user's input.
          renderOption={(props, option, { inputValue }) => {
            const matches = match(option.label, inputValue, { insideWords: true });
            const parts = parse(option.label, matches);
            return (
              <li {...props} className="search-option">
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
          ListboxProps={{
            className: "search-listbox",
          }}
        />
      </div>
    </div>
  );
}