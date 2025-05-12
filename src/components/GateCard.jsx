/**
 * Component to display departure information for a specific gate
 * Shows flight status, scheduled and actual departure times
 */
import React, { useEffect, useRef } from 'react';
import Input from "../components/Input/Index"; // Ensure this path is correct

/**
 * Component to display departure information for a specific gate
 * @param {Object} props
 * @param {Object} props.gateData - Gate and flight status information
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default true)
 */
const GateCard = ({ gateData, showSearchBar = true }) => {
  // Reference for the search container
  const searchContainerRef = useRef(null);
  
  // Apply the same styling as in combined.jsx
  useEffect(() => {
    // Apply custom styling to the search container specifically for this page
    if (searchContainerRef.current) {
      // Use stronger CSS approach for the top margin
      searchContainerRef.current.style.cssText = 'margin-top: -70px !important; margin-bottom: -40px;';
      // Also adjust the parent element if needed
      const parentElement = searchContainerRef.current.parentElement;
      if (parentElement && parentElement.classList.contains('gate-card-container')) {
        parentElement.style.paddingTop = '0';
      }
    }
  }, []);

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
    <div className="gate-card-container">
      {/* Search Input Component at the top with the same styling as combined.jsx */}
      {showSearchBar && (
        <div className="combined-search" ref={searchContainerRef}>
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}
      
      <div className="gate-card">
        <table className="departure-table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Scheduled</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            {getFlightData().map((flight, index) => (
              <tr key={index} className={index % 2 === 0 ? 'dark-row' : 'light-row'}>
                <td>{flight.flightNumber}</td>
                <td>{formatDateTime(flight.scheduled)}</td>
                <td>{formatDateTime(flight.actual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GateCard;