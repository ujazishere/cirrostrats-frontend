import React from "react";
import SearchInput from "./components/SearchInput";
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
 * 
 */

<link rel="icon" type="image/png" href="/favicon.png" />


export default function Input({ userEmail, isLoggedIn }) {

  return (
    <div className="searchbar-container relative">
      <form>
        {/* Search input is where the autocomplete UI is rendered and will need associated props */}
        <SearchInput
          userEmail={userEmail}
          isLoggedIn={isLoggedIn}
        />
      </form>
    </div>
  );
}
