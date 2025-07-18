/**
 * Component to display departure information for a specific gate
 * Shows flight status, scheduled and actual departure times
 */
import React from 'react';
import Input from "../components/Input/Index"; // Ensure this path is correct

/**
 * Component to display departure information for a specific gate
 * @param {Object} props
 * @param {Object} props.gateData - Gate and flight status information
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default true)
 */
const GateCard = ({ gateData, showSearchBar = true }) => {

  const formatDateTime = (dateString) => {
    if (!dateString || dateString === 'None') return 'None';
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hours}:${minutes}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const compareDates = (dateA, dateB) => {
    if (!dateA || dateA === 'None') return 1;
    if (!dateB || dateB === 'None') return -1;
    const dateObjA = new Date(dateA);
    const dateObjB = new Date(dateB);
    const monthA = dateObjA.getMonth();
    const monthB = dateObjB.getMonth();
    if (Math.abs(monthA - monthB) > 6) {
      if (monthA > 6 && monthB < 6) {
        return 1;
      }
      if (monthB > 6 && monthA < 6) {
        return -1;
      }
    }
    return dateObjB - dateObjA;
  };

  const getFlightData = () => {
    if (!gateData) return [];
    let flightArray;
    if (gateData.flightStatus) {
      flightArray = Object.entries(gateData.flightStatus).map(([flightNumber, details]) => ({
        flightNumber,
        scheduled: details.scheduledDeparture || 'None',
        actual: details.actualDeparture || 'None'
      }));
    } else if (Array.isArray(gateData)) {
      flightArray = gateData;
    } else {
      return [];
    }
    return flightArray.sort((a, b) => compareDates(a.scheduled, b.scheduled));
  };

  return (
    // Wrap with a React Fragment <> to return multiple elements
    <>
      {/* ✅ FIXED: Search bar is now outside and above the main content container */}
      {showSearchBar && (
        <div className="combined-search">
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}
      
      <div className="departure-gate-container">
        <div className="departure-board-container">
          <div className="departure-board-header">
            <div className="departure-header-column">Flight</div>
            <div className="departure-header-column">Scheduled</div>
            <div className="departure-header-column">Actual</div>
          </div>
          
          <div className="departure-flights-wrapper">
            {getFlightData().map((flight, index) => (
              <div key={index} className="departure-flight-row">
                <div className="departure-flight-column">
                  <div className="departure-column-label">Flight</div>
                  <div className={`departure-column-data ${flight.flightNumber === 'None' ? 'departure-data-none' : ''}`}>
                    {flight.flightNumber}
                  </div>
                </div>
                <div className="departure-flight-column">
                  <div className="departure-column-label">Scheduled</div>
                  <div className="departure-column-data departure-scheduled-time">
                    {formatDateTime(flight.scheduled)}
                  </div>
                </div>
                <div className="departure-flight-column">
                  <div className="departure-column-label">Actual</div>
                  <div className={`departure-column-data departure-actual-time ${formatDateTime(flight.actual) === 'None' ? 'departure-data-none' : ''}`}>
                    {formatDateTime(flight.actual)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GateCard;