/**
 * This file contains React components for displaying flight and weather information:
 * - FlightCard: Main component displaying comprehensive flight details including departure/arrival info
 * - WeatherCard: Displays weather information (D-ATIS, METAR, TAF) with text highlighting
 * - GateCard: Shows departure information for a specific gate
 * 
 * Key features:
 * - Responsive design with mobile-specific scroll behavior
 * - Weather text highlighting for specific patterns
 * - Real-time flight status display
 * - Integration with NAS (National Airspace System) data
 * - Route visualization support via SkyVector
 * - Tabbed interface for departure and destination weather
 */

import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from "react-router-dom";
import NASDetails from "./NASDetails";
import { useSwipeable } from 'react-swipeable'; // Import the swipeable library
import Input from "../components/Input/Index"; // Ensure this path is correct
import { highlightWeatherText } from "../components/utility/highlightWeatherText";

/**
 * Component to display weather information including D-ATIS, METAR, and TAF
 * @param {Object} props
 * @param {boolean} props.arrow - Display arrow indicator
 * @param {string} props.title - Card title
 * @param {Object} props.weatherDetails - Weather data object
 */
const WeatherCard = ({ arrow, title, weatherDetails }) => {
  const datis = weatherDetails?.datis;
  const metar = weatherDetails?.metar;
  const taf = weatherDetails?.taf;

  return (
    <div className="card">
      <div>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">D-ATIS</h3>
          <span className="card__depature__time">34 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(datis) }}></p>
        </div>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">METAR</h3>
          <span className="card__depature__time">34 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(metar) }}></p>
        </div>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">TAF</h3>
          <span className="card__depature__time">166 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(taf) }}></p>
        </div>
      </div>
    </div>
  );
};

/**
 * Component to display departure information for a specific gate
 * @param {Object} props
 * @param {Object} props.gateData - Gate and flight status information
 */
