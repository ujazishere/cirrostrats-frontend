import React from "react";
import SearchInput from "./components/SearchInput";
import useSearch from "./hooks/useSearch";
import useInputHandlers from "./hooks/useInputHandlers";
import { useNavigate } from "react-router-dom";

export default function Input({ userEmail, isLoggedIn }) {
  const navigate = useNavigate();
  // const inputRef = useRef(null);

  // Centralized search logic
  const { searchTerm, suggestions, loading } = useSearch(userEmail, isLoggedIn);
  // console.log('search', searchTerm, suggestions, loading);

  const { handleSubmit } = useInputHandlers(searchTerm, suggestions);
  // console.log('', handleSubmit);

  return (
    <div className="searchbar-container relative">
      <form onSubmit={handleSubmit}>
        {/* Search input is where the autocomplete UI is rendered and will need associated props */}
        <SearchInput
          // userEmail={userEmail}
          searchTerm={searchTerm}
          suggestions={suggestions}
          loading={loading}
          // autocompleteProps={autocompleteProps}
        />
        <button className="home__search" type="submit">
          Search
        </button>
      </form>
    </div>
  );
}
