import React, { useState, useEffect } from "react";
// Custom hook for debouncing input value changes
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;