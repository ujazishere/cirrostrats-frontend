import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "./useDebounce"; // Keep this import even if commented out in return
import { trackSearch } from "./useTrackSearch";
import searchService from "../api/searchservice";

/*
This file manages UI interactions (click, submit, keyboard events)
houses all input handlers.
It's a custom hook, so we can reuse all this logic in other components if we need to.
*/
const useInputHandlers = () => {
  // navigate is from react-router-dom, used to programmatically change pages
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  // inputValue is what the user is currently typing in teh search box
  const [inputValue, setInputValue] = useState("");
  // selectedValue holds the full object when a user clicks a suggestion from the dropdown
  const [selectedValue, setSelectedValue] = useState(null);
  // open controls whether the dropdown is visible or not
  const [open, setOpen] = useState(false);

  // This is for debouncing, which means we wait for the user to stop typing before firing an API call.
  // We're keeping this line commented out for now but the import is there if we need it.
  // const debouncedInputValue = useDebounce(inputValue, 300); // Keep this line

  // Simple handler to update the selected value state.
  const handleValue = (value) => {
    setSelectedValue(value);
  }

  // This function runs every time the user types something in the input field.
  const handleInputChange = (event, newInputValue, userEmail,) => {
    // TODO:
    // Here the user should have their own most popular search terms displayed on the top in blue in the dropdown.
    setInputValue(newInputValue);
    // We could track every keystroke for analytics, but it's a bit much.
    // trackSearch(userEmail, newInputValue); // Keep this line if you want to track keystrokes
  }
  
/**
 * @function saveSearchToLocalStorage
 * @description Takes a search term object, sanitizes it, and saves it to a capped list of recent searches in the browser's localStorage.
 * This helps us show "Recent Searches" to the user.
 * @param {object} term - The search term object to be saved. Should have at least a 'label' property.
 */
const saveSearchToLocalStorage = (term) => {
    // --- NEW LOCAL STORAGE LOGIC ---
    // Get the current time as a numerical timestamp. This is used to track how old searches are.
    const currentTime = new Date().getTime();
    // Define the maximum number of recent searches to keep in storage. We dont want to fill up their storage.
    const MAX_RECENT_SEARCHES = 2;

    // Initialize an empty array to hold the list of recent searches.
    let recentSearches = [];
    try {
        // Attempt to retrieve and parse the existing list of searches from localStorage.
        // If 'recentSearches' doesn't exist in storage, it defaults to an empty array string '[]'.
        // The '||' operator is a nice fallback here.
        recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (error) {
        // If the data in localStorage is corrupted (maybe the user edited it?), it could crash the app.
        // This catch block prevents that and just resets it.
        // If the data in localStorage is corrupted and cannot be parsed, log the error and reset to an empty array.
        console.error("Error parsing recent searches from localStorage:", error);
        recentSearches = [];
    }

    // Prepare a clean object 'termToStore' that will be saved.
    // We do this to avoid saving extra junk into local storage that we dont need.
    let termToStore = {};
    // Ensure the provided 'term' is a valid object with a 'label' before proceeding.
    if (typeof term === 'string') {
      // Sometimes we just get a raw string, so we make an object out of it.
      termToStore = {
        label: term,
        type: 'raw_string' // You can specify a type for raw strings
      };
    } else if (term && term.label) {
        // Construct the object using only the properties we need.
        // The spread syntax conditionally adds properties only if they exist on the source 'term' object.
        termToStore = {
            ...(term.stId && { stId: term.stId }),
            ...(term.r_id && { r_id: term.r_id }),
            ...(term.gate && { gate: term.gate }),
            ...(term.flightID && { flightID: term.flightID }),
            label: term.label,
            type: term.type
        };
    } else {
        // If the term is invalid, log a warning and exit the function to avoid saving bad data.
        console.warn("Unexpected term format for storage:", term);
        return;
    }

    // Filter out any duplicates from the existing list before adding the new term.
    // We don't want the same search showing up multiple times.
    recentSearches = recentSearches.filter(item => {
        // Priority 1: If both the new term and an existing item have an 'id', compare them. This is the most reliable check.
        if (termToStore.stId && item.stId) {
            return item.stId !== termToStore.stId;
        }
        // Priority 2: If IDs aren't available, compare their labels in a case-insensitive way.
        if (item.label && termToStore.label) {
            return item.label.toLowerCase() !== termToStore.label.toLowerCase();
        }
        // If a comparison can't be made, keep the item by default.
        return true;
    });

    // Add the new, cleaned search term to the beginning of the array.
    // We use the filtered array `updatedSearches` to proceed.
    const finalSearches = [{ ...termToStore, timestamp: currentTime }];

    // If the list now exceeds the maximum allowed size, trim it.
    if (finalSearches.length > MAX_RECENT_SEARCHES) {
        finalSearches.length = MAX_RECENT_SEARCHES; // More efficient than slice for trimming the end
    }

    // **FIX:** The bug was here. The code was trying to save a variable that was out of scope.
    // It has been corrected to save the final, processed array `finalSearches`.
    localStorage.setItem('recentSearches', JSON.stringify(finalSearches));
    // --- END NEW LOCAL STORAGE LOGIC ---
};


/**
 * @function handleSubmit
 * @description Handles the search submission event. It intelligently determines whether the user
 * selected an item from the dropdown or submitted a raw text query by pressing Enter.
 * @param {Event} e - The form submission or click event.
 * @param {object|string} submitTerm - The term being searched. Can be a full object from the dropdown or a raw string.
 * @param {string} userEmail - The email of the current user for tracking purposes.
 * @param {Array<object>} suggestions - The list of suggestion objects currently displayed in the dropdown.
 */
const handleSubmit = (e, submitTerm, userEmail, suggestions = []) => {
    // Prevent the default browser action for the event (e.g., page reload on form submit).
    if (e) e.preventDefault();
    // Guard clause: Exit if the search term is empty, null, or just whitespace. No point in searching for nothing.
    if (!submitTerm || (typeof submitTerm === 'string' && !submitTerm.trim()) || (typeof submitTerm === 'object' && !submitTerm?.label)) {
        return;
    }

    // Call a tracking function to log the search event for analytics.
    trackSearch(userEmail, submitTerm);

    // Check if the submitted term is a structured object (meaning it was selected from the dropdown).
    if (typeof submitTerm === 'object' && submitTerm.label) {
        // --- Case 1: A dropdown item was explicitly selected ---
        // The term is already in the correct format.
        saveSearchToLocalStorage(submitTerm);
        // Navigate to the details page, passing the search object in the route's state.
        navigate("/details", { state: { searchValue: submitTerm }, userEmail });
        // Update the Autocomplete component's value to reflect the selection.
        setSelectedValue(submitTerm);

    } else if (typeof submitTerm === 'string') {
        // --- Case 2: A raw string was submitted (e.g., by typing and pressing Enter) ---
        const trimmedSubmitTerm = submitTerm.trim();      // trimming leading and trailing white spaces

        // Logic from the previous fix: Differentiate between an exact match and a true raw query.
        const exactMatchSuggestion = suggestions.find(
            s => s.label.toLowerCase() === trimmedSubmitTerm.toLowerCase()
        );

        // NEW IMPROVED LOGIC: Check if there's an exact match in ANY of the current suggestions
        // This now handles airports, gates, and flights properly. Much smarter.
        const exactMatch = suggestions.find(suggestion => {
            // Check for exact label match (case-insensitive) - works for all types
            if (suggestion.label && suggestion.label.toLowerCase() === trimmedSubmitTerm.toLowerCase()) {
                return true;
            }
            
            // For flights: check digit-only match (e.g., user types "4433" and it matches "UA4433")
            if (suggestion.type === 'flight' || suggestion.type === 'Flight') {
                const digits = suggestion.display ? suggestion.display.replace(/\D/g, '') : '';
                // console.log("Checking flight digit match:", digits, "vs", trimmedSubmitTerm);
                return digits === trimmedSubmitTerm;
            }
            
            // For airports: check identifier match (e.g., "EWR" matches "EWR - Newark Liberty...")
            if (suggestion.type === 'Airport' || suggestion.type === 'airport') {
                const airportIdentifier = suggestion.label.split(' - ')[0];
                // console.log("Checking airport identifier match:", airportIdentifier, "vs", trimmedSubmitTerm);
                return airportIdentifier.toLowerCase() === trimmedSubmitTerm.toLowerCase();
            }
            
            // For gates: check identifier match (e.g., "C101" matches from "EWR - C101 departures")
            if (suggestion.type === 'Gate' || suggestion.type === 'gate') {
                const gateIdentifier = suggestion.label.split(' - ')[1]?.split(' ')[0]; // Extract gate number
                // console.log("Checking gate identifier match:", gateIdentifier, "vs", trimmedSubmitTerm);
                return gateIdentifier && gateIdentifier.toLowerCase() === trimmedSubmitTerm.toLowerCase();
            }
            
            return false;
        });

        if (exactMatch) {
            // If an exact match is found in suggestions, use it as the definitive search term. Hooray!
            console.log("Found exact match in suggestions:", exactMatch);
            saveSearchToLocalStorage(exactMatch);
            navigate("/details", { state: { searchValue: exactMatch }, userEmail });
            setSelectedValue(exactMatch);
        } else {
            // NEW: Check if it could be a partial airport name match (e.g., "Newark" matches "EWR - Newark Liberty...")
            const airportNameMatch = suggestions.find(suggestion => 
                (suggestion.type === 'Airport' || suggestion.type === 'airport') && 
                suggestion.label.toLowerCase().includes(trimmedSubmitTerm.toLowerCase())
            );
            
            if (airportNameMatch) {
                // Found an airport that contains the search term in its name
                console.log("Found airport name match:", airportNameMatch);
                saveSearchToLocalStorage(airportNameMatch);
                navigate("/details", { state: { searchValue: airportNameMatch }, userEmail });
                setSelectedValue(airportNameMatch);
            } else {
                // Fallback: If no suggestions were visible or matched (e.g., the search was too fast or yielded no results),
                // we revert to calling the API to try and resolve the raw query. This is our last hope.
                // console.log("No matches in suggestions, calling fetchRawQuery for:", trimmedSubmitTerm);
                searchService.fetchRawQuery(trimmedSubmitTerm).then(rawReturn => {
                    // Determine the final term: use the API result if valid, otherwise create a basic object from the raw text.

                    // TODO uj: this raw return contains essential info thru parse query. save it in local storage as is.
                        // May have to account for this in the search interface.
                    // const finalTerm = rawReturn && rawReturn.label ? rawReturn : { label: trimmedSubmitTerm };
                    // Save the result (either from the API or the raw text) to local storage.
                    
                    if (rawReturn) {
                        // The API gave us something useful
                        // console.log("fetchRawQuery returned:", rawReturn);
                        saveSearchToLocalStorage(rawReturn);
                        // The value passed to the details page is the API response
                        navigate("/details", { state: { searchValue: rawReturn }, userEmail });
                        setSelectedValue(rawReturn);
                    } else {
                        // If API returns null/undefined, create a fallback term so the app doesn't break
                        // console.log("fetchRawQuery returned null, using fallback term");
                        const fallbackTerm = { label: trimmedSubmitTerm, type: 'unknown' };
                        saveSearchToLocalStorage(fallbackTerm);
                        navigate("/details", { state: { searchValue: fallbackTerm }, userEmail });
                        setSelectedValue(fallbackTerm);
                    }
                }).catch(error => {
                    // Handle API errors gracefully instead of letting them break the user experience
                    console.error("Error fetching raw query data:", error);
                    // Create a fallback term and proceed with navigation, so the user isnt stuck.
                    const fallbackTerm = { label: trimmedSubmitTerm, type: 'unknown' };
                    saveSearchToLocalStorage(fallbackTerm);
                    navigate("/details", { state: { searchValue: fallbackTerm }, userEmail });
                    setSelectedValue(fallbackTerm);
                });
            }
        }
    }
}

  // This handles what happens when the user clicks INTO the search bar
  const handleFocus = () => {
    // These were from an old implementation, keeping them for reference
    // setIsExpanded(true);
    // setOpen(searchTerm.length > 0);
    setOpen(true);

    // This big object is a list of all the UI elements we want to hide or change
    // when the search bar is active, to give it that "full screen" feel.
    const elements = {
      navbar: ".navbar",
      searchbar: ".searchbar-container",
      title: ".hero-title",
      googleButton: ".google-button",
      featurecard: ".features-grid",
      footer: ".footer",
      gatecard: ".gate-card",
      flightdetailscard: ".flight-details-card",
      WeatherTabs: ".weather-tabs-container",
      FeaturesSection: ".features-section",
      AirportCard: ".weather-cards",
      title2: ".hero-title-2",
      navlinks: ".nav-links-container",
      clearrrr: ".route-tab-content",
      nas: ".nas-section",
      flightInfoContainer: ".flight-info-container",
      datetab: ".date-tabs-container",
      gateCardContainer: ".departure-gate-container", 

    };

    // Loop through all the elements and add the correct CSS class
    Object.entries(elements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        if (key === "searchbar") {
          element.classList.add("expanded"); // Make search bar bigger
        } else {
          element.classList.add("hidden"); // Hide everything else
        }
      }
    });
  };

  // This runs when the user clicks OUT of the search bar
  const handleBlur = (event) => {
    // Small delay to allow click events on options to fire first
    // Without this, the dropdown would disappear before a click is registered.
    setTimeout(() => setOpen(false), 100);
    
    // This condition checks if the new focused element is outside the search component.
    // It prevents the blur effect from happening if you're just clicking around inside the component (like on the dropdown).
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTimeout(() => {
        // setIsExpanded(false);
        const elements = {
          navbar: ".navbar",
          searchbar: ".searchbar-container",
          title: ".hero-title",
          googleButton: ".google-button",
          featurecard: ".features-grid",
          footer: ".footer",
          gatecard: ".gate-card",
          flightdetailscard: ".flight-details-card",
          WeatherTabs: ".weather-tabs-container",
          FeaturesSection: ".features-section",
          data: ".data-content",
          AirportCard: ".weather-cards",
          title2: ".hero-title-2",
          navlinks: ".nav-links-container",
          clearrrr: ".route-tab-content",
          nas: ".nas-section",
          flightInfoContainer: ".flight-info-container",
          datetab: ".date-tabs-container",
          gateCardContainer: ".departure-gate-container", 
        };
        
        // Basically the reverse of handleFocus, we remove the classes to bring the UI back to normal.
        Object.entries(elements).forEach(([key, selector]) => {
          const element = document.querySelector(selector);
          if (element) {
            if (key === "searchbar") {
              element.classList.remove("expanded");
            } else {
              element.classList.remove("hidden");
            }
          }
        });
      }, 300); // A longer delay here to make the transition smoother.
    }
  };

  // // This will be called when the user presses the Tab key -- works with inlinePrediction
  const handleKeyDown = (event) => {
    // This whole block is for an inline auto-suggestion feature (like Google search).
    // Note: inlinePrediction and filteredSuggestions are not directly available in this hook.
    // If you intend to use them here, they would need to be passed as arguments or derived.
    // Keeping existing logic as-is, assuming these might be part of a larger context or commented out for now.
    // if (event.key === "Tab" && inlinePrediction) {
    //   event.preventDefault();
    //   const newInputValue = inputValue + inlinePrediction;
    //   setInputValue(newInputValue);

    //   const matchingSuggestion = filteredSuggestions.find(
    //     (suggestion) => suggestion.label.toLowerCase() === newInputValue.toLowerCase()
    //   );

    //   if (matchingSuggestion) {
    //     setSelectedValue(matchingSuggestion);
    //   }
    // }
  };

  // This handles a direct click on one of the dropdown options.
  const handleOptionSelect = (option) => {
    // These variables are from an older version of the code, not used here.
    // setSelectedOption(option); // This variable is not defined in this scope
    // setSearchTerm(option?.label || ""); // This variable is not defined in this scope
    setOpen(false); // Close the dropdown after selection

    // Handle navigation based on selection type
    if (option) {
      if (option.type === "Airport") {
        navigate(`/airport/${option.r_id}`);
      } else if (option.type === "Flight") {
        navigate(`/flight/${option.r_id}`);
      } else if (option.type === "Gate") {
        navigate(`/gate/${option.r_id}`);
      }
    }
  };

  // This is the public API of our hook. We return all the states and handlers
  // that a component will need to use to make the search bar work.
  return {
    open,
    setOpen,
    selectedValue,
    setSelectedValue,
    inputValue,
    setInputValue,
    // debouncedInputValue,
    handleSubmit,
    handleValue,
    handleInputChange,
    // handleSuggestionClick,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleOptionSelect,
  };
};

export default useInputHandlers;