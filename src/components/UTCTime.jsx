// UTCTime.jsx
// This React component displays the current UTC time in a formatted string ("UTC: DD HH:MMZ")
// and updates every minute to stay in sync with real time. It uses React hooks to manage
// the time state and lifecycle effects.
import React, { useEffect, useState, useRef, useCallback } from "react";

// Global flag to ensure only one instance exists
let instanceExists = false;
const COMPONENT_ID = 'utc-time-widget-singleton';

// Define the UTCTime component
const UTCTime = () => {
  // State to hold the current date in UTC format
  const [currentDate, setCurrentDate] = useState("");
  // State to control if clock is visible
  const [isVisible, setIsVisible] = useState(false);
  // State to control vertical position
  const [position, setPosition] = useState(() => {
    // Get saved position from sessionStorage or default to 50%
    const saved = sessionStorage.getItem('utc-clock-position');
    return saved ? parseFloat(saved) : 50;
  });
  // State to track if dragging
  const [isDragging, setIsDragging] = useState(false);
  // State to track if drag actually happened
  const [hasDragged, setHasDragged] = useState(false);
  // State to control if component should render
  const [shouldRender, setShouldRender] = useState(false);
  
  // Ref for the draggable element
  const dragRef = useRef(null);
  // Ref to track initial mouse position
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Check if instance already exists and handle singleton logic
  useEffect(() => {
    // Check if DOM element already exists
    const existingElement = document.getElementById(COMPONENT_ID);
    
    if (existingElement && !instanceExists) {
      // Remove existing DOM element
      existingElement.remove();
    }
    
    if (!instanceExists) {
      instanceExists = true;
      setShouldRender(true);
    }

    // Cleanup on unmount
    return () => {
      instanceExists = false;
    };
  }, []);

  // Save position to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('utc-clock-position', position.toString());
  }, [position]);

  useEffect(() => {
    if (!shouldRender) return;

    // Function to format the current UTC time
    const updateFormattedDate = () => {
      const date = new Date(); // Create a new date object
      const day = String(date.getUTCDate()).padStart(2, "0"); // Get and pad UTC day
      const hour = String(date.getUTCHours()).padStart(2, "0"); // Get and pad UTC hour
      const minute = String(date.getUTCMinutes()).padStart(2, "0"); // Get and pad UTC minute
      // Construct the formatted UTC time string
      const currentDate = `UTC: ${day} ${hour}:${minute}Z`;
      setCurrentDate(currentDate); // Update the state
    };

    updateFormattedDate(); // Initial call to set the time immediately
    // Set up an interval to update the time every minute
    const intervalId = setInterval(updateFormattedDate, 60000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [shouldRender]); // Depend on shouldRender

  // Handle drag functionality
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Check if mouse has moved enough to be considered a drag
    const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
    const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
    
    if (deltaX > 3 || deltaY > 3) {
      setHasDragged(true);
    }
    
    const windowHeight = window.innerHeight;
    const elementHeight = dragRef.current?.offsetHeight || 50;
    const mouseY = e.clientY;
    
    // Calculate percentage position, constrained between margins
    const minY = elementHeight / 2;
    const maxY = windowHeight - elementHeight / 2;
    const constrainedY = Math.max(minY, Math.min(maxY, mouseY));
    const percentage = (constrainedY / windowHeight) * 100;
    
    setPosition(percentage);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // Small delay to prevent immediate click after drag
      setTimeout(() => {
        setHasDragged(false);
      }, 100);
    }
  }, [isDragging]);

  useEffect(() => {
    if (!shouldRender) return;

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, shouldRender]);

  const handleMouseDown = (e) => {
    if (!shouldRender) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Store initial mouse position
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setHasDragged(false);
    setIsDragging(true);
  };

  const handleClick = (e) => {
    if (!shouldRender) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Only toggle if we haven't dragged
    if (!hasDragged && !isDragging) {
      setIsVisible(!isVisible);
    }
  };

  // Don't render if this isn't the singleton instance
  if (!shouldRender) {
    return null;
  }

  return (
    // Render the UTC time inside a container with unique ID
    <div 
      id={COMPONENT_ID}
      className="utc__container" 
      style={{ top: `${position}%` }}
      ref={dragRef}
    >
      <button 
        className={`utc__toggle-button ${isDragging ? 'utc__toggle-button--dragging' : ''}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        aria-label="Toggle UTC Clock"
      >
        <span className="utc__clock-icon">🕐</span>
        <div className={`utc__time-display ${isVisible ? 'utc__time-display--visible' : ''}`}>
          <span className="utc__time-text">{currentDate}</span>
        </div>
      </button>
    </div>
  );
};

export default UTCTime;