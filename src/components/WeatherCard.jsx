import React, { useEffect, useRef } from 'react';
import Input from "../components/Input/Index"; // Ensure this path is correct

/**
 * Component to display weather information including D-ATIS, METAR, and TAF
 * @param {Object} props
 * @param {Object} props.weatherDetails - Weather data object
 */
const WeatherCard = ({ weatherDetails}) => {
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
            <span className="timestamp">{weatherDetails?.datis_zt}</span>
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
            <span className="timestamp">{weatherDetails?.metar_zt}</span>
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
            <span className="timestamp">{weatherDetails?.taf_zt}</span>
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

export default WeatherCard;