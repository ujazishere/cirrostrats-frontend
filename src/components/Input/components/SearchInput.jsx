import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import useTrackSearch from "../hooks/useTrackSearch";
import useDebounce from "../hooks/useDebounce";
import useFetchData from "../hooks/useFetchData";
import useFetchSuggestions from "../hooks/useFetchSuggestions";

// components/SearchInput.jsx
const SearchInput = ({
    handleSuggestionClick,
    handleFocus,
    handleBlur,
    handleKeyDown,
    userEmail,
    isLoggedIn,
    navigate,

    inputRef,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isSuggestionsListVisible, setIsSuggestionsListVisible] = useState(false);
  
  const debouncedInputValue = useDebounce(searchValue, 300);
  const { searchSuggestions, isFetched, isLoading } = useFetchData(userEmail);
  const { filteredSuggestions} = useFetchSuggestions(debouncedInputValue, searchSuggestions, userEmail, isLoggedIn);
  // console.log("Filtered Suggestions:", filteredSuggestions);

  
  return (
        <Autocomplete
          open={true}     // Controls whether the Autocomplete dropdown is open or closed
          options={filteredSuggestions} // list of filtered dropdown items
          value={selectedSuggestion}
          inputValue={searchValue}       // The current text input value in the Autocomplete
          onInputChange={(event, newSearchValue) => {
            // This function is called whenever the input text changes
            setSearchValue(newSearchValue);
            if (!newSearchValue) {
              setSelectedSuggestion(null);
            }
            setIsSuggestionsListVisible(true);
          }}

          onChange={(event, newSuggestion) => {
            // This function is called when the user selects a value from the dropdown
            console.log("New Suggestion:", newSuggestion)
            setSelectedSuggestion(newSuggestion);
            if (newSuggestion) {
              setSearchValue(newSuggestion.label);
              navigate("/details", { state: { searchValue: newSuggestion } });
            }
            setIsSuggestionsListVisible(false);
          }}


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
        //   open={true}     // Controls whether the Autocomplete dropdown is open or closed
        //   options={filteredSuggestions} // list of filtered dropdown items
        //   value={selectedValue}
        //   inputValue={inputValue}       // The current text input value in the Autocomplete
        //   onChange={(event, newValue) => {
        //     // This function is called when the user selects a value from the dropdown
        //     setSelectedValue(newValue);
        //     if (newValue) {
        //       setInputValue(newValue.label);
        //       trackSearch(inputValue, newValue.label);
        //       navigate("/details", { state: { searchValue: newValue } });
        //     }
        //     setIsExpanded(false);
        //   }}
        //   onInputChange={(event, newInputValue) => {
        //     console.log('newInputValue', newInputValue);
        //     // This function is called whenever the input text changes
        //     setInputValue(newInputValue);
        //     if (!newInputValue) {
        //       setSelectedValue(null);
        //     }
        //     setIsExpanded(true);
        //   }}
        //   className="home__input"
        //   getOptionLabel={(option) => option.label || ""}
        //   renderInput={(params) => (
        //     <div style={{ position: 'relative' }}>
        //       <TextField
        //         {...params}
        //         inputRef={inputRef}
        //         label="Try searching a gate in newark. Eg. 71x"
        //         margin="normal"
        //         InputProps={{
        //           ...params.InputProps,
        //           endAdornment: null,
        //           onKeyDown: handleKeyDown,
        //         }}
        //       />
        //       {/* {inlinePrediction && (
        //         <div
        //           style={{
        //             position: 'absolute',
        //             left: params.InputProps.startAdornment ? 'auto' : '14px',
        //             top: '50%',
        //             transform: 'translateY(-50%)',
        //             color: '#999',
        //             pointerEvents: 'none',
        //             whiteSpace: 'pre',
        //           }}
        //         >
        //           <span style={{ visibility: 'hidden' }}>{inputValue}</span>
        //           <span>{inlinePrediction}</span>
        //         </div>
        //       )} */}
        //     </div>
        //   )}
        //   renderOption={(props, option, { inputValue }) => {
        //     const matches = match(option.label, inputValue, { insideWords: true });
        //     const parts = parse(option.label, matches);
        //     return (
        //       <li {...props}>
        //         <div>
        //           {parts.map((part, index) => (
        //             <span
        //               key={index}
        //               style={{
        //                 fontWeight: part.highlight ? 700 : 400,
        //               }}
        //             >
        //               {part.text}
        //             </span>
        //           ))}
        //         </div>
        //       </li>
        //     );
        //   }}
        //   noOptionsText="Where are you flying to?"
        //   filterOptions={(x) => x}
        //   disableClearable
        //   forcePopupIcon={false}
        //   freeSolo
        //   selectOnFocus
        //   clearOnBlur={false}
        //   handleHomeEndKeys
        //   onFocus={handleFocus}
        //   onBlur={handleBlur}
        //   disablePortal
        // />

  );
};

export default SearchInput;