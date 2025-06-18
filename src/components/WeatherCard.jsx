import React, { useEffect, useRef } from 'react';
import Input from "../components/Input/Index"; // Ensure this path is correct

/**
 * Component to display weather information including D-ATIS, METAR, and TAF
 * @param {Object} props
 * @param {Object} props.weatherDetails - Weather data object
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default: true)
 */
const WeatherCard = ({ weatherDetails, showSearchBar = true }) => {
    const datis = weatherDetails?.datis;
    const metar = weatherDetails?.metar;
    const taf = weatherDetails?.taf;
    const searchContainerRef = useRef(null);

    // Function to get color based on timestamp
    const getTimestampColor = (timestamp) => {
        if (!timestamp) return 'inherit';
        
        // Extract minutes from timestamp (e.g., "35mins ago" -> 35)
        const match = timestamp.match(/(\d+)\s*mins?\s+ago/i);
        if (!match) return 'inherit';
        
        const minutes = parseInt(match[1], 10);
        
        if (minutes < 10) {
            return '#22c55e'; // Green
        } else if (minutes > 55) {
            return '#ef4444'; // Red
        } else {
            return 'inherit'; // Default color (inherit from parent)
        }
    };

    // Apply the same styling as in combined.jsx
    useEffect(() => {
        // Only apply styling if search bar is shown
        if (showSearchBar && searchContainerRef.current) {
            // Use stronger CSS approach for the top margin
            searchContainerRef.current.style.cssText = 'margin-top: -70px !important; margin-bottom: -40px;';
            // Also adjust the parent element if needed
            const parentElement = searchContainerRef.current.parentElement;
            if (parentElement && parentElement.classList.contains('weather-container')) {
                parentElement.style.paddingTop = '0';
            }
        }
    }, [showSearchBar]);

    return (
        <div className="weather-container">
            {/* Search Input Component at the top with the same styling as combined.jsx | DO NOT DELETE THIS CODE */}
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
                        <span 
                            className="timestamp" 
                            style={{ color: getTimestampColor(weatherDetails?.datis_zt), fontWeight: 'normal' }}
                        >
                            {weatherDetails?.datis_zt}
                        </span>
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
                        <span 
                            className="timestamp" 
                            style={{ color: getTimestampColor(weatherDetails?.metar_zt), fontWeight: 'normal' }}
                        >
                            {weatherDetails?.metar_zt}
                        </span>
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
                        <span 
                            className="timestamp" 
                            style={{ color: getTimestampColor(weatherDetails?.taf_zt), fontWeight: 'normal' }}
                        >
                            {weatherDetails?.taf_zt}
                        </span>
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