import React, { useState, useEffect } from "react";

// hooks/useInputHandlers.js
const useInputHandlers = (trackSearch) => {
  
  // Other handlers...
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    print('searchValue', searchValue);
    trackSearch(inputValue, searchValue.label);
    navigate("/details", { state: { searchValue } });
  };

  const handleSuggestionClick = (searchTerm) => {
    setInputValue(searchTerm);
    const matchingSuggestion = filteredSuggestions.find(
      suggestion => suggestion.label.toLowerCase() === searchTerm.toLowerCase()
    );
    if (matchingSuggestion) {
      setSelectedValue(matchingSuggestion);
      navigate("/details", { state: { searchValue: matchingSuggestion } });
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
    const elements = {
      navbar: ".navbar",
      searchbar: ".searchbar-container",
      title: ".home__title",
      googleButton: ".google-button",
      utcContainer: ".utc__container"
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
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTimeout(() => {
        setIsExpanded(false);
        const elements = {
          navbar: ".navbar",
          searchbar: ".searchbar-container",
          title: ".home__title",
          googleButton: ".google-button",
          utcContainer: ".utc__container"
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

  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && inlinePrediction) {
      event.preventDefault();
      const newValue = inputValue + inlinePrediction;
      setInputValue(newValue);
      
      const matchingSuggestion = filteredSuggestions.find(
        suggestion => suggestion.label.toLowerCase() === newValue.toLowerCase()
      );
      
      if (matchingSuggestion) {
        setSelectedValue(matchingSuggestion);
      }
    }
  };

  return { handleSubmit,
           handleSuggestionClick,
           handleFocus,
           handleBlur,
           handleKeyDown
  };
};

export default useInputHandlers;