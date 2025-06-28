import React, { useEffect, useRef } from 'react';
import Input from "./Input/Index"; // Ensure this path is correct

/**
 * Component to display weather information including D-ATIS, METAR, and TAF
 * @param {Object} props
 * @param {boolean} props.arrow - Display arrow indicator
 * @param {string} props.title - Card title
 * @param {Object} props.weatherDetails - Weather data object
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default true)
 */
const AirportCard = ({ arrow, title, weatherDetails, showSearchBar = true }) => {
  const datis = weatherDetails?.datis;
  const metar = weatherDetails?.metar;
  const taf = weatherDetails?.taf;

  // Reference for the search container
  const searchContainerRef = useRef(null);

  // Apply the same styling as in combined.jsx
  useEffect(() => {
    // Apply custom styling to the search container specifically for this page
    if (searchContainerRef.current) {
      // Use stronger CSS approach for the top margin
      searchContainerRef.current.style.cssText = 'margin-top: -70px !important; margin-bottom: -40px;';
      // Also adjust the parent element if needed
      const parentElement = searchContainerRef.current.parentElement;
      if (parentElement && parentElement.classList.contains('weather-container')) {
        parentElement.style.paddingTop = '0';
      }
    }
  }, []);

  return (
    <div className="weather-container">
      {/* Search Input Component moved to the top with the same styling as combined.jsx */}
      {showSearchBar && (
        <div className="combined-search" ref={searchContainerRef}>
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}

      <div className="weather-cards">
        {/* D-ATIS Card */}
        <div className="weather-card">
          <div className="card-header">
            <h2 className="header-title">D-ATIS</h2>
            <span className="timestamp">3sssss ago</span>
          </div>
          <div className="card-body">
            <div className="data-content">
              <p dangerouslySetInnerHTML={{ __html: datis }}></p>
            </div>
          </div>
        </div>

        {/* METAR Card */}
        <div className="weather-card">
          <div className="card-header">
            <h2 className="header-title">METAR</h2>
            <span className="timestamp">34 mins ago</span>
          </div>
          <div className="card-body">
            <div className="data-content">
              <p dangerouslySetInnerHTML={{ __html: metar }}></p>
            </div>
          </div>
        </div>

        {/* TAF Card */}
        <div className="weather-card">
          <div className="card-header">
            <h2 className="header-title">TAF</h2>
            <span className="timestamp">166 mins ago</span>
          </div>
          <div className="card-body">
            <div className="data-content">
              <p dangerouslySetInnerHTML={{ __html: taf }}></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirportCard;