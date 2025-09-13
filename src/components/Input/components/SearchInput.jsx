// Import necessary dependencies from React and third-party libraries.
import React, { useState, useEffect, useRef } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
// Import custom hooks for managing suggestions and input logic.
import useSearchSuggestions from "../hooks/useSuggestions";
import useInputHandlers from "../hooks/useInputHandlers";


/**
 * @function SearchInput
 * @description Renders the search input UI (e.g., Autocomplete).
 * Receives props from the parent (Input/index.jsx).
 * Renders the Autocomplete component.
 * Passes user interactions (e.g., typing, selecting) back to the parent via callback props.
  */ 
// Defines the main component, accepting userEmail as a prop.
export default function SearchInput({ 
  userEmail,
}) {

  // Creates a ref to hold a direct reference to the input DOM element.
  const inputRef = useRef(null);

  // returns the input handlers that will be passed to the Autocomplete component
  // Destructures state variables and event handlers from the custom useInputHandlers hook.
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
  // Fetches and manages search suggestions using another custom hook.
  const { filteredSuggestions, refreshRecentSearches } = useSearchSuggestions(userEmail, null, inputValue, dropOpen);

  /**
   * @function handleRemoveRecent
   * @description Removes a single recent search item from localStorage and refreshes the suggestions list.
   * @param {Event} e - The click event.
   * @param {object} itemToRemove - The suggestion object to remove.
   */

    // This function handles the removal of a specific item from the recent searches list.
    const handleRemoveRecent = (e, itemToRemove) => {
    // This stops the click event from propagating to parent elements, like the Autocomplete's selection handler.
    e.stopPropagation(); // Prevents the Autocomplete's onChange from firing.

    // Initializes an empty array to hold the parsed recent searches from localStorage.
    let recentSearches = [];
    // A try-catch block to safely handle potential errors during JSON parsing.
    try {
      // Retrieves and parses the recent searches from localStorage, defaulting to an empty array string.
      recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (error) {
      // Logs an error message to the console if parsing fails.
      console.error("Error parsing recent searches from localStorage:", error);
      return; // Exit if stored data is corrupt
    }

    // Filter out the item to be removed.
    // It matches based on ID if available, otherwise by a case-insensitive label match.
    // Creates a new array containing all items except the one to be removed.
    const updatedSearches = recentSearches.filter(item => {
      // If a unique ID (stId) is available, use it for a more reliable comparison.
      if (itemToRemove.stId && item.stId) {
        return item.stId !== itemToRemove.stId;
      }
      // Otherwise, fall back to a case-insensitive comparison of the labels.
      return item.label.toLowerCase() !== itemToRemove.label.toLowerCase();
    });

    // Save the updated array back to localStorage.
    // The updated array is converted back to a JSON string before being saved.
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    // Instantly trigger a refresh of the suggestions from the hook.
    // This call updates the UI to reflect the removal immediately.
    refreshRecentSearches();
  };

  // The return statement contains the JSX that defines the component's UI.
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
          // Defines how to extract a string label from each option object for display.
          getOptionLabel={(option) => option.label || ""}
          // Renders the actual text input field for the Autocomplete component.
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
                  // Defines a custom element to be placed at the end of the input field.
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
          // Customizes the rendering of each individual option in the dropdown list.
          renderOption={(props, option, { inputValue }) => {
            // Uses a utility to find which parts of the option's label match the current input.
            const matches = match(option.label, inputValue, { insideWords: true });
            // Uses another utility to parse the label into an array of text parts, with highlight flags.
            const parts = parse(option.label, matches);
            // Returns the list item element for the suggestion.
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
                  {/* Maps over the parsed parts to render the text. */}
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      // Applies a bold font weight to the parts that should be highlighted.
                      style={{
                        fontWeight: part.highlight ? 700 : 400,
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                  </div>


                  {/* If the option is a recent search, a remove button is rendered. */}
                  {option.isRecent && (
                    <button
                      type="button" // **FIX: Prevents page refresh on click**
                      // Attaches the handler to remove this specific recent search.
                      onClick={(e) => handleRemoveRecent(e, option)}
                      // Inline styles for the remove button's appearance.
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
                      {/* Renders an "x" character as the button's content. */}
                      &times;
                    </button>
                  )}
                </div>
              </li>
            );
          }}  
          // Disables Autocomplete's built-in filtering, as we provide pre-filtered options.
          filterOptions={(x) => x}
          // Disables the clearable "X" icon in the input.
          disableClearable
          // Hides the dropdown arrow icon.
          forcePopupIcon={false}
          // Automatically selects the input text on focus.
          selectOnFocus
          // Prevents the input value from being cleared when the component loses focus.
          clearOnBlur={false}
          // Enables keyboard navigation (Home/End keys) in the dropdown.
          handleHomeEndKeys
          onFocus={handleFocus}
          onBlur={handleBlur}
          // Renders the dropdown list within the component's parent, not in a portal.
          disablePortal
          // Passes additional props to the Listbox (the dropdown container).
          ListboxProps={{
            className: "search-listbox",
          }}
        />
      </div>
    </div>
  );
}
