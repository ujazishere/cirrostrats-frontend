import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "./useDebounce";
import useFetchSuggestions from "./useFetchSuggestions";
import useSearch from "./useSearch";

/*
This file manages UI interactions (click, submit, keyboard events)
houses all input handlers.
*/
const useInputHandlers = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  // const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  const debouncedInputValue = useDebounce(inputValue, 300);
  // const { suggestions } = useSearch(debouncedInputValue);

  // const { suggestions} = useSearch(userEmail, isLoggedIn);
  // const { filteredSuggestions } = useFetchSuggestions(debouncedInputValue, suggestions);

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    // if (debouncedInputValue >= 2) return;
    // setSelectedValue(newInputValue);
    // if (!newInputValue) {
    //   setInputValue(newInputValue.label);
    //   // trackSearch(inputValue, newInputValue.label);
    //   navigate("/details", { state: { searchValue: newInputValue } });
    // }
    // setIsExpanded(false);
  };

  // Other handlers...
  const handleSubmit = (e) => {
    if (e) e.preventDefault(); // Prevents default form submission behavior (which was triggering print dialog)

    console.log("handleSubmit searchTerm", searchTerm);
    const searchValue = selectedValue || { value: inputValue, label: inputValue };
    // trackSearch(inputValue, searchValue.label);
    navigate("/details", { state: { searchValue } });
  };

  const handleSuggestionClick = (searchTerm) => {
    setInputValue(searchTerm);
    const matchingSuggestion = filteredSuggestions.find(
      (suggestion) => suggestion.label.toLowerCase() === searchTerm.toLowerCase()
    );
    if (matchingSuggestion) {
      setSelectedValue(matchingSuggestion);
      navigate("/details", { state: { searchValue: matchingSuggestion } });
    }
  };

  const handleFocus = () => {
    // setIsExpanded(true);
    // setOpen(searchTerm.length > 0);
    setOpen(true);
    const elements = {
      navbar: ".navbar",
      searchbar: ".searchbar-container",
      title: ".home__title",
      googleButton: ".google-button",
      utcContainer: ".utc__container",
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
          title: ".home__title",
          googleButton: ".google-button",
          utcContainer: ".utc__container",
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

  // This will be called when the user presses the Tab key -- works with inlinePrediction
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
    // filteredSuggestions,
    handleSubmit,
    handleInputChange,
    handleSuggestionClick,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleOptionSelect,
  };
};

export default useInputHandlers;
