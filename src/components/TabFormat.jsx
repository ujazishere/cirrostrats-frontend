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
  // REMOVED: isSticky state is no longer needed.
  const [isAnimating, setIsAnimating] = useState(false);
  const tabsNavRef = useRef(null);
  const contentRef = useRef(null);
  // REMOVED: tabPositionRef and containerRef are no longer needed for sticky logic.
  
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

  // REMOVED: The useEffect for handling scroll and ResizeObserver for sticky tabs has been removed.
  
  // REMOVED: The useEffect to set a minimum content height is no longer necessary without the sticky header.

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
    
    // REMOVED: Logic for maintaining scroll position with sticky tabs is gone.
  };

  // Helper function to get NAS titles
  const getNASTitle = () => {
    return "NAS Status";
  };

  return (
    // MODIFIED: Removed ref={containerRef} as it's no longer needed
    <div className="weather-container">
      {/* TODO ismail: This route section should not be here since this file is dedicated for tab format*/}
      <div className="route-section">
        <RoutePanel flightData={flightData} />
      </div>

      <div className="weather-tabs-container" {...handlers}>
        <style>
          {`
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
        
        {/* MODIFIED: Tabs navigation no longer has sticky classes or styles */}
        <div 
          ref={tabsNavRef}
          className="weather-tabs-navigation"
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

        {/* REMOVED: Placeholder div for sticky tabs is no longer needed. */}

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