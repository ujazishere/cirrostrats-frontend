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

      // Options to get the date and time in the America/New_York timezone
      const dateOptions = { month: 'short', day: 'numeric', timeZone: 'America/New_York' };
      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/New_York',
      };
      
      const formattedDate = date.toLocaleDateString('en-US', dateOptions);
      const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

      // Manually append "EST" as requested
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
      return dateB - dateA; // Sort in descending order (latest first)
    });
  };

  const sortedFlights = getSortedFlights();
  const gateNumber = sortedFlights.length > 0 ? sortedFlights[0].Gate : 'N/A';

  return (
    <div className="gate-card-wrapper">
      {showSearchBar && (
        <div className="combined-search">
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}
      
      <div className="departure-gate-container">
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
                // Determine if the flight is in the past
                const isPast = scheduledDate ? scheduledDate < currentTime : false;
                
                // Dynamically assign class based on flight status
                const cardClassName = `flight-row-card ${isPast ? 'is-past' : 'is-future'}`;

                return (
                  <div key={index} className={cardClassName}>
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