import React, { useState, useEffect } from "react";
// Custom hook for debouncing input value changes
const useDebounce = (inputValue, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(inputValue);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(inputValue);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [inputValue, delay]);

  return debouncedValue;
};

export default useDebounce;