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
const dep_weather = weather?.departureWeatherMdb ?? weather?.departureWeatherLive ?? null;
const dest_weather = weather?.arrivalWeatherMdb ?? weather?.arrivalWeatherLive ?? null;
const departure_alternate_weather = weather?.departureAlternateWeatherMdb ?? weather?.departureAlternateWeatherLive ?? null;
const arrival_alternate_weather = weather?.arrivalAlternateWeatherMdb ?? weather?.arrivalAlternateWeatherLive ?? null;


  // TODO: priority should be mdb and if live is available then live.

  // NAS for airports
  const nasDepartureResponse = NAS?.departureNAS ?? null;
  const nasDestinationResponse = NAS?.arrivalNAS ?? null;
  const nasDepartureAlternateResponse = NAS?.departureAlternateNAS ?? null;
  const nasDestinationAlternateResponse = NAS?.arrivalAlternateNAS ?? null;


  // Helper function to check if weather data is available and meaningful
  const hasWeatherData = (weatherData) => {
    if (!weatherData) return false;
    if (typeof weatherData === 'object' && Object.keys(weatherData).length === 0) return false;
    if (Array.isArray(weatherData) && weatherData.length === 0) return false;
    if (typeof weatherData === 'object' && !Array.isArray(weatherData)) {
      return Object.values(weatherData).some(value => value !== null && value !== undefined && value !== '');
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
  
  const getDefaultTab = () => {
    if (tabOrder.includes('departure')) return 'departure';
    return tabOrder[0] || 'departure';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  // Re-introducing isSticky state to manage the sticky header behavior.
  const [isSticky, setIsSticky] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabsNavRef = useRef(null);
  const contentRef = useRef(null);
  
  const [isNasExpanded, setIsNasExpanded] = useState(true);
  const [isNasDestExpanded, setIsNasDestExpanded] = useState(true);
  const [isNasAltDepExpanded, setIsNasAltDepExpanded] = useState(true);
  const [isNasAltDestExpanded, setIsNasAltDestExpanded] = useState(true);
  
  useEffect(() => {
    if (!tabOrder.includes(activeTab)) {
      setActiveTab(getDefaultTab());
    }
  }, [hasAltDepWeather, hasAltDestWeather]);
  
  // Swipe handlers remain to allow swiping on weather tabs
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

  // this code sniptted is designed to make the tab sticky even when the EDCT table is expanded.
  useEffect(() => {
    const tabsNav = tabsNavRef.current;
    if (!tabsNav) return;

    // A function to calculate and set the sticky point.
    // We'll call this whenever the layout might have changed.
    const calculateStickyPoint = () => {
      if (tabsNav) {
        return tabsNav.getBoundingClientRect().top + window.scrollY;
      }
      return 0;
    };

    let stickyPoint = calculateStickyPoint();

    const handleScroll = () => {
      // Use the 'stickyPoint' variable from the outer scope.
      if (window.scrollY >= stickyPoint) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    // ✅ NEW: Set up the ResizeObserver to watch for layout shifts.
    const observer = new ResizeObserver(() => {
      // When the body resizes (due to content loading, expanding tables, etc.),
      // recalculate the sticky point.
      stickyPoint = calculateStickyPoint();
      // Also, immediately check the scroll position against the new point.
      handleScroll();
    });

    // Start observing the main document body for any size changes.
    observer.observe(document.body);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup function: essential to prevent memory leaks.
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Stop observing when the component unmounts.
      observer.unobserve(document.body);
    };
  }, []);



  // Simple tab change function with direction-based animation
  const changeTab = (tab, direction = null) => {
    if (isAnimating || tab === activeTab) return;
    
    setIsAnimating(true);
    const animationClass = direction === 'left' ? 'slide-left' : 
                           direction === 'right' ? 'slide-right' : 'fade';
    
    if (contentRef.current) {
      contentRef.current.className = `weather-tabs-content ${animationClass}-exit`;
    }
    
    setTimeout(() => {
      setActiveTab(tab);
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.className = `weather-tabs-content ${animationClass}-enter`;
          
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
    
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(tab);
    const direction = newIndex > currentIndex ? 'left' : 'right';
    
    changeTab(tab, direction);
  };

  // Helper function to get NAS titles
  const getNASTitle = () => {
    return "NAS Status";
  };

  return (
    // The container no longer needs a ref for the sticky logic.
    <div className="weather-container">
      {/* TODO ismail LP: This route section should not be here since this file is dedicated for tab format*/}
      <div className="route-section">
        <RoutePanel flightData={flightData} />
      </div>

      <div className="weather-tabs-container" {...handlers}>
        <style>
          {`
            /* This CSS class is applied to the tab navigation when it becomes sticky. */
            .weather-tabs-navigation.sticky {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              z-index: 1000; /* High z-index to ensure it stays on top of other content. */
              background-color: #ffffff; /* A solid background is needed when it's sticky. */
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Adds a subtle shadow for depth. */
              margin: 0; /* Reset margin when sticky */
            }

            /* Animation keyframes for tab transitions */
            .slide-left-exit { animation: slideLeftExit 0.25s forwards; }
            .slide-left-enter { animation: slideLeftEnter 0.3s forwards; }
            .slide-right-exit { animation: slideRightExit 0.25s forwards; }
            .slide-right-enter { animation: slideRightEnter 0.3s forwards; }
            .fade-exit { animation: fadeOut 0.15s forwards; }
            .fade-enter { animation: fadeIn 0.2s forwards; }
            @keyframes slideLeftExit { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-15%); opacity: 0; } }
            @keyframes slideLeftEnter { from { transform: translateX(15%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideRightExit { from { transform: translateX(0); opacity: 1; } to { transform: translateX(15%); opacity: 0; } }
            @keyframes slideRightEnter { from { transform: translateX(-15%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}
        </style>
        
        {/* The tab navigation bar. It gets the 'sticky' class conditionally. */}
        <div 
          ref={tabsNavRef}
          className={`weather-tabs-navigation ${isSticky ? 'sticky' : ''}`}
        >
          {hasAltDepWeather && (
            <button 
              className={`weather-tab-button ${activeTab === 'alt-departure' ? 'active' : ''}`}
              onClick={() => handleTabChange('alt-departure')}
              disabled={isAnimating}
              style={{ backgroundColor: activeTab === 'alt-departure' ? '#fff3cd' : '#f8f9fa', color: activeTab === 'alt-departure' ? '#856404' : 'inherit' }}
            >
              ALT-DEP
            </button>
          )}
          <button 
            className={`weather-tab-button ${activeTab === 'departure' ? 'active' : ''}`}
            onClick={() => handleTabChange('departure')}
            disabled={isAnimating}
          >
            DEPARTURE
          </button>
          <button 
            className={`weather-tab-button ${activeTab === 'destination' ? 'active' : ''}`}
            onClick={() => handleTabChange('destination')}
            disabled={isAnimating}
          >
            DESTINATION
          </button>
          {hasAltDestWeather && (
            <button 
              className={`weather-tab-button ${activeTab === 'alt-destination' ? 'active' : ''}`}
              onClick={() => handleTabChange('alt-destination')}
              disabled={isAnimating}
              style={{ backgroundColor: activeTab === 'alt-destination' ? '#fff3cd' : '#f8f9fa', color: activeTab === 'alt-destination' ? '#856404' : 'inherit' }}
            >
              ALT-DEST
            </button>
          )}
        </div>

        {/* This placeholder div prevents the content from jumping up when the navigation becomes sticky. */}
        {/* It only renders when isSticky is true and takes up the exact height of the navigation bar. */}
        {isSticky && tabsNavRef.current && (
          <div style={{ height: `${tabsNavRef.current.offsetHeight}px` }} />
        )}

        <div 
          ref={contentRef}
          className="weather-tabs-content"
        >
          {activeTab === 'alt-departure' && hasAltDepWeather && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>Departure Alternate</h3>
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>{flightData?.departureAlternate}</h3>
              </div>
              <NASDetails nasResponse={nasDepartureAlternateResponse} title={getNASTitle(nasDepartureAlternateResponse)} />
              <AirportCard weatherDetails={departure_alternate_weather} showSearchBar={!hideChildSearchBars} />
            </div>
          )}

          {activeTab === 'departure' && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title">{flightData?.departure}</h3>
              </div>
              <NASDetails nasResponse={nasDepartureResponse} title={getNASTitle(nasDepartureResponse)} />
              <AirportCard weatherDetails={dep_weather} showSearchBar={!hideChildSearchBars} />
            </div>
          )}

          {activeTab === 'destination' && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title">{flightData?.arrival}</h3>
              </div>
              <NASDetails nasResponse={nasDestinationResponse} title={getNASTitle(nasDestinationResponse)} />
              <AirportCard weatherDetails={dest_weather} showSearchBar={!hideChildSearchBars} />
            </div>
          )}

          {activeTab === 'alt-destination' && hasAltDestWeather && (
            <div className="weather-tab-panel">
              <div className="weather-tab-header">
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>Arrival Alternate</h3>
                <h3 className="weather-tab-title" style={{ color: '#856404' }}>{flightData?.arrivalAlternate}</h3>
              </div>
              <NASDetails nasResponse={nasDestinationAlternateResponse} title={getNASTitle(nasDestinationAlternateResponse)} className="red-text"/>
              <AirportCard weatherDetails={arrival_alternate_weather} showSearchBar={!hideChildSearchBars} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabFormat;