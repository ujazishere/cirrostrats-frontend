import React, { useEffect, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import WeatherCard from './WeatherCard';
import NASDetails from "./NASDetails";
import RoutePanel from "./RoutePanel";

const TabFormat = ({flightData, dep_weather, dest_weather, nasDepartureResponse, nasDestinationResponse }) => {
  const [activeTab, setActiveTab] = useState('departure');
  const [isSticky, setIsSticky] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabsNavRef = useRef(null);
  const contentRef = useRef(null);
  const tabPositionRef = useRef(null);
  const swipeAnimationRef = useRef(null);
  
  // Tab order for navigation
  const tabOrder = ['departure', 'destination', 'route', 'nas'];
  
  // Smooth swipe handlers with proper boundaries
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (isAnimating) return;
      
      // Limit swipe to 30% of screen width
      const maxSwipe = window.innerWidth * 0.3;
      const swipeDistance = Math.min(Math.abs(e.deltaX), maxSwipe);
      const direction = e.deltaX > 0 ? 1 : -1;
      const swipePercent = swipeDistance / maxSwipe;
      
      // Apply transform with boundaries
      if (contentRef.current) {
        contentRef.current.style.transform = `translateX(${direction * swipePercent * 30}%)`;
      }
    },
    onSwipedLeft: () => {
      if (isAnimating) return;
      handleSwipe('left');
    },
    onSwipedRight: () => {
      if (isAnimating) return;
      handleSwipe('right');
    },
    trackTouch: true,
    trackMouse: false,
    preventDefaultTouchmoveEvent: false,
    delta: 50,
    swipeDuration: 500,
  });

  // Handle swipe direction
  const handleSwipe = (direction) => {
    if (isAnimating) return;
    
    const currentIndex = tabOrder.indexOf(activeTab);
    let nextTab = null;
    
    if (direction === 'left' && currentIndex < tabOrder.length - 1) {
      nextTab = tabOrder[currentIndex + 1];
    } else if (direction === 'right' && currentIndex > 0) {
      nextTab = tabOrder[currentIndex - 1];
    }
    
    if (nextTab) {
      animateSwipeTransition(direction, nextTab);
    } else {
      resetPosition();
    }
  };

  // Animate the swipe transition
  const animateSwipeTransition = (direction, nextTab) => {
    setIsAnimating(true);
    const startTime = performance.now();
    const duration = 300; // ms
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (contentRef.current) {
        // Calculate new position (from current to -100% or 100%)
        const targetX = direction === 'left' ? -100 : 100;
        const currentX = parseFloat(contentRef.current.style.transform.replace('translateX(', '').replace('%)', '')) || 0;
        const newX = currentX + (targetX - currentX) * progress;
        
        contentRef.current.style.transform = `translateX(${newX}%)`;
      }
      
      if (progress < 1) {
        swipeAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - change tab and animate in
        setActiveTab(nextTab);
        animateSwipeIn(direction);
      }
    };
    
    swipeAnimationRef.current = requestAnimationFrame(animate);
  };

  // Animate the new tab sliding in
  const animateSwipeIn = (direction) => {
    const startTime = performance.now();
    const duration = 300; // ms
    
    // Set initial position for incoming content (opposite side)
    if (contentRef.current) {
      const initialX = direction === 'left' ? 100 : -100;
      contentRef.current.style.transform = `translateX(${initialX}%)`;
    }
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (contentRef.current) {
        // Slide in the new content (from 100%/-100% to 0%)
        const newX = direction === 'left' ? 
          100 - (100 * progress) : 
          -100 + (100 * progress);
        
        contentRef.current.style.transform = `translateX(${newX}%)`;
      }
      
      if (progress < 1) {
        swipeAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (contentRef.current) {
          contentRef.current.style.transform = '';
        }
        setIsAnimating(false);
        swipeAnimationRef.current = null;
      }
    };
    
    swipeAnimationRef.current = requestAnimationFrame(animate);
  };

  // Reset position if swipe didn't result in tab change
  const resetPosition = () => {
    const startTime = performance.now();
    const duration = 200; // ms
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (contentRef.current) {
        // Return to original position (0%)
        const currentX = parseFloat(contentRef.current.style.transform.replace('translateX(', '').replace('%)', '')) || 0;
        const newX = currentX * (1 - progress);
        
        contentRef.current.style.transform = `translateX(${newX}%)`;
      }
      
      if (progress < 1) {
        swipeAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (contentRef.current) {
          contentRef.current.style.transform = '';
        }
        swipeAnimationRef.current = null;
      }
    };
    
    swipeAnimationRef.current = requestAnimationFrame(animate);
  };

  // Helper function to change tab with fade animation
  const changeTab = (tab) => {
    if (activeTab === tab || isAnimating) return;
    
    setIsAnimating(true);
    
    // Add fade-out class to current content
    if (contentRef.current) {
      contentRef.current.classList.add('fade-out');
    }
    
    // Wait for fade out, then change tab and fade in
    setTimeout(() => {
      setActiveTab(tab);
      
      // Remove fade-out class and add fade-in
      if (contentRef.current) {
        contentRef.current.classList.remove('fade-out');
        contentRef.current.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.classList.remove('fade-in');
          }
          setIsAnimating(false);
        }, 250);
      } else {
        setIsAnimating(false);
      }
    }, 150);
  };

  // Store the initial position of the tabs when component mounts
  useEffect(() => {
    if (tabsNavRef.current) {
      // Store the original top position of the tabs
      tabPositionRef.current = tabsNavRef.current.getBoundingClientRect().top + window.scrollY;
    }

    // Clean up animation frame on unmount
    return () => {
      if (swipeAnimationRef.current) {
        cancelAnimationFrame(swipeAnimationRef.current);
      }
    };
  }, []);

  // Effect to handle the sticky behavior for tabs
  useEffect(() => {
    const handleScroll = () => {
      if (!tabsNavRef.current || tabPositionRef.current === null) return;
      
      // Check if we've scrolled past the original position of the tabs
      setIsSticky(window.scrollY >= tabPositionRef.current);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect to ensure minimum content height so scroll behavior is consistent
  useEffect(() => {
    if (contentRef.current) {
      // Calculate viewport height minus the tabs navigation height
      const tabsHeight = tabsNavRef.current?.offsetHeight || 0;
      // Set minimum height to 100vh minus tabs height, plus some padding
      contentRef.current.style.minHeight = `calc(100vh - ${tabsHeight}px)`;
    }
  }, [activeTab]);

  // Handle tab change without losing sticky behavior
  const handleTabChange = (tab) => {
    if (isAnimating || tab === activeTab) return;
    
    // Preserve scroll position when changing tabs
    const currentScrollY = window.scrollY;
    
    // Change tab with animation
    changeTab(tab);
    
    // Use requestAnimationFrame to ensure DOM updates before scrolling
    requestAnimationFrame(() => {
      // Maintain scroll position if we're in sticky mode
      if (isSticky) {
        window.scrollTo(0, Math.max(tabPositionRef.current, currentScrollY));
      }
    });
  };

  return (
    <div className="weather-tabs-container" {...handlers}>
      {/* Tabs navigation - add sticky class conditionally */}
      <div 
        ref={tabsNavRef}
        className={`weather-tabs-navigation ${isSticky ? 'sticky' : ''}`}
        style={{ position: isSticky ? 'fixed' : 'relative', top: isSticky ? '0' : 'auto', width: '100%', zIndex: 1000 }}
      >
        <button 
          className={`weather-tab-button ${activeTab === 'departure' ? 'active' : ''}`}
          onClick={() => handleTabChange('departure')}
          disabled={isAnimating}
        >
          Departure
        </button>
        <button 
          className={`weather-tab-button ${activeTab === 'destination' ? 'active' : ''}`}
          onClick={() => handleTabChange('destination')}
          disabled={isAnimating}
        >
          Destination
        </button>
        <button 
          className={`weather-tab-button ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => handleTabChange('route')}
          disabled={isAnimating}
        >
          Route
        </button>
        <button 
          className={`weather-tab-button ${activeTab === 'nas' ? 'active' : ''}`}
          onClick={() => handleTabChange('nas')}
          disabled={isAnimating}
        >
          NAS
        </button>
      </div>

      {/* Add padding when tabs are sticky to prevent content jump */}
      {isSticky && <div className="tabs-placeholder" style={{ height: tabsNavRef.current?.offsetHeight || 0 }}></div>}

      {/* Tab content with overflow hidden to contain swipe */}
      <div 
        ref={contentRef}
        className="weather-tabs-content"
        style={{
          willChange: 'transform',
          overflowX: 'hidden' // Prevent horizontal scroll during swipe
        }}
      >
        {/* Departure Weather Tab */}
        {activeTab === 'departure' && (
          <div className="weather-tab-panel">
            <div className="weather-tab-header">
              <h3 className="weather-tab-title">
                 {flightData?.departure}
              </h3>
            </div>
            {dep_weather ? (
              <WeatherCard arrow={false} title="Departure Weather" weatherDetails={dep_weather} showSearchBar={false} />
            ) : (
              <div className="no-weather-data">No weather data available</div>
            )}
          </div>
        )}

        {/* Destination Weather Tab */}
        {activeTab === 'destination' && (
          <div className="weather-tab-panel">
            <div className="weather-tab-header">
              <h3 className="weather-tab-title">
                {flightData?.arrival}
              </h3>
            </div>
            {dest_weather ? (
              <WeatherCard arrow={false} title="Destination Weather" weatherDetails={dest_weather} showSearchBar={false} />
            ) : (
              <div className="no-weather-data">No weather data available</div>
            )}
          </div>
        )}

        {/* Route Tab */}
        {activeTab === 'route' && <RoutePanel flightData={flightData} />}

        {/* NAS Table Tab */}
        {activeTab === 'nas' && (
          <div className="weather-tab-panel">
            <div className="weather-tab-header">
              <h3 className="weather-tab-title">
                NAS Information
              </h3>
            </div>
            <div className="nas-tab-content">
              <NASDetails nasResponse={nasDepartureResponse} title="Airport Closure - Departure" />
              <NASDetails nasResponse={nasDestinationResponse} title="Airport Closure - Destination" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabFormat;