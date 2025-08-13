import React, { useEffect, useRef } from 'react';
import Input from "./Input/Index"; // Ensure this path is correct
import NASDetails from "./NASDetails";

/**
 * Component to display weather and NAS information. Includes D-ATIS, METAR, TAF and NAS Status.
 * @param {Object} props
 * @param {Object} props.weatherDetails - Weather data object
 * @param {Object} props.nasResponseAirport - NAS data for the airport
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default: true)
 */
const AirportCard = ({ weatherDetails, nasResponseAirport, showSearchBar = true }) => {
    const datis = weatherDetails?.datis;
    const metar = weatherDetails?.metar;
    const taf = weatherDetails?.taf;
    const searchContainerRef = useRef(null);

    /**
     * Parse HHMMZ format (4 digits) and calculate minutes ago
     * @param {string} timeString - Time in HHMMZ format (e.g., "1953Z")
     * @returns {number} - Minutes ago from current UTC time
     */
    const calculateMinutesAgoHHMMZ = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return null;
        
        // Remove 'Z' and validate format
        const cleanTime = timeString.replace('Z', '').trim();
        if (cleanTime.length !== 4 || !/^\d{4}$/.test(cleanTime)) return null;
        
        const hours = parseInt(cleanTime.substring(0, 2), 10);
        const minutes = parseInt(cleanTime.substring(2, 4), 10);
        
        // Validate hours and minutes
        if (hours > 23 || minutes > 59) return null;
        
        // Get current UTC time
        const now = new Date();
        const currentUTCHours = now.getUTCHours();
        const currentUTCMinutes = now.getUTCMinutes();
        
        // Convert both times to total minutes since midnight
        const currentTotalMinutes = currentUTCHours * 60 + currentUTCMinutes;
        const dataTotalMinutes = hours * 60 + minutes;
        
        let diffMinutes = currentTotalMinutes - dataTotalMinutes;
        
        // Handle day boundary crossing
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60; // Add 24 hours worth of minutes
        }
        
        // If difference is more than 12 hours, it's likely from tomorrow (very rare case)
        if (diffMinutes > 12 * 60) {
            diffMinutes = Math.abs(dataTotalMinutes - currentTotalMinutes);
        }
        
        return diffMinutes;
    };

    /**
     * Parse DDHHMMZ format (6 digits) and calculate minutes ago
     * @param {string} timeString - Time in DDHHMMZ format (e.g., "012054Z")
     * @returns {number} - Minutes ago from current UTC time
     */
    const calculateMinutesAgoDDHHMMZ = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return null;
        
        // Remove 'Z' and validate format
        const cleanTime = timeString.replace('Z', '').trim();
        if (cleanTime.length !== 6 || !/^\d{6}$/.test(cleanTime)) return null;
        
        const day = parseInt(cleanTime.substring(0, 2), 10);
        const hours = parseInt(cleanTime.substring(2, 4), 10);
        const minutes = parseInt(cleanTime.substring(4, 6), 10);
        
        // Validate day, hours and minutes
        if (day < 1 || day > 31 || hours > 23 || minutes > 59) return null;
        
        // Get current UTC time
        const now = new Date();
        const currentUTCDay = now.getUTCDate();
        const currentUTCHours = now.getUTCHours();
        const currentUTCMinutes = now.getUTCMinutes();
        const currentMonth = now.getUTCMonth();
        const currentYear = now.getUTCFullYear();
        
        // Create the data timestamp for current month
        let dataTime = new Date(Date.UTC(currentYear, currentMonth, day, hours, minutes, 0, 0));
        let currentTime = new Date(Date.UTC(currentYear, currentMonth, currentUTCDay, currentUTCHours, currentUTCMinutes, 0, 0));
        
        let diffMs = currentTime.getTime() - dataTime.getTime();
        
        // If difference is negative (data appears to be in future), try previous month
        if (diffMs < 0) {
            dataTime = new Date(Date.UTC(currentYear, currentMonth - 1, day, hours, minutes, 0, 0));
            diffMs = currentTime.getTime() - dataTime.getTime();
        }
        
        // If still negative or difference is more than 35 days, try next month
        if (diffMs < 0 || diffMs > (35 * 24 * 60 * 60 * 1000)) {
            dataTime = new Date(Date.UTC(currentYear, currentMonth + 1, day, hours, minutes, 0, 0));
            diffMs = currentTime.getTime() - dataTime.getTime();
            
            // If still negative, use absolute value (shouldn't happen in normal cases)
            if (diffMs < 0) {
                diffMs = Math.abs(diffMs);
            }
        }
        
        // Convert milliseconds to minutes
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        
        return diffMinutes;
    };

    /**
     * Format minutes as "X mins ago"
     * @param {number} minutes - Minutes difference
     * @returns {string} - Formatted string
     */
    const formatMinutesAgo = (minutes) => {
        if (minutes === null || minutes === undefined) return 'N/A';
        return `${minutes} mins ago`;
    };

    /**
     * Get color based on minutes ago and data type
     * @param {number} minutesAgo - Minutes since data was issued
     * @param {string} dataType - Data type ('datis', 'metar', or 'taf')
     * @returns {string} - Color value
     */
    const getTimestampColor = (minutesAgo, dataType) => {
        if (minutesAgo === null || minutesAgo === undefined) return '#6b7280'; // Gray for missing data
        
        // Color coding based on data type and your requirements
        if (dataType === 'datis' || dataType === 'metar') {
            if (minutesAgo < 10) {
                return '#22c55e'; // Green - fresh data
            } else if (minutesAgo > 55) {
                return '#ef4444'; // Red - stale data
            } else {
                return '#6b7280'; // Gray - moderate age (10-55 mins)
            }
        } else if (dataType === 'taf') {
            if (minutesAgo < 10) {
                return '#22c55e'; // Green - fresh data
            } else if (minutesAgo > 350) {
                return '#ef4444'; // Red - very stale data
            } else {
                return '#6b7280'; // Gray - moderate age (10-350 mins)
            }
        }
        
        return '#6b7280'; // Default gray
    };

    // Helper function to get NAS title
    // THIS IS THE FIX: This function now always returns "NAS Status".
    // TODO Ismail: Is this necessary to have this tiny function just for title? Can we pass the title text as a prop instead?
    const getNASTitle = () => {
        return "NAS Status";
    };

    // Calculate minutes ago for each data type
    const datisMinutesAgo = weatherDetails?.datis_ts ? calculateMinutesAgoHHMMZ(weatherDetails.datis_ts) : null;
    const metarMinutesAgo = weatherDetails?.metar_ts ? calculateMinutesAgoDDHHMMZ(weatherDetails.metar_ts) : null;
    const tafMinutesAgo = weatherDetails?.taf_ts ? calculateMinutesAgoDDHHMMZ(weatherDetails.taf_ts) : null;

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

            <NASDetails nasResponse={nasResponseAirport} title={getNASTitle(nasResponseAirport)} />

            <div className="weather-cards">
                {/* D-ATIS Card */}
                <div className="weather-card">
                    <div className="card-header">
                        <h2 className="header-title">D-ATIS</h2>
                        <span 
                            className="timestamp" 
                            style={{ 
                                color: getTimestampColor(datisMinutesAgo, 'datis'), 
                                fontWeight: 'normal' 
                            }}
                        >
                            {formatMinutesAgo(datisMinutesAgo)}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-content">
                            <p 
                                style={{ lineHeight: '1.87083' }}
                                dangerouslySetInnerHTML={{ __html: datis }}
                            ></p>
                        </div>
                    </div>
                </div>

                {/* METAR Card */}
                <div className="weather-card">
                    <div className="card-header">
                        <h2 className="header-title">METAR</h2>
                        <span 
                            className="timestamp" 
                            style={{ 
                                color: getTimestampColor(metarMinutesAgo, 'metar'), 
                                fontWeight: 'normal' 
                            }}
                        >
                            {formatMinutesAgo(metarMinutesAgo)}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-content">
                            <p 
                                style={{ lineHeight: '1.87083' }}
                                dangerouslySetInnerHTML={{ __html: metar }}
                            ></p>
                        </div>
                    </div>
                </div>

                {/* TAF Card */}
                <div className="weather-card">
                    <div className="card-header">
                        <h2 className="header-title">TAF</h2>
                        <span 
                            className="timestamp" 
                            style={{ 
                                color: getTimestampColor(tafMinutesAgo, 'taf'), 
                                fontWeight: 'normal' 
                            }}
                        >
                            {formatMinutesAgo(tafMinutesAgo)}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-content">
                            <p 
                                style={{ lineHeight: '1.87083' }}
                                dangerouslySetInnerHTML={{ __html: taf }}
                            ></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirportCard;