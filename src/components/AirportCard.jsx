// Imports the React library and specific hooks like useEffect and useRef.
import React, { useEffect, useRef } from 'react';
// Imports child components used within this component.
import Input from "./Input/Index"; // Ensure this path is correct
import NASDetails from "./NASDetails";

/**
 * Component to display weather and NAS information. Includes D-ATIS, METAR, TAF and NAS Status.
 * @param {Object} props
 * @param {Object} props.weatherDetails - Weather data object
 * @param {Object} props.nasResponseAirport - NAS data for the airport
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default: true)
 */
// Defines the AirportCard functional component, destructuring props and setting a default value for showSearchBar.
const AirportCard = ({ weatherDetails, nasResponseAirport, showSearchBar = true }) => {
    // Safely extracts specific weather data from the weatherDetails prop using optional chaining to prevent errors if the prop is null or undefined.
    const datis = weatherDetails?.datis;
    const metar = weatherDetails?.metar;
    const taf = weatherDetails?.taf;
    // Creates a ref that will be attached to the search container div to allow direct DOM manipulation.
    const searchContainerRef = useRef(null);

    /**
     * Parse HHMMZ format (4 digits) and calculate minutes ago
     * @param {string} timeString - Time in HHMMZ format (e.g., "1953Z")
     * @returns {number} - Minutes ago from current UTC time
     */
    // This helper function calculates the time difference from a 4-digit UTC time string.
    const calculateMinutesAgoHHMMZ = (timeString) => {
        // A guard clause to exit early if the input is invalid.
        if (!timeString || typeof timeString !== 'string') return null;
        
        // Remove 'Z' and validate format
        // Cleans and validates the time string to ensure it's a 4-digit number.
        const cleanTime = timeString.replace('Z', '').trim();
        if (cleanTime.length !== 4 || !/^\d{4}$/.test(cleanTime)) return null;
        
        // Parses the hours and minutes from the string into integer values.
        const hours = parseInt(cleanTime.substring(0, 2), 10);
        const minutes = parseInt(cleanTime.substring(2, 4), 10);
        
        // Validate hours and minutes
        // Ensures the parsed time components are within a valid range.
        if (hours > 23 || minutes > 59) return null;
        
        // Get current UTC time
        // Creates a new Date object to get the current time.
        const now = new Date();
        // Extracts the current time components specifically in UTC.
        const currentUTCHours = now.getUTCHours();
        const currentUTCMinutes = now.getUTCMinutes();
        
        // Convert both times to total minutes since midnight
        // This conversion simplifies the difference calculation, especially across day boundaries.
        const currentTotalMinutes = currentUTCHours * 60 + currentUTCMinutes;
        const dataTotalMinutes = hours * 60 + minutes;
        
        // Calculates the initial difference in minutes.
        let diffMinutes = currentTotalMinutes - dataTotalMinutes;
        
        // Handle day boundary crossing
        // If the difference is negative, it means the data time is from the previous UTC day.
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60; // Add 24 hours worth of minutes
        }
        
        // If difference is more than 12 hours, it's likely from tomorrow (very rare case)
        // This handles a rare edge case.
        if (diffMinutes > 12 * 60) {
            diffMinutes = Math.abs(dataTotalMinutes - currentTotalMinutes);
        }
        
        // Returns the final calculated difference in minutes.
        return diffMinutes;
    };

    /**
     * Parse DDHHMMZ format (6 digits) and calculate minutes ago
     * @param {string} timeString - Time in DDHHMMZ format (e.g., "012054Z")
     * @returns {number} - Minutes ago from current UTC time
     */
    // This helper function calculates the time difference from a 6-digit UTC timestamp string.
    const calculateMinutesAgoDDHHMMZ = (timeString) => {
        // Guard clause for invalid input.
        if (!timeString || typeof timeString !== 'string') return null;
        
        // Remove 'Z' and validate format
        // Cleans and validates the time string to ensure it's a 6-digit number.
        const cleanTime = timeString.replace('Z', '').trim();
        if (cleanTime.length !== 6 || !/^\d{6}$/.test(cleanTime)) return null;
        
        // Parses the day, hours, and minutes from the string.
        const day = parseInt(cleanTime.substring(0, 2), 10);
        const hours = parseInt(cleanTime.substring(2, 4), 10);
        const minutes = parseInt(cleanTime.substring(4, 6), 10);
        
        // Validate day, hours and minutes
        // Validates that the parsed date and time components are logical.
        if (day < 1 || day > 31 || hours > 23 || minutes > 59) return null;
        
        // Get current UTC time
        // Gets all necessary components of the current date and time in UTC.
        const now = new Date();
        const currentUTCDay = now.getUTCDate();
        const currentUTCHours = now.getUTCHours();
        const currentUTCMinutes = now.getUTCMinutes();
        const currentMonth = now.getUTCMonth();
        const currentYear = now.getUTCFullYear();
        
        // Create the data timestamp for current month
        // Constructs Date objects for both the data's time and the current time, explicitly in UTC.
        let dataTime = new Date(Date.UTC(currentYear, currentMonth, day, hours, minutes, 0, 0));
        let currentTime = new Date(Date.UTC(currentYear, currentMonth, currentUTCDay, currentUTCHours, currentUTCMinutes, 0, 0));
        
        // Calculates the initial difference in milliseconds.
        let diffMs = currentTime.getTime() - dataTime.getTime();
        
        // If difference is negative (data appears to be in future), try previous month
        // This handles the month boundary crossing, e.g., if it's the 1st of the month and the data is from the 31st.
        if (diffMs < 0) {
            dataTime = new Date(Date.UTC(currentYear, currentMonth - 1, day, hours, minutes, 0, 0));
            diffMs = currentTime.getTime() - dataTime.getTime();
        }
        
        // If still negative or difference is more than 35 days, try next month
        // This is another edge case handler.
        if (diffMs < 0 || diffMs > (35 * 24 * 60 * 60 * 1000)) {
            dataTime = new Date(Date.UTC(currentYear, currentMonth + 1, day, hours, minutes, 0, 0));
            diffMs = currentTime.getTime() - dataTime.getTime();
            
            // If still negative, use absolute value (shouldn't happen in normal cases)
            if (diffMs < 0) {
                diffMs = Math.abs(diffMs);
            }
        }
        
        // Convert milliseconds to minutes
        // Converts the final millisecond difference into minutes.
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        
        // Returns the final calculated difference.
        return diffMinutes;
    };

    /**
     * Format minutes as "X mins ago"
     * @param {number} minutes - Minutes difference
     * @returns {string} - Formatted string
     */
    // A simple utility function to format the calculated minutes into a display string.
    const formatMinutesAgo = (minutes) => {
        // Returns a default string if the input is null or undefined.
        if (minutes === null || minutes === undefined) return 'N/A';
        // Returns the formatted string.
        return `${minutes} mins ago`;
    };

    /**
     * Get color based on minutes ago and data type
     * @param {number} minutesAgo - Minutes since data was issued
     * @param {string} dataType - Data type ('datis', 'metar', or 'taf')
     * @returns {string} - Color value
     */
    // This function determines the color for the timestamp based on how old the data is.
    const getTimestampColor = (minutesAgo, dataType) => {
        // Returns a default gray color if the data is missing.
        if (minutesAgo === null || minutesAgo === undefined) return '#6b7280'; // Gray for missing data
        
        // Color coding based on data type and your requirements
        // Applies different thresholds for 'fresh' vs 'stale' data depending on the data type.
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
        
        // Returns a default gray color if no other condition is met.
        return '#6b7280'; // Default gray
    };

    // Helper function to get NAS title
    // THIS IS THE FIX: This function now always returns "NAS Status".
    // TODO Ismail: Is this necessary to have this tiny function just for title? Can we pass the title text as a prop instead? / UPDATE: YES THIS IS NECESSARY I TRIED TITH THE PROP AND IT DID NOT WORK 
    const getNASTitle = () => {
        return "NAS Status";
    };

    // Calculate minutes ago for each data type
    // These lines call the helper functions to calculate the age of each piece of weather data.
    // The ternary operator ensures the function is only called if a timestamp exists.
    const datisMinutesAgo = weatherDetails?.datis_ts ? calculateMinutesAgoHHMMZ(weatherDetails.datis_ts) : null;
    const metarMinutesAgo = weatherDetails?.metar_ts ? calculateMinutesAgoDDHHMMZ(weatherDetails.metar_ts) : null;
    const tafMinutesAgo = weatherDetails?.taf_ts ? calculateMinutesAgoDDHHMMZ(weatherDetails.taf_ts) : null;

    // Apply the same styling as in combined.jsx
    // The useEffect hook is used to perform side effects, in this case, manipulating the DOM for styling purposes after the component renders.
    useEffect(() => {
        // Only apply styling if search bar is shown
        // This effect only runs if the search bar is meant to be visible.
        if (showSearchBar && searchContainerRef.current) {
            // Use stronger CSS approach for the top margin
            // Applies specific inline styles to the search container element to adjust its position.
            searchContainerRef.current.style.cssText = 'margin-top: -70px !important; margin-bottom: -40px;';
            // Also adjust the parent element if needed
            const parentElement = searchContainerRef.current.parentElement;
            if (parentElement && parentElement.classList.contains('weather-container')) {
                parentElement.style.paddingTop = '0';
            }
        }
    }, [showSearchBar]); // The dependency array ensures this effect only re-runs if the showSearchBar prop changes.

    // The return statement contains the JSX that defines the component's UI.
    return (
        // This is the main container for the AirportCard component.
        <div className="weather-container">
            {/* Search Input Component at the top with the same styling as combined.jsx | DO NOT DELETE THIS CODE */}
            {/* This block conditionally renders the search bar using a short-circuit operator (&&). */}
            {showSearchBar && (
                // Attaches the ref to this div so its style can be manipulated in the useEffect hook.
                <div className="combined-search" ref={searchContainerRef}>
                    <Input userEmail="user@example.com" isLoggedIn={true} />
                </div>
            )}

            {/* Renders the NASDetails child component, passing the NAS data and a title as props. */}
            <NASDetails nasResponse={nasResponseAirport} title={getNASTitle(nasResponseAirport)} />

            {/* This container holds the individual cards for D-ATIS, METAR, and TAF. */}
            <div className="weather-cards">
                {/* D-ATIS Card */}
                <div className="weather-card">
                    <div className="card-header">
                        <h2 className="header-title">D-ATIS</h2>
                        {/* The timestamp's color is set dynamically based on its age. */}
                        <span 
                            className="timestamp" 
                            style={{ 
                                color: getTimestampColor(datisMinutesAgo, 'datis'), 
                                fontWeight: 'normal' 
                            }}
                        >
                            {/* The text content of the timestamp is also formatted dynamically. */}
                            {formatMinutesAgo(datisMinutesAgo)}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-content">
                            {/* dangerouslySetInnerHTML is used to render raw HTML content from the datis prop. */}
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
                            {/* Renders the raw HTML from the metar prop. */}
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
                            {/* Renders the raw HTML from the taf prop. */}
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

// Exports the component so it can be used in other parts of the application.
export default AirportCard;