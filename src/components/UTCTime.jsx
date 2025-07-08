// UTCTime.jsx
// Redesigned React component with Sleek Glassmorphism design
// Displays UTC time in DD on top, HHMMz below when expanded
// Shows ZULU text and clock icon when collapsed
import React, { useEffect, useState, useRef, useCallback } from "react";

// Global flag to ensure only one instance exists
let instanceExists = false;
const COMPONENT_ID = 'utc-time-widget-singleton';

// Define the UTCTime component
const UTCTime = () => {
  // State to hold the current date parts
  const [currentDay, setCurrentDay] = useState("");
  const [currentTime, setCurrentTime] = useState("");
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
  // Ref to track initial pointer position (mouse or touch)
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
      
      // Set the day and time separately
      setCurrentDay(day);
      setCurrentTime(`${hour}${minute}Z`);
    };

    updateFormattedDate(); // Initial call to set the time immediately
    // Set up an interval to update the time every minute
    const intervalId = setInterval(updateFormattedDate, 60000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [shouldRender]); // Depend on shouldRender

  // Helper function to get pointer coordinates (works for both mouse and touch)
  const getPointerCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // Handle drag functionality (works for both mouse and touch)
  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    
    const coords = getPointerCoords(e);
    
    // Check if pointer has moved enough to be considered a drag
    const deltaX = Math.abs(coords.x - dragStartRef.current.x);
    const deltaY = Math.abs(coords.y - dragStartRef.current.y);
    
    if (deltaX > 3 || deltaY > 3) {
      setHasDragged(true);
    }
    
    const windowHeight = window.innerHeight;
    const elementHeight = dragRef.current?.offsetHeight || 50;
    const pointerY = coords.y;
    
    // Calculate percentage position, constrained between margins
    const minY = elementHeight / 2;
    const maxY = windowHeight - elementHeight / 2;
    const constrainedY = Math.max(minY, Math.min(maxY, pointerY));
    const percentage = (constrainedY / windowHeight) * 100;
    
    setPosition(percentage);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.touchAction = '';
      
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
      document.body.style.touchAction = 'none'; // Prevent scrolling on mobile
      
      // Add both mouse and touch event listeners
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('mouseup', handlePointerUp);
      document.addEventListener('touchmove', handlePointerMove, { passive: false });
      document.addEventListener('touchend', handlePointerUp);
      document.addEventListener('touchcancel', handlePointerUp);
      
      return () => {
        document.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('mouseup', handlePointerUp);
        document.removeEventListener('touchmove', handlePointerMove);
        document.removeEventListener('touchend', handlePointerUp);
        document.removeEventListener('touchcancel', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp, shouldRender]);

  const handlePointerDown = (e) => {
    if (!shouldRender) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getPointerCoords(e);
    
    // Store initial pointer position
    dragStartRef.current = { x: coords.x, y: coords.y };
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
      className="utc-glass__container" 
      style={{ top: `${position}%` }}
      ref={dragRef}
    >
      <button 
        className={`utc-glass__widget ${isVisible ? 'utc-glass__widget--expanded' : 'utc-glass__widget--collapsed'} ${isDragging ? 'utc-glass__widget--dragging' : ''}`}
        onClick={handleClick}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        aria-label="Toggle UTC Clock"
        style={{ touchAction: 'none' }}
      >
        {!isVisible ? (
          // Collapsed state: Show ZULU text and clock icon
          <div className="utc-glass__collapsed-content">
            <div className="utc-glass__clock-icon">🕐</div>
            <div className="utc-glass__zulu-text">ZULU</div>
          </div>
        ) : (
          // Expanded state: Show day on top, time below
          <div className="utc-glass__expanded-content">
            <div className="utc-glass__clock-icon">🕐</div>
            <div className="utc-glass__time-info">
              <div className="utc-glass__day">{currentDay}</div>
              <div className="utc-glass__time">{currentTime}</div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

export default UTCTime;