// Imports the React library, which is necessary for creating React components.
import React from "react";
// Imports the SearchInput component, which handles the actual UI and logic for the search bar.
import SearchInput from "./components/SearchInput";

/**
 * @function Input
 * @description This is the main search component that renders the SearchInput component and is
 * responsible for managing the search input, suggestions list, and navigation
 * It also passes the necessary props to the SearchInput component which then renders the autocomplete UI and uses
 * useSearch hook to manage the search logic.
 * This one acts as the orchestrator that composes hooks and passes data down the component tree
 * @param {string} userEmail The user's email address
 * @param {boolean} isLoggedIn Whether the user is logged in or not
 * @returns {JSX.Element} The JSX element to render the search component 
 * */

<link rel="icon" type="image/png" href="/favicon.png" />


// Defines and exports the main Input component, which accepts userEmail and isLoggedIn as props.
export default function Input({ userEmail, isLoggedIn }) {

  // The component returns the JSX structure to be rendered on the screen.
  return (
    // This div acts as the primary container for the entire search bar component.
    <div className="searchbar-container relative">
      {/* A form element is used to wrap the input for semantic correctness and to handle submissions. */}
      <form>
        {/* Search input is where the autocomplete UI is rendered and will need associated props */}
        {/* Renders the SearchInput child component. */}
        <SearchInput
          // Passes the user's email down to the SearchInput component as a prop.
          userEmail={userEmail}
        />
      </form>
    </div>
  );
}