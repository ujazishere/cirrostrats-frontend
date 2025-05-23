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
  
  // Tab order for navigation
  const tabOrder = ['departure', 'destination', 'route', 'nas'];
  
  // Simplified swipe handlers with clean animation
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isAnimating) return;
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        changeTab(tabOrder[currentIndex + 1], 'left');
      }
    },
    onSwipedRight: () => {
      if (isAnimating) return;
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex > 0) {
        changeTab(tabOrder[currentIndex - 1], 'right');
      }
    },
    trackTouch: true,
    trackMouse: false,
    preventDefaultTouchmoveEvent: false,
    delta: 50,
    swipeDuration: 300,
  });

  // Store the initial position of the tabs when component mounts
  useEffect(() => {
    if (tabsNavRef.current) {
      // Store the original top position of the tabs
      tabPositionRef.current = tabsNavRef.current.getBoundingClientRect().top + window.scrollY;
    }
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

  // Simple tab change function with direction-based animation
  const changeTab = (tab, direction = null) => {
    if (isAnimating || tab === activeTab) return;
    
    setIsAnimating(true);
    
    // Use CSS classes for animation direction
    const animationClass = direction === 'left' ? 'slide-left' : 
                           direction === 'right' ? 'slide-right' : 'fade';
    
    // Add exit animation class
    if (contentRef.current) {
      contentRef.current.className = `weather-tabs-content ${animationClass}-exit`;
    }
    
    // Short timeout to allow exit animation to start
    setTimeout(() => {
      // Change tab
      setActiveTab(tab);
      
      // Set enter animation on next render
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.className = `weather-tabs-content ${animationClass}-enter`;
          
          // Remove animation classes after animation completes
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.className = 'weather-tabs-content';
            }
            setIsAnimating(false);
          }, 300);
        } else {
          setIsAnimating(false);
        }
      }, 50);
    }, 250);
  };

  // Handle tab button click
  const handleTabChange = (tab) => {
    if (isAnimating || tab === activeTab) return;
    
    // Preserve scroll position when changing tabs
    const currentScrollY = window.scrollY;
    
    // Get direction based on tab order
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(tab);
    const direction = newIndex > currentIndex ? 'left' : 'right';
    
    // Change tab with animation
    changeTab(tab, direction);
    
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
      {/* CSS for animations - include in your stylesheet or as inline styles */}
      <style>
        {`
          .slide-left-exit {
            animation: slideLeftExit 0.25s forwards;
          }
          .slide-left-enter {
            animation: slideLeftEnter 0.3s forwards;
          }
          .slide-right-exit {
            animation: slideRightExit 0.25s forwards;
          }
          .slide-right-enter {
            animation: slideRightEnter 0.3s forwards;
          }
          .fade-exit {
            animation: fadeOut 0.15s forwards;
          }
          .fade-enter {
            animation: fadeIn 0.2s forwards;
          }
          
          @keyframes slideLeftExit {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-15%); opacity: 0; }
          }
          @keyframes slideLeftEnter {
            from { transform: translateX(15%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideRightExit {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(15%); opacity: 0; }
          }
          @keyframes slideRightEnter {
            from { transform: translateX(-15%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      
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

      {/* Tab content */}
      <div 
        ref={contentRef}
        className="weather-tabs-content"
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