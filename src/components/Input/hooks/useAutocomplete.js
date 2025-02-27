// hooks/useAutocomplete.js
import { useState } from "react";
import useInputHandlers from "./useInputHandlers";
export default function useAutocomplete(suggestions, searchTerm, setSearchTerm, navigate) {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

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
  
  // const handleInputChange = (event) => useInputHandlers.handleInputChange(event, searchTerm, suggestions, setSearchTerm, navigate);

  const handleFocus = () => {
    // setIsExpanded(true);
    setOpen(searchTerm.length > 0);
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


  return {
    open,
    setOpen,
    selectedOption,
    handleOptionSelect,
    // handleInputChange,
    handleFocus,
    handleBlur
  };
}