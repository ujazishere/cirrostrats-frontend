import React, { useState, useEffect, useRef } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import useSearchSuggestions from "../hooks/useSuggestions";
import useInputHandlers from "../hooks/useInputHandlers";


/**
 * @function SearchInput
 * @description Renders the search input UI (e.g., Autocomplete).
 * Receives props from the parent (Input/index.jsx).
 * Renders the Autocomplete component.
 * Passes user interactions (e.g., typing, selecting) back to the parent via callback props.
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
    // debouncedInputValue,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
  } = useInputHandlers();     // useInputHandlers.handleInputChange has the initial search value that gets passed to all others.

  // filteredSuggestions will now include an 'isRecent' boolean flag
  // We now also get a function to refresh the recent searches instantly
  const { filteredSuggestions, refreshRecentSearches } = useSearchSuggestions(userEmail, null, inputValue, dropOpen);

  /**
   * @function handleRemoveRecent
   * @description Removes a single recent search item from localStorage and refreshes the suggestions list.
   * @param {Event} e - The click event.
   * @param {object} itemToRemove - The suggestion object to remove.
   */

    const handleRemoveRecent = (e, itemToRemove) => {
    e.stopPropagation(); // Prevents the Autocomplete's onChange from firing.

    let recentSearches = [];
    try {
      recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (error) {
      console.error("Error parsing recent searches from localStorage:", error);
      return; // Exit if stored data is corrupt
    }

    // Filter out the item to be removed.
    // It matches based on ID if available, otherwise by a case-insensitive label match.
    const updatedSearches = recentSearches.filter(item => {
      if (itemToRemove.stId && item.stId) {
        return item.stId !== itemToRemove.stId;
      }
      return item.label.toLowerCase() !== itemToRemove.label.toLowerCase();
    });

    // Save the updated array back to localStorage.
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    // Instantly trigger a refresh of the suggestions from the hook.
    refreshRecentSearches();
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <Autocomplete
          freeSolo
          open={dropOpen}     // Controls whether the Autocomplete dropdown is open or closed
          options={filteredSuggestions} // list of filtered dropdown items
          value={selectedValue}
          inputValue={inputValue}       // The current text input value in the Autocomplete

          // This function is called whenever the input text changes in the search bar.
          onInputChange={(event, newInputValue) => {handleInputChange(event, newInputValue, userEmail)}}
          // This function is called when a dropdown suggestion is selected
          onChange={(e, submitTerm) => {handleSubmit(e, submitTerm, userEmail, filteredSuggestions)}}

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
                      <button
                        type="submit"
                        className="search-icon-button"
                        aria-label="Search"
                        tabIndex={0}
                        style={{ all: 'unset', cursor: 'pointer' }} // style as needed
                        onClick={(e) => handleSubmit(e, inputValue, userEmail, filteredSuggestions)} // Call the handleSubmit function on click
                        >
                        <span className="search-icon-text">Search</span>
                      </button>

                    </div>
                  ),
                  // onKeyDown: handleKeyDown,
                  className: "search-input-field",
                }}
              />
            </div>
          )}
          // The renderOption function is being used to highlight matching parts of the option's label based on the user's input.
          // Now, it will also conditionally apply styling for recent searches.
          renderOption={(props, option, { inputValue }) => {
            const matches = match(option.label, inputValue, { insideWords: true });
            const parts = parse(option.label, matches);
            return (
              <li {...props} className="search-option" style = {{ justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {/* Text content (left side) */}
                {/* Apply conditional style here based on option.isRecent */}
                <div 
                  style={{ 
                    color: option.isRecent ? 'purple' : 'inherit', textAlign: 'left', // Change to purple if recent
                    // For a blur effect, use filter property. Note: blur might affect readability.
                    // filter: option.isRecent ? 'blur(0.4px)' : 'none', 
                    // To ensure text is not blurred, you might apply blur to a pseudo-element or background
                    // but for text, color is generally preferred for this use case.
                  }}
                  >
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


                  {option.isRecent && (
                    <button
                      type="button" // **FIX: Prevents page refresh on click**
                      onClick={(e) => handleRemoveRecent(e, option)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        marginLeft: '8px',
                        color: '#999',
                        lineHeight: '1',
                        fontSize: '16px'
                      }}
                      aria-label={`Remove ${option.label} from recent searches`}
                    >
                      &times;
                    </button>
                  )}
                </div>
              </li>
            );
          }}  
          filterOptions={(x) => x}
          disableClearable
          forcePopupIcon={false}
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