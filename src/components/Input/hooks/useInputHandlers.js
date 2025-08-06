import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "./useDebounce"; // Keep this import even if commented out in return
import { trackSearch } from "./useTrackSearch";
import searchService from "../api/searchservice";

/*
This file manages UI interactions (click, submit, keyboard events)
houses all input handlers.
*/
const useInputHandlers = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [open, setOpen] = useState(false);

  // const debouncedInputValue = useDebounce(inputValue, 300); // Keep this line

  const handleValue = (value) => {
    setSelectedValue(value);
  }

  const handleInputChange = (event, newInputValue, userEmail,) => {
    // TODO:
    // Here the user should have their own most popular search terms displayed on the top in blue in the dropdown.
    setInputValue(newInputValue);
    // trackSearch(userEmail, newInputValue); // Keep this line if you want to track keystrokes
  }
  
/**
 * @function saveSearchToLocalStorage
 * @description Takes a search term object, sanitizes it, and saves it to a capped list of recent searches in the browser's localStorage.
 * @param {object} term - The search term object to be saved. Should have at least a 'label' property.
 */
const saveSearchToLocalStorage = (term) => {
    // --- NEW LOCAL STORAGE LOGIC ---
    // Get the current time as a numerical timestamp. This is used to track how old searches are.
    const currentTime = new Date().getTime();
    // Define the maximum number of recent searches to keep in storage.
    const MAX_RECENT_SEARCHES = 2;

    // Initialize an empty array to hold the list of recent searches.
    let recentSearches = [];
    try {
        // Attempt to retrieve and parse the existing list of searches from localStorage.
        // If 'recentSearches' doesn't exist in storage, it defaults to an empty array string '[]'.
        recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (error) {
        // If the data in localStorage is corrupted and cannot be parsed, log the error and reset to an empty array.
        console.error("Error parsing recent searches from localStorage:", error);
        recentSearches = [];
    }

    // Prepare a clean object 'termToStore' that will be saved.
    let termToStore = {};
    // Ensure the provided 'term' is a valid object with a 'label' before proceeding.
    if (typeof term === 'string') {
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
    recentSearches = recentSearches.filter(item => {
        // Priority 1: If both the new term and an existing item have an 'id', compare them.
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
    recentSearches.unshift({ ...termToStore, timestamp: currentTime });

    // If the list now exceeds the maximum allowed size, trim it.
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
        // .slice(0, MAX_RECENT_SEARCHES) creates a new array containing only the first N items.
        recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }

    // Save the final, updated array back to localStorage. It must be converted to a JSON string.
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    console.log('recentSearches', recentSearches);
    // --- END NEW LOCAL STORAGE LOGIC ---
};


/**
 * @function handleSubmit
 * @description Handles the search submission event. It intelligently determines whether the user
 * selected an item from the dropdown or submitted a raw text query.
 * @param {Event} e - The form submission or click event.
 * @param {object|string} submitTerm - The term being searched. Can be a full object from the dropdown or a raw string.
 * @param {string} userEmail - The email of the current user for tracking purposes.
 * @param {Array<object>} suggestions - The list of suggestion objects currently displayed in the dropdown.
 */
const handleSubmit = (e, submitTerm, userEmail, suggestions = []) => {
    // Prevent the default browser action for the event (e.g., page reload on form submit).
    console.log('st',submitTerm);
    if (e) e.preventDefault();
    // Guard clause: Exit if the search term is empty, null, or just whitespace.
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
        console.log('raw string');
        // --- Case 2: A raw string was submitted (e.g., by typing and pressing Enter) ---
        const trimmedSubmitTerm = submitTerm.trim();      // trimming leading and trailing white spaces

        // NEW LOGIC: Check if there are any suggestions currently visible in the dropdown.
        // The most common user intent is to select the top-most suggestion when submitting a raw query.
        // TODO uj: this should account for airport exact match or prepended with k, for flights it shouldn't
        const topSuggestion = suggestions && suggestions.length > 0 ? suggestions[0] : null;

        if (topSuggestion) {
            // If a top suggestion exists, use it as the definitive search term. This is the main fix.
            // This ensures that if a user types "ewr" and "EWR - Newark..." is the top result, we save the full result.
            saveSearchToLocalStorage(topSuggestion);
            navigate("/details", { state: { searchValue: topSuggestion }, userEmail });
            setSelectedValue(topSuggestion);
        } else {
            // Fallback: If no suggestions were visible (e.g., the search was too fast or yielded no results),
            // we revert to calling the API to try and resolve the raw query.
            searchService.fetchRawQuery(trimmedSubmitTerm).then(rawReturn => {
                // Determine the final term: use the API result if valid, otherwise create a basic object from the raw text.


                // TODO uj: this raw return contains essential info thru parse query. save it in local storage as is.
                    // May have to account for this in the search interface.
                    // The 
                console.log('rawR', rawReturn);
                // const finalTerm = rawReturn && rawReturn.label ? rawReturn : { label: trimmedSubmitTerm };
                // Save the result (either from the API or the raw text) to local storage.
                saveSearchToLocalStorage(rawReturn);



                // The value passed to the details page is either the full object or the raw string.
                const searchValue = rawReturn || trimmedSubmitTerm;
                navigate("/details", { state: { searchValue }, userEmail });
                // Update the input display with the final term.
                setSelectedValue(finalTerm);
            });
        }
    }
}

  const handleFocus = () => {
    // setIsExpanded(true);
    // setOpen(searchTerm.length > 0);
    setOpen(true);
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

    Object.entries(elements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        if (key === "searchbar") {
          element.classList.add("expanded");
        } else {
          element.classList.add("hidden");
        }
      }
    });
  };

  const handleBlur = (event) => {
    // Small delay to allow click events on options to fire first
    setTimeout(() => setOpen(false), 100);
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
      }, 300);
    }
  };

  // // This will be called when the user presses the Tab key -- works with inlinePrediction
  const handleKeyDown = (event) => {
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

  const handleOptionSelect = (option) => {
    // setSelectedOption(option); // This variable is not defined in this scope
    // setSearchTerm(option?.label || ""); // This variable is not defined in this scope
    setOpen(false);

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