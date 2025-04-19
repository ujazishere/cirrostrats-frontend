/**
 * This file contains React components for displaying flight and weather information:
 * - FlightCard: Main component displaying comprehensive flight details including departure/arrival info
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
import RoutePanel from "./RoutePanel"; // Import the new RouteTabPanel component
import SummaryTable from "./SummaryTable"; // Import the new SummaryTable component
import TabFormat from "./TabFormat"; // Import the new TabFormat component
import GateCard from "./GateCard"; // Import the GateCard component from its new file
import WeatherCard from "./WeatherCard"; // Import the WeatherCard component from its own file

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

  // Override the styles directly targeting what we know about the search-container
  const searchContainerStyle = {
    padding: '0.1rem 0 !important',
  };

  return (
    <div className="details">
      {/* Search Input Component at the very top */}
      <div className="search-container" style={searchContainerStyle}>
        <Input userEmail="user@example.com" isLoggedIn={true} />
      </div>

      {/* Flight Overview Section */}
      <div className="flight-details-card">
        <div className="flight-number">
          <h2 className="flight-number-text">{flightDetails?.flight_number}</h2>
          <span className="aircraft-number">N37502</span>
        </div>

        {/* Using the new SummaryTable component */}
        <SummaryTable flightDetails={flightDetails} />
      </div>

      {/* Using the new TabFormat component instead of WeatherTabs */}
      <TabFormat 
        dep_weather={dep_weather} 
        dest_weather={dest_weather} 
        flightDetails={flightDetails} 
        nasDepartureResponse={nasDepartureResponse}
        nasDestinationResponse={nasDestinationResponse}
      />
    </div>
  );
};

export { FlightCard, WeatherCard, GateCard, NASDetails, RoutePanel };