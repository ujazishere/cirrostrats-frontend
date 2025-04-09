/**
 * Component to display departure information for a specific gate
 * Shows flight status, scheduled and actual departure times
 */

import React from 'react';

/**
 * Component to display departure information for a specific gate
 * @param {Object} props
 * @param {Object} props.gateData - Gate and flight status information
 */
const GateCard = ({ gateData }) => {
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
  );
};

export default GateCard;