import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "./useDebounce";
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

  // const debouncedInputValue = useDebounce(inputValue, 300);
  
  const handleValue = (value) => {
    setSelectedValue(value);
  }

  const handleInputChange = (event, newInputValue, userEmail,) => {
    // TODO:
    // Here the user should have their own most popular search terms displayed on the top in blue in the dropdown.
    setInputValue(newInputValue);
    // trackSearch(userEmail, newInputValue);
  }
  
    // // Update inline prediction
    // const prediction = findInlinePrediction(debouncedInputValue, newFilteredSuggestions);
    // setInlinePrediction(prediction);

    // if (debouncedInputValue.length >= minCharsForAutofill && newFilteredSuggestions.length > 0) {
    //   if (isUniqueMatch(debouncedInputValue, newFilteredSuggestions)) {
    //     const exactMatch = newFilteredSuggestions.find(suggestion => 
    //       suggestion.label.toLowerCase().startsWith(lowercaseInputValue)
    //     );
        
    //     if (exactMatch) {
    //       setSelectedValue(exactMatch);
    //       setIsExpanded(true);
    //     }
    //   } else {
    //     setSelectedValue(null);
    //   }
    // }

  // Other handlers...
  const handleSubmit = (e, submitTerm, userEmail) => {
    if (e) e.preventDefault(); // Prevents default form submission behavior (which was triggering print dialog)
    let searchValue;
    trackSearch(userEmail, submitTerm);
    if (submitTerm) {
      if (typeof submitTerm === 'string') {      // Raw serachterm submit. 
        searchService.fetchRawQuery(submitTerm).then(rawReturn => {
          if (rawReturn) {
            searchValue = rawReturn
            navigate("/details", { state: { searchValue } });
            setSelectedValue(submitTerm);
          } else {
          setSelectedValue(submitTerm.label);
          searchValue = submitTerm
          navigate("/details", { state: { searchValue } });
          };
        });
      } else {
      // Process the dropdown selection. since they have the id, type and such built in.
      searchValue = submitTerm
      navigate("/details", { state: { searchValue } });
    };

    } 
  }
      // TODO Just make submitTerm uppercase since it can be as is without label
    // const searchValue = submitTerm.mdb || { value: inputValue, label: inputValue };
    // trackSearch(inputValue, searchValue.label);

  // const handleSuggestionClick = (searchTerm) => {
  //   setInputValue(searchTerm);
  //   const matchingSuggestion = filteredSuggestions.find(
  //     (suggestion) => suggestion.label.toLowerCase() === searchTerm.toLowerCase()
  //   );
  //   if (matchingSuggestion) {
  //     setSelectedValue(matchingSuggestion);
  //     navigate("/details", { state: { searchValue: matchingSuggestion } });
  //   }
  // };

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
      WeatherCard: ".weather-cards",
      title2: ".hero-title-2",
      navlinks: ".nav-links-container",
      clearrrr: ".route-tab-content",



      
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
          WeatherCard: ".weather-cards",
          title2: ".hero-title-2",
          navlinks: ".nav-links-container",
          clearrrr: ".route-tab-content",

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
    if (event.key === "Tab" && inlinePrediction) {
      event.preventDefault();
      const newInputValue = inputValue + inlinePrediction;
      setInputValue(newInputValue);

      const matchingSuggestion = filteredSuggestions.find(
        (suggestion) => suggestion.label.toLowerCase() === newInputValue.toLowerCase()
      );

      if (matchingSuggestion) {
        setSelectedValue(matchingSuggestion);
      }
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(option?.label || "");
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
