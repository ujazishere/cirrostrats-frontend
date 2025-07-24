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
                const scheduledDate = flight.Scheduled ? new Date(flight.Scheduled) : null;
                const isPast = scheduledDate ? scheduledDate < currentTime : false;
                const cardClassName = `flight-row-card ${isPast ? 'is-past' : 'is-future'}`;

                return (
                  // ADDED onClick handler and cursor style here
                  <div 
                    key={index} 
                    className={cardClassName}
                    onClick={() => handleFlightClick(flight.FlightID)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="data-column flight-id">
                      {flight.FlightID || 'N/A'}
                    </div>
                    <div className="data-column scheduled-time">
                      {formatDateTime(flight.Scheduled)}
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