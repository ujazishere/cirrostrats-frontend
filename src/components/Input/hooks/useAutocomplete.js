// hooks/useAutocomplete.js
import { useState } from "react";
import useInputHandlers from "./useInputHandlers";
export default function useAutocomplete(suggestions, searchTerm, setSearchTerm, navigate) {
  // const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const { 
    open,
    handleSubmit,
    handleInputChange,
    handleSuggestionClick,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleOptionSelect
  } = useInputHandlers(searchTerm);
  console.log('open', open);

  
  // const handleInputChange = (event) => useInputHandlers.handleInputChange(event, searchTerm, suggestions, setSearchTerm, navigate);


  return {
    open,
    // setOpen,
    selectedOption,
    handleOptionSelect,
    // handleInputChange,
    handleFocus,
    handleBlur
  };
}