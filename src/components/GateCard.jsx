import React, { useState, useEffect } from 'react';
import Input from "../components/Input/Index"; // This path is assumed to be correct

const GateCard = ({ gateData, showSearchBar = true }) => {
  // State to hold the current time, updating every minute
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update the current time every 60 seconds to re-evaluate flight status
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []);
  
  // --- JSS-style objects to force styles ---
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
  const handleFlightClick = (flightId) => {
    if (!flightId) return; // Do nothing if flightId is not provided
    const googleFlightsUrl = `https://www.google.com/search?q=${flightId}`;
    window.open(googleFlightsUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Formats a date string into "Month Day HH:MM EST" format.
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted date string.
   */
  const formatDateTime = (dateString) => {
    if (!dateString || dateString === 'None') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      const dateOptions = { month: 'short', day: 'numeric', timeZone: 'America/New_York' };
      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/New_York',
      };
      
      const formattedDate = date.toLocaleDateString('en-US', dateOptions);
      const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
      
      return `${formattedDate} ${formattedTime} EST`;
    } catch (error) {
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
  const formatTimeOnly = (dateString) => {
    if (!dateString || dateString === 'None') return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Time';

        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/New_York',
        };
        
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
  const getSortedFlights = () => {
    if (!Array.isArray(gateData) || gateData.length === 0) {
      return [];
    }
    return [...gateData].sort((a, b) => {
      const dateA = a.Scheduled ? new Date(a.Scheduled).getTime() : 0;
      const dateB = b.Scheduled ? new Date(b.Scheduled).getTime() : 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
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
  const getGroupedFlights = (flights) => {
    return flights.reduce((acc, flight) => {
      if (!flight.Scheduled) return acc; // Skip flights without a schedule

      try {
        const scheduleDate = new Date(flight.Scheduled);
        if (isNaN(scheduleDate.getTime())) return acc; // Skip invalid dates

        // Create a date key like "August 5". This will be our group header.
        const dateKey = scheduleDate.toLocaleDateString('en-US', {
            month: 'long', 
            day: 'numeric',
            timeZone: 'America/New_York'
        });

        // If this date key is new, create an entry for it.
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }

        // Add the flight to the correct date group.
        acc[dateKey].push(flight);
        return acc;

      } catch (error) {
        console.error("Error creating flight group:", error);
        return acc; // Skip flight if an error occurs
      }
    }, {}); // The initial value for our accumulator is an empty object.
  };

  const sortedFlights = getSortedFlights();
  // --- NEW: Create the grouped data structure for rendering ---
  const groupedFlights = getGroupedFlights(sortedFlights);
  const gateNumber = sortedFlights.length > 0 ? sortedFlights[0].Gate : 'N/A';

  return (
    <div className="gate-card-wrapper">
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
            {Object.keys(groupedFlights).length > 0 ? (
              // --- NEW: Render Logic - Iterate over date groups first ---
              Object.entries(groupedFlights).map(([date, flightsOnDate]) => (
                // Use React.Fragment to group elements without adding extra nodes to the DOM
                <React.Fragment key={date}>
                  <div className="date-group-header" style={dateHeaderStyle}>
                    {date}
                  </div>
                  
                  {/* --- Then, map over the flights within that date group --- */}
                  {flightsOnDate.map((flight, index) => {
                    // --- STRIKE-THROUGH LOGIC ---
                    // The `is-past` class applies a strike-through if the flight has a 'departure' key.
                    const hasDeparted = flight.hasOwnProperty('Departed');
                    const cardClassName = `flight-row-card ${hasDeparted ? 'is-past' : 'is-future'}`;

                    // --- LOGIC TO CHECK FOR FLIGHT DELAY ---
                    let isDelayed = false;
                    if (flight.Scheduled && flight.Estimated && typeof flight.Estimated === 'string') {
                      try {
                        const scheduledDateTime = new Date(flight.Scheduled);
                        const [estHours, estMinutes] = flight.Estimated.split(':').map(Number);
                        const estimatedDateTime = new Date(scheduledDateTime.getTime());
                        estimatedDateTime.setHours(estHours, estMinutes, 0, 0);
                        const differenceInMs = estimatedDateTime.getTime() - scheduledDateTime.getTime();
                        const differenceInMinutes = differenceInMs / (1000 * 60);

                        if (differenceInMinutes > 5) {
                          isDelayed = true;
                        }
                      } catch (error) {
                        console.error("Error parsing flight times for delay calculation:", error);
                        isDelayed = false;
                      }
                    }

                    return (
                      <div 
                        key={flight.FlightID || index} // Using FlightID for a more stable key
                        className={cardClassName}
                        onClick={() => handleFlightClick(flight.FlightID)}
                        // --- NEW: CONDITIONAL STYLING ---
                        // The style object combines the default cursor with the delayed styles if isDelayed is true.
                        style={{
                          cursor: 'pointer',
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
                          {isDelayed && <div className="delayed-text">Now @ {flight.Estimated}</div>}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))
            ) : (
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

export default GateCard;