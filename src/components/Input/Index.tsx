import SearchInput from "./components/SearchInput";

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

interface InputProps {
  userEmail: string;
  isLoggedIn?: boolean;
}

export default function Input({
  userEmail,
  isLoggedIn: _isLoggedIn,
}: InputProps): JSX.Element {
  return (
    <div className="searchbar-container relative">
      <form>
        {/* Search input is where the autocomplete UI is rendered and will need associated props */}
        <SearchInput userEmail={userEmail} />
      </form>
    </div>
  );
}
