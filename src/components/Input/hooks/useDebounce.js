// Imports the useState and useEffect hooks from the React library.
import React, { useState, useEffect } from "react";
// Custom hook for debouncing input value changes

// Defines the custom hook 'useDebounce' which takes a value and a delay time as arguments.
const useDebounce = (inputValue, delay) => {
  // Initializes a state variable 'debouncedValue' to store the delayed value.
  // It's initially set to the current inputValue.
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  // The useEffect hook manages the side effect of the timer.
  // It re-runs whenever the inputValue or the delay changes.
  useEffect(() => {
    // Sets up a timer that will update the debouncedValue after the specified delay has passed.
    const timer = setTimeout(() => {
      // Once the timer completes, the state is updated with the latest inputValue.
      setDebouncedValue(inputValue);
    }, delay);

    // This is the cleanup function for the useEffect hook.
    // It runs before the effect runs again, or when the component unmounts.
    return () => {
      // It clears the previously set timer to prevent the state from updating if the inputValue changes again before the delay is over.
      clearTimeout(timer);
    };
  }, [inputValue, delay]); // The dependency array ensures this effect only runs when these values change.

  // The hook returns the debouncedValue, which only updates after the user has stopped typing for the specified delay.
  return debouncedValue;
};

// Exports the useDebounce hook to be used in other components of the application.
export default useDebounce;
