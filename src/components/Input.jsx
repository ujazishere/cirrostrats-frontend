import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField } from '@mui/material';

const Input = ({ options, onSubmit }) => {
  const [selectedValue, setSelectedValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) { // Mobile breakpoint
        if (window.scrollY > 50) {
          setIsFixed(false);
        } else {
          setIsFixed(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFocus = () => {
    setIsActive(true);
    if (window.innerWidth <= 768) {
      setIsFixed(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const handleBlur = () => {
    setIsActive(false);
    if (window.innerWidth <= 768) {
      document.body.style.overflow = '';
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(selectedValue);
  };

  return (
    <form onSubmit={handleSubmit} className={`search-form ${isFixed ? 'fixed' : ''}`}>
      <Autocomplete
        options={options}
        value={selectedValue}
        onChange={(event, newValue) => setSelectedValue(newValue)}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        className={`home__input ${isActive ? "home__input--active" : ""}`}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            label="Try searching a gate in Newark. Eg. 71x"
            margin="normal"
            InputProps={{
              ...params.InputProps,
              endAdornment: null,
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}
      />
    </form>
  );
};

export default Input;