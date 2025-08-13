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

  // This useEffect hook handles the logic for making the tab navigation sticky on scroll.
  // It's designed to be robust and smooth across all devices.
  useEffect(() => {
    const tabsNav = tabsNavRef.current;
    // We exit early if the tab navigation element isn't rendered yet.
    if (!tabsNav) return;

    // We calculate the exact vertical position where the tab navigation should become sticky.
    // This is its initial distance from the top of the document, calculated once after the component mounts.
    // getBoundingClientRect().top gives the position relative to the viewport.
    // window.scrollY gives the number of pixels the document is currently scrolled vertically.
    // Adding them together gives the element's absolute position from the top of the document.
    const stickyPoint = tabsNav.getBoundingClientRect().top + window.scrollY;

    // This function will be called every time the user scrolls.
    const handleScroll = () => {
      // We check if the user has scrolled past our calculated sticky point.
      if (window.scrollY >= stickyPoint) {
        // If we've scrolled past the point, we make the header sticky.
        // React's state setters are optimized to prevent re-renders if the state doesn't change.
        setIsSticky(true);
      } else {
        // If we're above the point, we un-stick the header.
        setIsSticky(false);
      }
    };

    // We add the scroll event listener to the window to detect scroll events.
    window.addEventListener('scroll', handleScroll, { passive: true });

    // The cleanup function is crucial. It removes the event listener when the component unmounts,
    // preventing memory leaks and errors.
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // The empty dependency array `[]` is key. It ensures this effect runs only ONCE,
         // right after the component mounts. This is the correct pattern for setting up this kind of event listener.

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
      {/* TODO ismail: This route section should not be here since this file is dedicated for tab format*/}
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