const GateCard = ({ gateData }) => {
  const formatDateTime = (dateString) => {
    if (!dateString || dateString === 'None') return 'None';
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hours}:${minutes}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const compareDates = (dateA, dateB) => {
    if (!dateA || dateA === 'None') return 1;
    if (!dateB || dateB === 'None') return -1;

    const dateObjA = new Date(dateA);
    const dateObjB = new Date(dateB);

    const monthA = dateObjA.getMonth();
    const monthB = dateObjB.getMonth();
    
    if (Math.abs(monthA - monthB) > 6) {
      if (monthA > 6 && monthB < 6) {
        return 1;
      }
      if (monthB > 6 && monthA < 6) {
        return -1;
      }
    }

    return dateObjB - dateObjA;
  };

  const getFlightData = () => {
    if (!gateData) return [];
    
    let flightArray;
    if (gateData.flightStatus) {
      flightArray = Object.entries(gateData.flightStatus).map(([flightNumber, details]) => ({
        flightNumber,
        scheduled: details.scheduledDeparture || 'None',
        actual: details.actualDeparture || 'None'
      }));
    } else if (Array.isArray(gateData)) {
      flightArray = gateData;
    } else {
      return [];
    }

    return flightArray.sort((a, b) => compareDates(a.scheduled, b.scheduled));
  };

  return (
    <div className="gate-card">
      <table className="departure-table">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Scheduled</th>
            <th>Actual</th>
          </tr>
        </thead>
        <tbody>
          {getFlightData().map((flight, index) => (
            <tr key={index} className={index % 2 === 0 ? 'dark-row' : 'light-row'}>
              <td>{flight.flightNumber}</td>
              <td>{formatDateTime(flight.scheduled)}</td>
              <td>{formatDateTime(flight.actual)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Component for tabbed content display for departure and destination weather
 * @param {Object} props
 * @param {Object} props.dep_weather - Departure weather data
 * @param {Object} props.dest_weather - Destination weather data
 * @param {Object} props.flightDetails - Flight details object
 * @param {Object} props.nasDepartureResponse - NAS info for departure airport
 * @param {Object} props.nasDestinationResponse - NAS info for destination airport
 */
const WeatherTabs = ({ dep_weather, dest_weather, flightDetails, nasDepartureResponse, nasDestinationResponse }) => {
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
                 {flightDetails?.departure_ID}
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
                {flightDetails?.destination_ID}
              </h3>
            </div>
            {dest_weather ? (
              <WeatherCard arrow={false} title="Destination Weather" weatherDetails={dest_weather} />
            ) : (
              <div className="no-weather-data">No weather data available</div>
            )}
          </div>
        )}

        {/* Route Tab */}
        {activeTab === 'route' && (
          <div className="weather-tab-panel">
            <div className="weather-tab-header">
              <h3 className="weather-tab-title">
                Flight Route
              </h3>
            </div>
            <div className="route-tab-content">
              {flightDetails?.route ? (
                <div className="route-display">
                  <div className="route-info">
                    <div className="route-text">{flightDetails.route}</div>
                    {flightDetails?.sv && (
                      <div className="route-actions">
                        <a href={flightDetails.sv} target="_blank" rel="noopener noreferrer" className="sky-vector-link">
                          View on SkyVector
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-route-data">No route information available</div>
              )}
            </div>
          </div>
        )}

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

/**
 * Main component for displaying comprehensive flight information
 * Includes departure/arrival details, weather, route, and NAS information
 * Features responsive design with sticky headers on mobile
 * 
 * @param {Object} props
 * @param {Object} props.flightDetails - Flight information
 * @param {Object} props.dep_weather - Departure weather data
 * @param {Object} props.dest_weather - Destination weather data
 * @param {Object} props.nasDepartureResponse - NAS info for departure airport
 * @param {Object} props.nasDestinationResponse - NAS info for destination airport
 */
const FlightCard = ({ flightDetails, dep_weather, dest_weather, nasDepartureResponse, nasDestinationResponse }) => {
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) return;

      const departureHeader = document.getElementById('departure-header');
      const destinationHeader = document.getElementById('destination-header');
      
      if (!departureHeader || !destinationHeader) return;

      const departureSection = document.getElementById('departure-section');
      const destinationSection = document.getElementById('destination-section');
      
      const departureRect = departureSection.getBoundingClientRect();
      const destinationRect = destinationSection.getBoundingClientRect();
      
      if (destinationRect.top <= 60) {
        departureHeader.classList.remove('sticky');
        destinationHeader.classList.add('sticky');
      } else if (departureRect.top <= 60) {
        departureHeader.classList.add('sticky');
        destinationHeader.classList.remove('sticky');
      } else {
        departureHeader.classList.remove('sticky');
        destinationHeader.classList.remove('sticky');
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        const departureHeader = document.getElementById('departure-header');
        const destinationHeader = document.getElementById('destination-header');
        if (departureHeader) departureHeader.classList.remove('sticky');
        if (destinationHeader) destinationHeader.classList.remove('sticky');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="details">
      {/* Search Input Component at the very top */}
      <div className="search-container">
        <Input userEmail="user@example.com" isLoggedIn={true} />
      </div>

      {/* Flight Overview Section */}
      <div className="flight-details-card">
        <div className="flight-number">
          <h2 className="flight-number-text">{flightDetails?.flight_number}</h2>
          <span className="aircraft-number">N37502</span>
        </div>

        {/* Flight Information Grid */}
        <div className="flight-info-container">
          {/* Departure Airport Information */}
          <div className="airport-section">
            <div className="airport-code">{flightDetails?.departure_ID}</div>
            <br />
            <div className="info-item">
              <div className="info-label">Gate</div>
              <div className="info-value">{flightDetails?.departure_gate}</div>
            </div>
            <br />
            <div className="info-item">
              <div className="info-label">Scheduled Local</div>
              <div className="time-value">{flightDetails?.scheduled_departure_time}</div>
            </div>
            <br />
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Scheduled In</div>
                <div className="info-value">{flightDetails?.scheduled_in}</div>
              </div>
            </div>
          </div>

          {/* Destination Airport Information */}
          <div className="airport-section">
            <div className="airport-code">{flightDetails?.destination_ID}</div>
            <br />
            <div className="info-item">
              <div className="info-label">Gate</div>
              <div className="info-value">{flightDetails?.arrival_gate}</div>
            </div>
            <br />
            <div className="info-item">
              <div className="info-label">Scheduled Local</div>
              <div className="time-value">{flightDetails?.scheduled_arrival_time}</div>
            </div>
            <br />
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Scheduled Out</div>
                <div className="info-value">{flightDetails?.scheduled_out}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Tabs Section */}
      <WeatherTabs 
        dep_weather={dep_weather} 
        dest_weather={dest_weather} 
        flightDetails={flightDetails} 
        nasDepartureResponse={nasDepartureResponse}
        nasDestinationResponse={nasDestinationResponse}
      />
    </div>
  );
};

export { FlightCard, WeatherCard, GateCard, WeatherTabs };