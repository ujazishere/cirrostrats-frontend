import React, { useEffect, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import WeatherCard from './WeatherCard'; // Assuming you'll also extract WeatherCard to its own file
import NASDetails from "./NASDetails";
import RoutePanel from "./RoutePanel";

/**
 * Component for tabbed content display for departure and destination weather
 * @param {Object} props
 * @param {Object} props.dep_weather - Departure weather data
 * @param {Object} props.dest_weather - Destination weather data
 * @param {Object} props.flightData - Flight details object
 * @param {Object} props.nasDepartureResponse - NAS info for departure airport
 * @param {Object} props.nasDestinationResponse - NAS info for destination airport
 */
const TabFormat = ({flightData, dep_weather, dest_weather, nasDepartureResponse, nasDestinationResponse }) => {
  const [activeTab, setActiveTab] = useState('departure');
  const [isSticky, setIsSticky] = useState(false);
  const [animateDirection, setAnimateDirection] = useState(null);
  const tabsNavRef = useRef(null);
  const contentRef = useRef(null);
  const tabPositionRef = useRef(null);
  
  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeTab === 'departure') {
        setActiveTab('destination');
        setAnimateDirection('left');
      } else if (activeTab === 'destination') {
        setActiveTab('route');
        setAnimateDirection('left');
      } else if (activeTab === 'route') {
        setActiveTab('nas');
        setAnimateDirection('left');
      }
    },
    onSwipedRight: () => {
      if (activeTab === 'nas') {
        setActiveTab('route');
        setAnimateDirection('right');
      } else if (activeTab === 'route') {
        setActiveTab('destination');
        setAnimateDirection('right');
      } else if (activeTab === 'destination') {
        setActiveTab('departure');
        setAnimateDirection('right');
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // Store the initial position of the tabs when component mounts
  useEffect(() => {
    if (tabsNavRef.current) {
      // Store the original top position of the tabs
      tabPositionRef.current = tabsNavRef.current.getBoundingClientRect().top + window.scrollY;
    }
  }, []);

  // Effect to handle the sticky behavior for tabs - only becomes sticky when scrolled past its original position
  useEffect(() => {
    const handleScroll = () => {
      if (!tabsNavRef.current || tabPositionRef.current === null) return;
      
      // Check if we've scrolled past the original position of the tabs
      if (window.scrollY >= tabPositionRef.current) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect to reset animation direction after the animation completes
  useEffect(() => {
    if (animateDirection) {
      const timeout = setTimeout(() => setAnimateDirection(null), 300); // Match the duration of the CSS animation
      return () => clearTimeout(timeout);
    }
  }, [animateDirection]);

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
    // Preserve scroll position when changing tabs
    const currentScrollY = window.scrollY;
    setActiveTab(tab);
    
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
        >
          Departure
        </button>
        <button 
          className={`weather-tab-button ${activeTab === 'destination' ? 'active' : ''}`}
          onClick={() => handleTabChange('destination')}
        >
          Destination
        </button>
        <button 
          className={`weather-tab-button ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => handleTabChange('route')}
        >
          Route
        </button>
        <button 
          className={`weather-tab-button ${activeTab === 'nas' ? 'active' : ''}`}
          onClick={() => handleTabChange('nas')}
        >
          NAS
        </button>
      </div>

      {/* Add padding when tabs are sticky to prevent content jump */}
      {isSticky && <div className="tabs-placeholder" style={{ height: tabsNavRef.current?.offsetHeight || 0 }}></div>}

      {/* Tab content */}
      <div 
        ref={contentRef}
        className={`weather-tabs-content ${animateDirection ? `animate-${animateDirection}` : ''}`}
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
              <WeatherCard arrow={false} title="Departure Weather" weatherDetails={dep_weather} />
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
              <WeatherCard arrow={false} title="Destination Weather" weatherDetails={dest_weather} />
            ) : (
              <div className="no-weather-data">No weather data available</div>
            )}
          </div>
        )}

        {/* Route Tab - Now using the imported component */}
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