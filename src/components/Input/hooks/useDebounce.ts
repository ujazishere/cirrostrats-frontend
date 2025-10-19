import { useState, useEffect } from "react";

// Custom hook for debouncing input value changes
const useDebounce = <T>(inputValue: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(inputValue);
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
