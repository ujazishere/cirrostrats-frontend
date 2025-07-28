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

  const sortedFlights = getSortedFlights();
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
            {sortedFlights.length > 0 ? (
              sortedFlights.map((flight, index) => {
                // --- STRIKE-THROUGH LOGIC ---
                // The `is-past` class applies a strike-through if the flight has a 'departure' key.
                const hasDeparted = flight.hasOwnProperty('departure');
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
                    key={index} 
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
                      {formatDateTime(flight.Scheduled)}
                      {/* The "(Delayed)" text is kept for clarity, reinforcing the visual style change. */}
                      {isDelayed && <div className="delayed-text">(Delayed)</div>}
                    </div>
                  </div>
                );
              })
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