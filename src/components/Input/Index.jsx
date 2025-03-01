import React from "react";
import SearchInput from "./components/SearchInput";
import useSearch from "./hooks/useSearch";
import useInputHandlers from "./hooks/useInputHandlers";
import { useNavigate } from "react-router-dom";

/**
 * @function Input
 * @description This is the main search component that renders the SearchInput component and is
 *  responsible for managing the search input, suggestions list, and navigation
 *  It also passes the necessary props to the SearchInput component which then renders the autocomplete UI and uses
 *  useSearch hook to manage the search logic.
 *  This one acts as the orchestrator that composes hooks and passes data down the component tree
 * @param {string} userEmail The user's email address
 * @param {boolean} isLoggedIn Whether the user is logged in or not
 * @returns {JSX.Element} The JSX element to render the search component 
 */
export default function Input({ userEmail, isLoggedIn }) {
  // const navigate = useNavigate();
  // const inputRef = useRef(null);

  // Centralized search logic
  // const { 
          // searchTerm,     // currently unused
          // setSearchTerm,  // currently unused
          // loading } = useSearch(userEmail, isLoggedIn);
  // console.log('search', searchTerm, suggestions, loading);

  const { open,
          setOpen,
          selectedValue,
          setSelectedValue,
          // inputValue,
          // setInputValue,
          handleSubmit,
          // handleInputChange,
          // handleSuggestionClick
          // handleFocus,
          // handleBlur,
          // handleKeyDown,
          // handleOptionSelect,
          } = useInputHandlers();
  // console.log('', handleSubmit);

  return (
    <div className="searchbar-container relative">
      <form onSubmit={handleSubmit}>
        {/* Search input is where the autocomplete UI is rendered and will need associated props */}
        <SearchInput
          // userEmail={userEmail}
          // isLoggedIn={isLoggedIn}
          // searchTerm={searchTerm}
          // suggestions={suggestions}
          userEmail={userEmail}
          isLoggedIn={isLoggedIn}
          // loading={loading}
          open={open}
          setOpen={setOpen}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          // onInputChange={handleInputChange}
          // inputValue={inputValue}
          // setInputValue={setInputValue}
          // autocompleteProps={autocompleteProps}
        />
        <button className="home__search" type="submit">
          Search
        </button>
      </form>
    </div>
  );
}
