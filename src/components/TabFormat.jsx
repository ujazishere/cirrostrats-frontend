import React, { useEffect, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import AirportCard from './AirportCard';
import NASDetails from "./NASDetails";
import RoutePanel from "./RoutePanel";

const TabFormat = ({
  flightData, 
  weather,
  NAS,
  hideChildSearchBars = false // Add this prop to control search bars
}) => {
  // Weather for Airports
  const dep_weather = weather.departureWeatherLive;
  const dest_weather = weather.arrivalWeatherLive;
  const departure_alternate_weather = weather.departureAlternateWeatherLive
  const arrival_alternate_weather = weather.arrivalAlternateWeatherLive
  // TODO: priority should be mdb and if live is available then live.

  // NAS for airports
  const nasDepartureResponse = NAS.departureNAS;
  const nasDestinationResponse = NAS.arrivalNAS;
  const nasDepartureAlternateResponse = NAS.departureAlternateNAS;
  const nasDestinationAlternateResponse = NAS.arrivalAlternateNAS;


  // Helper function to check if weather data is available and meaningful
  const hasWeatherData = (weatherData) => {
    if (!weatherData) return false;
    
    // Check if it's an empty object
    if (typeof weatherData === 'object' && Object.keys(weatherData).length === 0) {
      return false;
    }
    
    // Check if it's an empty array
    if (Array.isArray(weatherData) && weatherData.length === 0) {
      return false;
    }
    
    // Check if all values are null, undefined, or empty strings
    if (typeof weatherData === 'object' && !Array.isArray(weatherData)) {
      const hasValidData = Object.values(weatherData).some(value => 
        value !== null && value !== undefined && value !== ''
      );
      return hasValidData;
    }
    
    return true;
  };

  // Check if alternate weather data is available
  const hasAltDepWeather = hasWeatherData(flightData?.departureAlternate);
  const hasAltDestWeather = hasWeatherData(flightData?.arrivalAlternate);
  
  // Create dynamic tab order based on available data
  const createTabOrder = () => {
    const tabs = [];
    
    if (hasAltDepWeather) tabs.push('alt-departure');
    tabs.push('departure');
    tabs.push('destination');
    if (hasAltDestWeather) tabs.push('alt-destination');
    
    return tabs;
  };

  const tabOrder = createTabOrder();
  
  // Set default active tab - prioritize departure, but fall back to first available tab
  const getDefaultTab = () => {
    if (tabOrder.includes('departure')) return 'departure';
    return tabOrder[0] || 'departure';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [isSticky, setIsSticky] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabsNavRef = useRef(null);
  const contentRef = useRef(null);
  const tabPositionRef = useRef(null);
  const [isNasExpanded, setIsNasExpanded] = useState(true);
  const [isNasDestExpanded, setIsNasDestExpanded] = useState(true);
  // Add state for alternate NAS expansion - using same NAS data
  const [isNasAltDepExpanded, setIsNasAltDepExpanded] = useState(true);
  const [isNasAltDestExpanded, setIsNasAltDestExpanded] = useState(true);
  
  // Update active tab if it becomes unavailable due to data changes
  useEffect(() => {
    if (!tabOrder.includes(activeTab)) {
      setActiveTab(getDefaultTab());
    }
  }, [hasAltDepWeather, hasAltDestWeather]);
  
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

  // Helper function to get NAS titles
  const getNASTitle = (nasResponse) => {
    if (!nasResponse) return "NAS Status";
    
    // Get the first key from the NAS response
    const firstKey = Object.keys(nasResponse)[0];
    return firstKey || "NAS Status";
  };

  return (
    <div className="weather-container">
      {/* TODO: This route section should not be here since this file is dedicated for tab format*/}
      {/* Route section - now outside of tabs */}
      <div className="route-section">
        <RoutePanel flightData={flightData} />
      </div>

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
        
        {/* Tabs navigation - conditionally rendered based on available data */}
        <div 
          ref={tabsNavRef}
          className={`weather-tabs-navigation ${isSticky ? 'sticky' : ''}`}
          style={{ position: isSticky ? 'fixed' : 'relative', top: isSticky ? '0' : 'auto', width: '100%', zIndex: 1000 }}
        >
          {/* Only show Alt-Dep tab if there's weather data */}
          {hasAltDepWeather && (
            <button 
              className={`weather-tab-button ${activeTab === 'alt-departure' ? 'active' : ''}`}
              onClick={() => handleTabChange('alt-departure')}
              disabled={isAnimating}
              style={{ backgroundColor: activeTab === 'alt-departure' ? '#fff3cd' : '#f8f9fa', color: activeTab === 'alt-departure' ? '#856404' : 'inherit' }}
            >
              Alt-Dep
            </button>
          )}
          
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
          
          {/* Only show Alt-Dest tab if there's weather data */}
          {hasAltDestWeather && (
            <button 
              className={`weather-tab-button ${activeTab === 'alt-destination' ? 'active' : ''}`}
              onClick={() => handleTabChange('alt-destination')}
              disabled={isAnimating}
              style={{ backgroundColor: activeTab === 'alt-destination' ? '#fff3cd' : '#f8f9fa', color: activeTab === 'alt-destination' ? '#856404' : 'inherit' }}
            >
              Alt-Dest
            </button>
          )}
        </div>

        {/* Add padding when tabs are sticky to prevent content jump */}
        {isSticky && <div className="tabs-placeholder" style={{ height: tabsNavRef.current?.offsetHeight || 0 }}></div>}

        {/* Tab content - conditionally rendered */}
        <div 
          ref={contentRef}
          className="weather-tabs-content"
        >
          {/* Alt-Departure Tab - Weather and NAS - only render if data exists */}
          {activeTab === 'alt-departure' && hasAltDepWeather && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>
                Departure Alternate
                </h3>
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>
                  {flightData?.departureAlternate}
                </h3>
              </div>

              <NASDetails nasResponse={nasDepartureAlternateResponse} title={getNASTitle(nasDepartureAlternateResponse)} />
              <AirportCard
                weatherDetails={departure_alternate_weather}
                showSearchBar={!hideChildSearchBars} />
            </div>
          )}

          {/* Departure Tab - Weather and NAS */}
          {activeTab === 'departure' && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title">
                   {flightData?.departure}
                </h3>
              </div>
              
              <NASDetails nasResponse={nasDepartureResponse} title={getNASTitle(nasDepartureResponse)} />
              <AirportCard
                weatherDetails={dep_weather}
                showSearchBar={!hideChildSearchBars} />
            </div>
          )}

          {/* Destination Tab - Weather and NAS */}
          {activeTab === 'destination' && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title">
                  {flightData?.arrival}
                </h3>
              </div>

              <NASDetails nasResponse={nasDestinationResponse} title={getNASTitle(nasDestinationResponse)} />
              <AirportCard
                weatherDetails={dest_weather}
                showSearchBar={!hideChildSearchBars} />
            </div>
          )}

          {/* Alt-Destination Tab -Weather and NAS - only render if data exists */}
          {activeTab === 'alt-destination' && hasAltDestWeather && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>
                Arrival Alternate
                </h3>
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>
                  {flightData?.arrivalAlternate}
                </h3>
              </div>

              <NASDetails nasResponse={nasDestinationAlternateResponse} title={getNASTitle(nasDestinationAlternateResponse)} className="red-text"/>
              <AirportCard
                weatherDetails={arrival_alternate_weather}
                showSearchBar={!hideChildSearchBars} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabFormat;