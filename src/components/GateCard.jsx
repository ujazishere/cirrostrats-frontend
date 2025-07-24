import React from 'react';
import Input from "../components/Input/Index"; // This path is assumed to be correct

/**
 * GateCard Component - A premium, card-based display for gate departure information.
 * Designed by a UI/UX expert for an elegant and responsive user experience.
 * @param {Object} props
 * @param {Array<Object>} props.gateData - Flight data for the gate.
 * @param {boolean} props.showSearchBar - Toggles the visibility of the search bar.
 */
const GateCard = ({ gateData, showSearchBar = true }) => {

  const formatDateTime = (dateString) => {
    if (!dateString || dateString === 'None') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Error';
    }
  };

  const getSortedFlights = () => {
    if (!Array.isArray(gateData) || gateData.length === 0) {
      return [];
    }
    // Sort flights chronologically (oldest first)
    return [...gateData].sort((a, b) => {
      const dateA = a.Scheduled ? new Date(a.Scheduled).getTime() : 0;
      const dateB = b.Scheduled ? new Date(b.Scheduled).getTime() : 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
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
          {/* Board Header Card */}
          <div className="board-header">
            <div className="header-column">Flight</div>
            <div className="header-column">Scheduled</div>
          </div>
          
          {/* List of Flight Data Cards */}
          <div className="board-body">
            {sortedFlights.length > 0 ? (
              sortedFlights.map((flight, index) => (
                <div key={index} className="flight-row-card">
                  <div className="data-column flight-id">
                    {flight.FlightID || 'N/A'}
                  </div>
                  <div className="data-column scheduled-time">
                    {formatDateTime(flight.Scheduled)}
                  </div>
                </div>
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