import React, { useState, useEffect } from 'react';
import Input from "../components/Input/Index"; // This path is assumed to be correct

// Defines the GateCard functional component, which displays flight information for a specific gate.
// It accepts gateData and a boolean to control the search bar's visibility as props.
const GateCard = ({ gateData, showSearchBar = true }) => {
  // State to hold the current time, updating every minute
  // This state is used to trigger re-renders, allowing the component to update time-sensitive UI elements.
  const [currentTime, setCurrentTime] = useState(new Date());

  // The useEffect hook is used to perform side effects in the component.
  useEffect(() => {
    // Update the current time every 60 seconds to re-evaluate flight status
    // This sets up a timer that calls setCurrentTime every 60,000 milliseconds (1 minute).
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    // The return function is a cleanup function that React runs when the component is unmounted.
    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []); // The empty dependency array ensures this effect runs only once when the component mounts.
  
  // --- JSS-style objects to force styles ---
  // These JavaScript objects define inline styles that are applied to JSX elements below.
  // Style for the search bar's container
  const searchContainerStyle = {
    marginBottom: '-3rem', marginTop: '-4rem',
  };

  // Style for the main content container
  const gateContainerStyle = {
    marginTop: '0'
  };
  
  // --- NEW: Style object for delayed flights ---
  // This style will be applied to the entire flight row if it's delayed.
  const delayedFlightStyle = {
    backgroundColor: '#fff3cd', // An "acceptable yellow" background.
    color: '#856404',          // A matching dark font color for readability.
  };

  // --- NEW: Style for the date group headers ---
  const dateHeaderStyle = {
    padding: '0.8rem 1rem',
    backgroundColor: 'rgba(240, 240, 240, 0.5)', // A light, semi-transparent background
    color: '#333',
    fontWeight: '600',
    fontSize: '0.9rem',
    textAlign: 'center',
    borderBottom: '1px solid #eee',
    borderTop: '1px solid #eee',
  };


  /**
   * Opens a Google search for the given flight ID in a new tab.
   * @param {string} flightId - The flight ID to search for (e.g., "UA4511").
   */
  // This event handler is triggered when a user clicks on a flight row.
  const handleFlightClick = (flightId) => {
    // A guard clause to prevent action if no flightId is provided.
    if (!flightId) return; // Do nothing if flightId is not provided
    // Constructs the Google search URL with the flight ID.
    const googleFlightsUrl = `https://www.google.com/search?q=${flightId}`;
    // Opens the URL in a new browser tab with security attributes.
    window.open(googleFlightsUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Formats a date string into "Month Day HH:MM EST" format.
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted date string.
   */
  // A utility function to format a full date-time string.
  const formatDateTime = (dateString) => {
    // Returns a default value for invalid or missing input.
    if (!dateString || dateString === 'None') return 'N/A';
    // A try-catch block provides robust error handling for date parsing.
    try {
      // Creates a Date object from the input string.
      const date = new Date(dateString);
      // isNaN(date.getTime()) is a reliable way to check if the created date is valid.
      if (isNaN(date.getTime())) return 'Invalid Date';

      // Defines options for formatting, ensuring the output is in the EST timezone.
      const dateOptions = { month: 'short', day: 'numeric', timeZone: 'America/New_York' };
      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/New_York',
      };
      
      // Formats the date and time parts separately using locale-specific methods.
      const formattedDate = date.toLocaleDateString('en-US', dateOptions);
      const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
      
      // Combines the parts into the final string.
      return `${formattedDate} ${formattedTime} EST`;
    } catch (error) {
      // Logs any unexpected errors during formatting.
      console.error("Error formatting date:", error);
      return 'Error';
    }
  };

  /**
   * --- NEW: Formats only the time part of a date string. ---
   * This is used for individual flight rows, as the date is now a group header.
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted time string (e.g., "12:30 EST").
   */
  // A specialized utility function to format only the time portion of a date string.
  const formatTimeOnly = (dateString) => {
    if (!dateString || dateString === 'None') return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Time';

        // Defines options to format only the time in 24-hour format for the EST timezone.
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/New_York',
        };
        
        // Returns the formatted time string with "EST" appended.
        return `${date.toLocaleTimeString('en-US', timeOptions)} EST`;
    } catch (error) {
        console.error("Error formatting time:", error);
        return 'Error';
    }
  };

  /**
   * Sorts flights in descending order (latest first).
   * @returns {Array<Object>} The sorted array of flight objects.
   */
  // This function sorts the flight data received from props.
  const getSortedFlights = () => {
    // Returns an empty array if the prop data is invalid or empty.
    if (!Array.isArray(gateData) || gateData.length === 0) {
      return [];
    }
    // Creates a shallow copy of the array using the spread operator (...) to avoid mutating the original prop.
    return [...gateData].sort((a, b) => {
      // Converts scheduled times to numeric timestamps for comparison, handling missing dates.
      const dateA = a.Scheduled ? new Date(a.Scheduled).getTime() : 0;
      const dateB = b.Scheduled ? new Date(b.Scheduled).getTime() : 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      // Subtracting dateA from dateB sorts the array in descending order (newest first).
      return dateB - dateA;
    });
  };

  /**
   * --- NEW: Groups sorted flights by date. ---
   * This function transforms the flat sorted array into an object
   * where keys are formatted dates (e.g., "August 5") and
   * values are arrays of flights for that day.
   * @param {Array<Object>} flights - The sorted array of flights.
   * @returns {Object} An object with flights grouped by date.
   */
  // This function restructures the flat list of flights into groups based on their scheduled date.
  const getGroupedFlights = (flights) => {
    // The .reduce() method iterates over the flights array to build up a single object (the accumulator, 'acc').
    return flights.reduce((acc, flight) => {
      // Skips any flight that doesn't have a scheduled time.
      if (!flight.Scheduled) return acc; // Skip flights without a schedule

      try {
        const scheduleDate = new Date(flight.Scheduled);
        if (isNaN(scheduleDate.getTime())) return acc; // Skip invalid dates

        // Create a date key like "August 5". This will be our group header.
        // This key is used to group all flights occurring on the same day.
        const dateKey = scheduleDate.toLocaleDateString('en-US', {
            month: 'long', 
            day: 'numeric',
            timeZone: 'America/New_York'
        });

        // If this date key is new, create an entry for it.
        // Initializes an empty array for a new date group if it hasn't been seen before.
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }

        // Add the flight to the correct date group.
        acc[dateKey].push(flight);
        // Returns the accumulator for the next iteration.
        return acc;

      } catch (error) {
        console.error("Error creating flight group:", error);
        return acc; // Skip flight if an error occurs
      }
    }, {}); // The initial value for our accumulator is an empty object.
  };

  // Calls the helper function to get the sorted list of flights.
  const sortedFlights = getSortedFlights();
  // --- NEW: Create the grouped data structure for rendering ---
  // Calls the helper function to transform the sorted list into a grouped object.
  const groupedFlights = getGroupedFlights(sortedFlights);
  // Extracts the gate number from the first flight in the list to use as a title.
  const gateNumber = sortedFlights.length > 0 ? sortedFlights[0].Gate : 'N/A';

  // The return statement contains the JSX that defines the component's UI.
  return (
    <div className="gate-card-wrapper">
      {/* Conditionally renders the search bar based on the showSearchBar prop. */}
      {showSearchBar && (
        <div className="combined-search" style={searchContainerStyle}>
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}
      
      <div className="departure-gate-container" style={gateContainerStyle}>
        <h1 className="gate-heading">Gate {gateNumber}</h1>

        <div className="departure-board">
          <div className="board-header">
            <div className="header-column">Flight</div>
            <div className="header-column">Scheduled</div>
          </div>
          
          <div className="board-body">
            {/* Checks if there are any flights to display. */}
            {Object.keys(groupedFlights).length > 0 ? (
              // --- NEW: Render Logic - Iterate over date groups first ---
              // Object.entries() converts the groupedFlights object into an array of [key, value] pairs to be mapped over.
              Object.entries(groupedFlights).map(([date, flightsOnDate]) => (
                // Use React.Fragment to group elements without adding extra nodes to the DOM
                // A React.Fragment is used here because map requires a single root element, and we don't want an unnecessary div.
                <React.Fragment key={date}>
                  {/* Renders the header for each date group (e.g., "September 15"). */}
                  <div className="date-group-header" style={dateHeaderStyle}>
                    {date}
                  </div>
                  
                  {/* --- Then, map over the flights within that date group --- */}
                  {/* This inner map renders each individual flight row for the current date group. */}
                  {flightsOnDate.map((flight, index) => {
                    // --- STRIKE-THROUGH LOGIC ---
                    // The `is-past` class applies a strike-through if the flight has a 'departure' key.
                    // Checks if the flight object has a 'Departed' property to determine if it has already left.
                    const hasDeparted = flight.hasOwnProperty('Departed');
                    // Applies CSS classes based on whether the flight has departed.
                    const cardClassName = `flight-row-card ${hasDeparted ? 'is-past' : 'is-future'}`;

                    // --- LOGIC TO CHECK FOR FLIGHT DELAY ---
                    // Initializes the delay flag to false.
                    let isDelayed = false;
                    // Checks if the necessary time fields exist to perform a delay calculation.
                    if (flight.Scheduled && flight.Estimated && typeof flight.Estimated === 'string') {
                      try {
                        // Parses the scheduled and estimated times into Date objects for comparison.
                        const scheduledDateTime = new Date(flight.Scheduled);
                        const [estHours, estMinutes] = flight.Estimated.split(':').map(Number);
                        const estimatedDateTime = new Date(scheduledDateTime.getTime());
                        estimatedDateTime.setHours(estHours, estMinutes, 0, 0);
                        // Calculates the difference in minutes.
                        const differenceInMs = estimatedDateTime.getTime() - scheduledDateTime.getTime();
                        const differenceInMinutes = differenceInMs / (1000 * 60);

                        // If the difference is greater than 5 minutes, the flight is marked as delayed.
                        if (differenceInMinutes > 5) {
                          isDelayed = true;
                        }
                      } catch (error) {
                        console.error("Error parsing flight times for delay calculation:", error);
                        isDelayed = false;
                      }
                    }

                    // Returns the JSX for a single flight row.
                    return (
                      <div 
                        key={flight.FlightID || index} // Using FlightID for a more stable key
                        className={cardClassName}
                        onClick={() => handleFlightClick(flight.FlightID)}
                        // --- NEW: CONDITIONAL STYLING ---
                        // The style object combines the default cursor with the delayed styles if isDelayed is true.
                        style={{
                          cursor: 'pointer',
                          // The spread operator (...) conditionally adds the delayedFlightStyle properties to this style object.
                          ...(isDelayed && delayedFlightStyle) // Spread operator adds styles for delayed flights
                        }}
                      >
                        <div className="data-column flight-id">
                          {flight.FlightID || 'N/A'}
                        </div>
                        <div className="data-column scheduled-time">
                          {/* --- MODIFIED: Use the new time-only formatter --- */}
                          {formatTimeOnly(flight.Scheduled)}
                          {/* The "(Delayed)" text is kept for clarity, reinforcing the visual style change. */}
                          {/* Conditionally renders text to indicate a delay and the new estimated time. */}
                          {isDelayed && <div className="delayed-text">Now @ {flight.Estimated}</div>}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))
            ) : (
              // This is the fallback UI that displays if no flight data is available.
              <div className="no-flights-card">
                <p>No departure information currently available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Exports the GateCard component to be used in other parts of the application.
export default GateCard;