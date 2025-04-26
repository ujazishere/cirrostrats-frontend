import React from 'react';
import { highlightWeatherText } from "../components/utility/highlightWeatherText";
import Input from "../components/Input/Index"; // Ensure this path is correct

/**
 * Component to display weather information including D-ATIS, METAR, and TAF
 * @param {Object} props
 * @param {boolean} props.arrow - Display arrow indicator
 * @param {string} props.title - Card title
 * @param {Object} props.weatherDetails - Weather data object
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default true)
 */
const WeatherCard = ({ arrow, title, weatherDetails, showSearchBar = true }) => {
  const datis = weatherDetails?.datis;
  const metar = weatherDetails?.metar;
  const taf = weatherDetails?.taf;
  
  return (
    <div className="weather-container">
      <div className="weather-cards">
        {/* D-ATIS Card */}
        <div className="weather-card">
          <div className="card-header">
            <h2 className="header-title">D-ATIS</h2>
            <span className="timestamp">34 mins ago</span>
          </div>
          <div className="card-body">
            <div className="data-content">
              <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(datis) }}></p>
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
              <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(metar) }}></p>
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
              <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(taf) }}></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Input Component moved to the bottom */}
      {showSearchBar && (
        <div className="search-container search-container-bottom">
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}
    </div>
  );
};

export default WeatherCard;