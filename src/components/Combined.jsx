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
 */

import React, { useEffect } from 'react';
import { NavLink } from "react-router-dom";
import NASDetails from "./NASDetails";

/**
 * Highlights specific weather-related patterns in text with different colors
 * - Pink: Visibility values (e.g., "1/2SM")
 * - Red: Low ceiling (BKN/OVC004 or lower)
 * - Yellow: Medium ceiling (BKN/OVC005-009)
 * - Box: Altimeter settings (e.g., "A2992")
 */
const highlightWeatherText = (text) => {
  if (!text) return "";
  const pinkPattern = /((M)?\d\/(\d)?\dSM)/g;  // Matches visibility values
  const redPattern = /(BKN|OVC)(00[0-4])/g;    // Matches low ceilings
  const yellowPattern = /(BKN|OVC)(00[5-9])/g;  // Matches medium ceilings
  const altimeterPattern = /(A\d{4})/g;         // Matches altimeter settings
  
  return text
    .replace(pinkPattern, '<span class="pink_text_color">$1</span>')
    .replace(redPattern, '<span class="red_text_color">$1$2</span>')
    .replace(yellowPattern, '<span class="yellow_highlight">$1$2</span>')
    .replace(altimeterPattern, '<span class="box_around_text">$1</span>');
};

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
  // Handle case when gateData is an object with flightStatus property
  const getFlightData = () => {
    if (!gateData) return [];
    
    if (gateData.flightStatus) {
      // Convert object to array format
      return Object.entries(gateData.flightStatus).map(([flightNumber, details]) => ({
        flightNumber,
        scheduled: details.scheduledDeparture || 'None',
        actual: details.actualDeparture || 'None'
      }));
    }
    
    // If gateData is already an array, return it
    if (Array.isArray(gateData)) {
      return gateData;
    }
    
    return [];
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
              <td>{flight.scheduled}</td>
              <td>{flight.actual}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
  // Handle mobile scroll behavior for sticky headers
  useEffect(() => {
    const handleScroll = () => {
      // Only apply sticky behavior on mobile devices
      if (window.innerWidth > 768) return;

      const departureHeader = document.getElementById('departure-header');
      const destinationHeader = document.getElementById('destination-header');
      
      if (!departureHeader || !destinationHeader) return;

      const departureSection = document.getElementById('departure-section');
      const destinationSection = document.getElementById('destination-section');
      
      const departureRect = departureSection.getBoundingClientRect();
      const destinationRect = destinationSection.getBoundingClientRect();
      
      // Toggle sticky classes based on scroll position
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

    // Handle window resize and orientation changes
    const handleResize = () => {
      if (window.innerWidth > 768) {
        const departureHeader = document.getElementById('departure-header');
        const destinationHeader = document.getElementById('destination-header');
        if (departureHeader) departureHeader.classList.remove('sticky');
        if (destinationHeader) destinationHeader.classList.remove('sticky');
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="details">
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

          {/* Flight Path Visualization */}
          <div className="flight-path">
            <div className="airplane-icon"></div>
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

      {/* Departure Weather Section */}
      <div id="departure-section" className="table-container">
        <div id="departure-header" className="section-header">
          <div className="card__depature__subtitle card__header--dark">
            <div className="rounded-header-container">
              <h3 className="card__depature__subtitle__title_head">
                Departure - {flightDetails?.departure_ID}
              </h3>
            </div>
          </div>
        </div>
        <table className="flight_card">
          <tbody>
            {dep_weather ? (
              <WeatherCard arrow={false} title="Departure Weather" weatherDetails={dep_weather} />
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Route Information Section */}
      {flightDetails?.route && flightDetails?.sv && (
        <table className="route">
          <tbody>
            <tr>
              <th>ROUTE<a href={flightDetails.sv} target="_blank" rel="noopener noreferrer">Show on - SkyVector Map</a></th>
            </tr>
            <tr>
              <td>{flightDetails.route}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* NAS Information Sections */}
      <NASDetails nasResponse={nasDepartureResponse} title="Airport Closure - Departure" />

      {/* Destination Weather Section */}
      <div id="destination-section" className="table-container">
        <div id="destination-header" className="section-header">
          <div className="card__destination__subtitle card__header--dark">
            <h3 className="card__destination__subtitle__title_head">
              Destination - {flightDetails?.destination_ID}
            </h3>
          </div>
        </div>
        <table className="flight_card">
          <tbody>
            {dest_weather ? (
              <WeatherCard arrow={false} title="Destination Weather" weatherDetails={dest_weather} />
            ) : null}
          </tbody>
        </table>
      </div>

      <NASDetails nasResponse={nasDestinationResponse} title="Airport Closure - Destination" />
    </div>
  );
};

export { FlightCard, WeatherCard, GateCard };