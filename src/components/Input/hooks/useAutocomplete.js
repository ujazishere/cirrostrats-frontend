// hooks/useAutocomplete.js
import { useState } from "react";

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
  
  const handleInputChange = (event, newValue) => {
    setSearchTerm(newValue);
    setOpen(newValue.length > 0);
  };
  
  const handleFocus = () => {
    setOpen(searchTerm.length > 0);
  };
  
  const handleBlur = () => {
    // Small delay to allow click events on options to fire first
    setTimeout(() => setOpen(false), 100);
  };
  
  return {
    open,
    setOpen,
    selectedOption,
    handleOptionSelect,
    handleInputChange,
    handleFocus,
    handleBlur
  };
}