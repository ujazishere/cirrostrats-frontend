import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "./hooks/useDebounce";
import useInputHandlers from "./hooks/useInputHandlers";
import SearchInput from "./components/SearchInput";

// Input/index.jsx (main component)
const Input = ({ userEmail, isLoggedIn }) => {
  // Only core state and composition of hooks
//   const { trackSearch } = useTrackSearch();

  // State management for search functionality
  const [inlinePrediction, setInlinePrediction] = useState("");
//   const [inputValue, setInputValue] = useState("");
  
  const minCharsForAutofill = 3;
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const handleSubmit=useInputHandlers.handleSubmit
  // console.log(userEmail, isLoggedIn);
  
  return (
    <div className="searchbar-container relative">
      <form onSubmit={handleSubmit}>
        <SearchInput
            handleSubmit={useInputHandlers.handleSubmit}
            handleSuggestionClick={useInputHandlers.handleSuggestionClick}
            handleFocus={useInputHandlers.handleFocus}
            handleBlur={useInputHandlers.handleBlur}
            handleKeyDown={useInputHandlers.handleKeyDown}

            isLoggedIn={isLoggedIn}
            userEmail={userEmail}

            inputRef={inputRef}
            inlinePrediction={inlinePrediction}
            setInlinePrediction={setInlinePrediction}

            minCharsForAutofill={minCharsForAutofill}
            navigate={navigate}
        />

        {/* Search History Suggestions */}
        {/* {isLoggedIn && (
          <SearchHistorySuggestions
            userEmail={userEmail}
            isVisible={isExpanded}
            onSuggestionClick={handleSuggestionClick}
          />
        )} */}

        <button className="home__search" type="submit">
          Search
        </button>
      </form>
    </div>
  );
};

export default Input;