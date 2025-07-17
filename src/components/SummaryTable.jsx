/**
 * SummaryTable.js
 *
 * SummaryTable component displays flight information in a grid layout.
 * Shows departure and destination airport details including:
 * - Airport codes
 * - Gate information
 * - Scheduled times
 * - Scheduled in/out times
 *
 * Also includes a section for EDCT (Expect Departure Clearance Time) details.
 */
import React, { useState, useEffect } from 'react';

/**
 * Displays comprehensive flight information and EDCT details.
 * @param {Object} props
 * @param {Object} props.flightData - Flight information with departure and destination details.
 * @param {Array<Object>} props.EDCT - Array of EDCT information objects.
 */
const SummaryTable = ({ flightData, EDCT }) => {
  console.log('dlightD',flightData)
  // Helper function to check if a value exists and is not empty
  const hasValue = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '' && value !== 'N/A';
  };

  // Function to calculate countdown from EDCT time to current UTC time
  const getCountdown = (edctTime) => {
    if (!hasValue(edctTime)) return '—';
    
    try {
      // Parse the EDCT time (format: MM/DD/YYYY HH:MM)
      const [datePart, timePart] = edctTime.split(' ');
      const [month, day, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      
      // Create date object in UTC
      const edctDate = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      ));
      
      const now = new Date();
      const timeDiff = edctDate.getTime() - now.getTime();
      
      // Calculate time components (use absolute value for calculations)
      const totalMinutes = Math.floor(Math.abs(timeDiff) / (1000 * 60));
      const days = Math.floor(totalMinutes / (24 * 60));
      const hrs = Math.floor((totalMinutes % (24 * 60)) / 60);
      const mins = totalMinutes % 60;
      
      // Format the countdown with negative sign if expired
      const isExpired = timeDiff <= 0;
      const prefix = isExpired ? '-' : '';
      
      if (days > 0) {
        return `${prefix}${days}d ${hrs}h ${mins}m`;
      } else if (hrs > 0) {
        return `${prefix}${hrs}h ${mins}m`;
      } else {
        return `${prefix}${mins}m`;
      }
    } catch (error) {
      return edctTime; // Return original value if parsing fails
    }
  };
  
  // Component to render a single EDCT row with its own countdown logic
  const EDCTRow = ({ edctItem }) => {
    const [countdown, setCountdown] = useState(() => getCountdown(edctItem.edct));
    
    // Update countdown every minute
    useEffect(() => {
      const updateCountdown = () => {
        setCountdown(getCountdown(edctItem.edct));
      };
      
      const intervalId = setInterval(updateCountdown, 60000);
      
      return () => clearInterval(intervalId);
    }, [edctItem.edct]);

    return (
      <div className="edct-row">
        <div className="edct-cell" data-label="Filed Departure Time">
          {hasValue(edctItem.filedDepartureTime) ? edctItem.filedDepartureTime : '—'}Z
        </div>
        <div className="edct-cell" data-label="EDCT">
          {edctItem.edct}Z
        </div>
        <div className="edct-cell" data-label="T-minus">
          {countdown}
        </div>
        <div className="edct-cell" data-label="Control Element">
          {hasValue(edctItem.controlElement) ? edctItem.controlElement : '—'}
        </div>
        <div className="edct-cell" data-label="Flight Cancelled">
          {hasValue(edctItem.flightCancelled) ? edctItem.flightCancelled.toString() : '—'}
        </div>
      </div>
    );
  };


  // Component to render the entire EDCT table
  const EDCTSection = ({ edctData }) => {
    // Hide section if there is no data
    if (!edctData || !Array.isArray(edctData) || edctData.length === 0) {
      return null;
    }
    
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="edct-section">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer' }}
          className="edct-collapsible-header"
        >
          {/* ✅ UPDATED: Added style to change title color */}
          <h3 className="edct-title" style={{ color: '#d0925e' }}>
            EDCT
            {/* ✅ UPDATED: Changed arrow color */}
            <span style={{ marginLeft: '8px', fontSize: '0.9em', color: '#d0925e' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          </h3>
        </div>

        {isExpanded && (
          <div className="edct-table">
            {/* EDCT Table Header */}
            <div className="edct-row edct-header">
              <div className="edct-cell">Filed Departure Time</div>
              <div className="edct-cell">EDCT</div>
              <div className="edct-cell">Control Element</div>
              <div className="edct-cell">Flight Cancelled</div>
            </div>

            {/* Mapped data rows */}
            {edctData.map((item, index) => (
              <EDCTRow key={index} edctItem={item} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flight-info-container">
        {/* Top Header Section: Flight, Tail Number, Aircraft */}
        <div className="flight-header-section">
          {hasValue(flightData?.flightID) && (
            <div className="flight-header-item">
              <span className="flight-header-label">Flight</span>
              <h2 className="flight-number-text">{flightData.flightID}</h2>
            </div>
          )}
          {hasValue(flightData?.registration) && (
            <div className="flight-header-item">
              <span className="flight-header-label">Tail Number</span>
              <span className="aircraft-number">{flightData.registration}</span>
            </div>
          )}
          {hasValue(flightData?.aircraftType) && (
            <div className="flight-header-item">
              <span className="flight-header-label">Aircraft</span>
              <span className="aircraft-type">{flightData.aircraftType}</span>
            </div>
          )}
        </div>

        <EDCTSection edctData={EDCT} />

        {/* Airport Codes with Arrow */}
        {(hasValue(flightData?.departure) || hasValue(flightData?.arrival)) && (
          <div className="airport-codes-section">
            {hasValue(flightData?.departure) && (
              <div className="airport-code-large">{flightData.departure}</div>
            )}
            <div className="arrow-icon">→</div>
            {hasValue(flightData?.arrival) && (
              <div className="airport-code-large">{flightData.arrival}</div>
            )}
          </div>
        )}

        {/* Main Flight Details: Gates and Scheduled Local Times */}
        <div className="flight-details-grid">
          {/* Departure Details */}
          <div className="departure-details">
            {hasValue(flightData?.flightStatsOriginGate) && (
              <div className="info-item">
                <div className="info-label">Gate</div>
                <div className="info-value">{flightData.flightStatsOriginGate}</div>
              </div>
            )}
            {hasValue(flightData?.flightStatsScheduledDepartureTime) && (
              <div className="info-item">
                <div className="info-label">Scheduled Local</div>
                <div className="time-value">{flightData.flightStatsScheduledDepartureTime}</div>
              </div>
            )}
          </div>

          {/* Arrival Details */}
          <div className="arrival-details">
            {hasValue(flightData?.flightStatsDestinationGate) && (
              <div className="info-item">
                <div className="info-label">Gate</div>
                <div className="info-value">{flightData.flightStatsDestinationGate}</div>
              </div>
            )}
            {hasValue(flightData?.flightStatsScheduledArrivalTime) && (
              <div className="info-item">
                <div className="info-label">Scheduled Local</div>
                <div className="time-value">{flightData.flightStatsScheduledArrivalTime}</div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled/Estimated Times Section */}
        <div className="scheduled-estimated-grid">
          {/* Departure Out Times */}
          <div className="departure-out-times">
            {hasValue(flightData?.flightAwareScheduledOut) && (
              <div className="info-item">
                <div className="info-label">Scheduled Out</div>
                <div className="info-value">{flightData.flightAwareScheduledOut}</div>
              </div>
            )}
            {hasValue(flightData?.fa_estimated_out) && (
              <div className="info-item">
                <div className="info-label">Estimated Out</div>
                <div className="info-value">{flightData.fa_estimated_out}</div>
              </div>
            )}
          </div>

          {/* Arrival In Times */}
          <div className="arrival-in-times">
            {hasValue(flightData?.flightAwareScheduledIn) && (
              <div className="info-item">
                <div className="info-label">Scheduled In</div>
                <div className="info-value">{flightData.flightAwareScheduledIn}</div>
              </div>
            )}
            {hasValue(flightData?.fa_estimated_in) && (
              <div className="info-item">
                <div className="info-label">Estimated In</div>
                <div className="info-value">{flightData.fa_estimated_in}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryTable;