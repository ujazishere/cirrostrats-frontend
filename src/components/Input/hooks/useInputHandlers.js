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
  
  const handleSubmit = (e, submitTerm, userEmail) => {
    if (e) e.preventDefault(); // Prevents default form submission behavior (which was triggering print dialog)
    let searchValue;
    trackSearch(userEmail, submitTerm); // This will still send to backend if VITE_TRACK_SEARCH is true

    // --- NEW LOCAL STORAGE LOGIC ---
    const currentTime = new Date().getTime(); // Current timestamp in milliseconds
    const MAX_RECENT_SEARCHES = 2; // Maximum number of recent searches to store

    let recentSearches = [];
    try {
      // Safely parse existing searches, default to empty array if not found or invalid
      recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (error) {
      console.error("Error parsing recent searches from localStorage:", error);
      recentSearches = []; // Reset if there's an issue with stored data
    }
    console.log('recentSearches', recentSearches);
    console.log('submitTerm', submitTerm);
    let termToStore = {};
    if (typeof submitTerm === 'string') {
      // For raw string searches, store just the label
      termToStore = { label: submitTerm };
    } else if (submitTerm && submitTerm.label) {
      // For structured dropdown selections, store id, label, and type
      termToStore = {
        ...(submitTerm.stId && { stId: submitTerm.stId }),
        ...(submitTerm.id && { id: submitTerm.id }),
        ...(submitTerm.gate && { gate: submitTerm.gate }),
        ...(submitTerm.flightID && { flightID: submitTerm.flightID }),
        label: submitTerm.label,
        type: submitTerm.type
      };
    } else {
        // Fallback for unexpected submitTerm formats
        console.warn("Unexpected submitTerm format:", submitTerm);
        return; // Do not store if format is unrecognized
    }

    // Filter out the exact same search (case-insensitive label match, or ID match if available)
    recentSearches = recentSearches.filter(item => {
        if (termToStore.id && item.id) {
            return item.id !== termToStore.id;
        }
        return item.label.toLowerCase() !== termToStore.label.toLowerCase();
    });

    // Add the new search to the beginning of the array with a timestamp
    recentSearches.unshift({ ...termToStore, timestamp: currentTime });

    // Keep only the latest N searches
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
      recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }

    // Save the updated array back to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    // --- END NEW LOCAL STORAGE LOGIC ---

    if (submitTerm) {
      if (typeof submitTerm === 'string') {      // Raw serachterm submit. 
        searchService.fetchRawQuery(submitTerm).then(rawReturn => {
          if (rawReturn) {
            searchValue = rawReturn
            navigate("/details", { state: { searchValue }, userEmail });
            setSelectedValue(submitTerm);
          } else {
            // This else block seems to handle a case where rawReturn is null/undefined
            // and then attempts to use submitTerm as an object, which is incorrect if it's a string.
            // If rawReturn is null, it typically means no direct match, and you might navigate with the original search string.
            // Corrected: If no rawReturn, navigate with the original string.
            setSelectedValue(submitTerm); // Set value to the submitted string
            searchValue = submitTerm;

            navigate("/details", { state: { searchValue }, userEmail });
          };
        });
      } else {
        // Dropdown selection submit. since they have the id, type and such built in.
        console.log("submitTerm", submitTerm);
        searchValue = submitTerm
        navigate("/details", { state: { searchValue }, userEmail });
        setSelectedValue(submitTerm); // Set selected value for dropdown item
      };
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
        navigate(`/airport/${option.id}`);
      } else if (option.type === "Flight") {
        navigate(`/flight/${option.id}`);
      } else if (option.type === "Gate") {
        navigate(`/gate/${option.id}`);
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