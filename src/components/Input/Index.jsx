// Input/index.jsx
import React, { useRef } from "react";
import SearchInput from "./components/SearchInput";
import useSearch from "./hooks/useSearch";
import useAutocomplete from "./hooks/useAutocomplete";
import { useNavigate } from "react-router-dom";
export default function Input({ userEmail, isLoggedIn }) {
  const navigate = useNavigate();
  // const inputRef = useRef(null);
  
  // Centralized search logic
  const { searchTerm, setSearchTerm, suggestions, loading } = useSearch(userEmail, isLoggedIn);
  
  // Autocomplete UI behavior
  const autocompleteProps = useAutocomplete(suggestions, searchTerm, setSearchTerm, navigate);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };
  
  return (
    <div className="searchbar-container relative">
      <form onSubmit={handleSubmit}>
        {/* Search input is where the autocomplete UI is rendered and will need associated props */}
        <SearchInput
          // userEmail={userEmail}
          searchTerm={searchTerm}
          suggestions={suggestions}
          loading={loading}
          autocompleteProps={autocompleteProps}
        />
      </form>
    </div>
  );
}