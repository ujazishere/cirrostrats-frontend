import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// hooks/useInputHandlers.js
const useInputHandlers = (searchTerm) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchTerm);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  
  const handleInputChange = (event) => {
    setSelectedValue(newValue);
    if (newValue) {
      setInputValue(newValue.label);
      trackSearch(inputValue, newValue.label);
      navigate("/details", { state: { searchValue: newValue } });
    }
    setIsExpanded(false);
    
  }
  // Other handlers...
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    print('searchValue', searchTerm);
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    // trackSearch(inputValue, searchValue.label);
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
    // setIsExpanded(true);
    setOpen(searchTerm.length > 0);
    setOpen(true);
    console.log("handleFocus open", open);
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
    // Small delay to allow click events on options to fire first
    console.log("handleBlur open", open);
    setTimeout(() => setOpen(false), 100);
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTimeout(() => {
        // setIsExpanded(false);
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


  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(option?.label || "");
    setOpen(false);
    
    // Handle navigation based on selection type
    if (option) {
      if (option.type === 'Airport') {
        navigate(`/airport/${option.id}`);
      } else if (option.type === 'Flight') {
        navigate(`/flight/${option.id}`);
      } else if (option.type === 'Gate') {
        navigate(`/gate/${option.id}`);
      }
    }
  };

  return {
          open,
          handleSubmit,
          handleInputChange,
          handleSuggestionClick,
          handleFocus,
          handleBlur,
          handleKeyDown,
          handleOptionSelect
  };
};

export default useInputHandlers;