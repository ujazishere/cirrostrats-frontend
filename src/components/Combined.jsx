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
import { NavLink, useLocation } from "react-router-dom";
import NASDetails from "./NASDetails";
import { useSwipeable } from 'react-swipeable'; // Import the swipeable library
import Input from "../components/Input/Index"; // Ensure this path is correct
import RoutePanel from "./RoutePanel"; // Import the new RouteTabPanel component
import SummaryTable from "./SummaryTable"; // Import the new SummaryTable component
import TabFormat from "./TabFormat"; // Import the new TabFormat component
import GateCard from "./GateCard"; // Import the GateCard component from its new file

/**
 * Main component for displaying comprehensive flight information
 * Includes departure/arrival details, weather, route, and NAS information
 * Features responsive design with sticky headers on mobile
 * 
 * @param {Object} props
 * @param {Object} props.flightData - Flight information
 * @param {Object} props.weather - Departure weather data
 * @param {Object} props.NAS - NAS data
 * @param {Object} props.EDCT - NAS data
 */
const FlightCard = ({flightData, weather, NAS, EDCT}) => {

  // Reference for the search container
  const searchContainerRef = useRef(null);
  
  // Use location to detect URL changes which indicate new searches
  const location = useLocation();
  
  // State to track current search parameters to clear results on new searches
  const [currentSearch, setCurrentSearch] = useState('');
  
  // Add a new effect that monitors for search input changes
  useEffect(() => {
    // Get the search input element
    const searchInput = document.querySelector('.search-container input[type="text"]');
    if (!searchInput) return;
    
    // Create a function to handle search form submissions
    const handleSearchFormSubmit = (e) => {
      if (e.target.closest('form')) {
        // Clear any existing search results from the DOM
        const existingResults = document.querySelectorAll('.search-result-item');
        existingResults.forEach(result => result.remove());
        
        // Update our current search state
        const searchInputValue = searchInput.value;
        setCurrentSearch(searchInputValue);
      }
    };
    
    // Add event listener to capture form submissions
    document.addEventListener('submit', handleSearchFormSubmit);
    
    return () => {
      document.removeEventListener('submit', handleSearchFormSubmit);
    };
  }, []);
  
  // Monitor location changes which indicate search navigation
  useEffect(() => {
    // When URL changes, it might indicate a new search was done
    // This will help ensure results are cleared
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q') || '';
    
    if (searchQuery && searchQuery !== currentSearch) {
      // If there's a new query parameter, clear existing results
      const existingResults = document.querySelectorAll('.search-result-item');
      existingResults.forEach(result => result.remove());
      
      // Update current search
      setCurrentSearch(searchQuery);
    }
  }, [location, currentSearch]);

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
    
    // Apply custom styling to the search container specifically for this page
    if (searchContainerRef.current) {
      // Use stronger CSS approach for the top margin
      searchContainerRef.current.style.cssText = 'margin-top: -70px !important; margin-bottom: -40px;';
      // Also adjust the parent element if needed
      const parentElement = searchContainerRef.current.parentElement;
      if (parentElement && parentElement.classList.contains('details')) {
        parentElement.style.paddingTop = '0';
      }
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <div className="details">
      {/* Search Input Component at the very top */}
      <div className="combined-search" ref={searchContainerRef}>
        <Input userEmail="user@example.com" 
          isLoggedIn={true} />
      </div>
      {/* Flight Overview Section */}
      <div>
        {/* Using the new SummaryTable component */}
        <SummaryTable flightData={flightData} EDCT = {EDCT} />
      </div>
      {/* TODO ismail: This is where Route and clearance belongs. Move it from tab to here. */}
      {/* Using the new TabFormat component instead of WeatherTabs */}
      <TabFormat 
        flightData={flightData} 
        weather={weather}
        NAS={NAS}
        hideChildSearchBars={true} // Pass this prop to prevent search bar in child components
      />
    </div>
  );
};

export { FlightCard, GateCard, RoutePanel };