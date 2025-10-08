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
  // Helper function to check if a value exists and is not empty
  const hasValue = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '' && value !== 'N/A';
  };

  // NEW: Helper function to check if at least one value in a pair has data
  // This determines whether a paired section should be displayed
  const hasPairValue = (value1, value2) => {
    return hasValue(value1) || hasValue(value2);
  };

  // NEW: Helper function to get display value for paired items
  // Returns the actual value if it exists, otherwise returns '—' for missing data
  const getPairDisplayValue = (value) => {
    return hasValue(value) ? value : '—';
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
    // TODO ismail: Make this section fetch and update edct state after the base flight data has been loaded to 
        // improve performance so whatever data is available is atleast displayed rightaway and new edct fetch happens in the background.
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

  // ✅ UPDATED: This function now calculates flight status based on the new logic.
  // It prioritizes the actual departure time and falls back to the estimated time if the flight has not yet departed.
  const calculateFlightDepartureStatus = (flightData) => {
    // ✅ FIX: Get the date part of the departure from the data.
    const departureDate = flightData?.flightStatsScheduledDepartureDate;
    const scheduledTime = flightData?.flightStatsScheduledDepartureTime;
    const actualTime = flightData?.flightStatsActualDepartureTime;
    const estimatedTime = flightData?.flightStatsEstimatedDepartureTime; 

    // A scheduled time AND a date are required to make any comparison.
    if (!hasValue(scheduledTime) || !hasValue(departureDate)) {
      return null;
    }

    let comparisonTime = null;

    // SCENARIO 2: If the flight has an actual departure time, it has already departed.
    if (hasValue(actualTime)) {
      comparisonTime = actualTime;
    } 
    // SCENARIO 1: If there's no actual time, we use the estimated departure time.
    else if (hasValue(estimatedTime)) {
      comparisonTime = estimatedTime;
    }

    // If there is no time to compare against, we cannot show a status.
    if (!comparisonTime) {
      return null;
    }

    try {
      // ✅ FIX: Combine the date and time strings to create a valid, full date object.
      // Example: "08-Oct-2025" + " " + "17:30 EDT" -> "08-Oct-2025 17:30 EDT"
      const scheduledDateTimeString = `${departureDate} ${scheduledTime}`;
      const comparisonDateTimeString = `${departureDate} ${comparisonTime}`;

      const scheduledDate = new Date(scheduledDateTimeString);
      const comparisonDate = new Date(comparisonDateTimeString);

      // Ensure dates are valid after being combined and parsed.
      if (isNaN(scheduledDate.getTime()) || isNaN(comparisonDate.getTime())) {
        return null;
      }

      // Calculate the difference in minutes.
      const diffMinutes = Math.round((comparisonDate.getTime() - scheduledDate.getTime()) / (1000 * 60));

      // If the difference is positive, the flight is delayed.
      if (diffMinutes > 0) {
        return {
          text: `Delayed by ${diffMinutes} min`,
          isDelayed: true,
        };
      } else {
        // Otherwise, it's "On Time".
        return {
          text: 'On Time',
          isDelayed: false,
        };
      }
    } catch (error) {
      console.error("Error calculating flight departure status:", error);
      return null;
    }
  };

  // ✅ UPDATED: Call the new status calculation function.
  const flightStatus = calculateFlightDepartureStatus(flightData);

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

        {/* ✅ UPDATED: The display logic for the status badge remains the same, but it's now powered by the new calculation. */}
        {/* It renders only if the flightStatus object is successfully calculated. */}
        {flightStatus && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}> {/* Centered container for the badge */}
            <span 
              style={{
                // Conditional styling is based on the `isDelayed` flag from the calculation.
                backgroundColor: flightStatus.isDelayed 
                  ? 'rgba(220, 53, 69, 0.2)' // Light red for delays
                  : 'rgba(108, 117, 125, 0.15)', // Neutral gray for "On Time"
                color: flightStatus.isDelayed
                  ? '#dc3545' // Darker red text
                  : '#6c757d', // Muted text
                padding: '5px 15px',
                borderRadius: '16px',
                fontSize: '0.9em',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}
            >
              {flightStatus.text}
            </span>
          </div>
        )}

        {/* Airport Codes with Arrow - UPDATED: Using paired visibility logic */}
        {/* Show section only if at least one of departure or arrival has data */}
        {hasPairValue(flightData?.departure, flightData?.arrival) && (
          <div className="airport-codes-section">
            {/* Always show departure div, display '—' if no data */}
            <div className="airport-code-large">{getPairDisplayValue(flightData?.departure)}</div>
            <div className="arrow-icon">→</div>
            {/* Always show arrival div, display '—' if no data */}
            <div className="airport-code-large">{getPairDisplayValue(flightData?.arrival)}</div>
          </div>
        )}

        {/* Main Flight Details: Gates and Scheduled Local Times - UPDATED: Using paired visibility logic */}
        <div className="flight-details-grid">
          {/* Departure Details */}
          <div className="departure-details">
            {/* Gate pair: flightStatsOriginGate and flightStatsDestinationGate */}
            {/* Show gate info only if at least one gate has data */}
            {hasPairValue(flightData?.flightStatsOriginGate, flightData?.flightStatsDestinationGate) && (
              <div className="info-item">
                <div className="info-label">Gate</div>
                {/* Always show value, display '—' if no data */}
                <div className="info-value">{getPairDisplayValue(flightData?.flightStatsOriginGate)}</div>
              </div>
            )}
            {/* Scheduled Local Time pair: flightStatsScheduledDepartureTime and flightStatsScheduledArrivalTime */}
            {/* Show scheduled local time only if at least one time has data */}
            {hasPairValue(flightData?.flightStatsScheduledDepartureTime, flightData?.flightStatsScheduledArrivalTime) && (
              <div className="info-item">
                <div className="info-label">Scheduled Local</div>
                {/* Always show value, display '—' if no data */}
                <div className="time-value">{getPairDisplayValue(flightData?.flightStatsScheduledDepartureTime)}</div>
              </div>
            )}
          </div>

          {/* Arrival Details */}
          <div className="arrival-details">
            {/* Gate pair: flightStatsOriginGate and flightStatsDestinationGate */}
            {/* Show gate info only if at least one gate has data */}
            {hasPairValue(flightData?.flightStatsOriginGate, flightData?.flightStatsDestinationGate) && (
              <div className="info-item">
                <div className="info-label">Gate</div>
                {/* Always show value, display '—' if no data */}
                <div className="info-value">{getPairDisplayValue(flightData?.flightStatsDestinationGate)}</div>
              </div>
            )}
            {/* Scheduled Local Time pair: flightStatsScheduledDepartureTime and flightStatsScheduledArrivalTime */}
            {/* Show scheduled local time only if at least one time has data */}
            {hasPairValue(flightData?.flightStatsScheduledDepartureTime, flightData?.flightStatsScheduledArrivalTime) && (
              <div className="info-item">
                <div className="info-label">Scheduled Local</div>
                {/* Always show value, display '—' if no data */}
                <div className="time-value">{getPairDisplayValue(flightData?.flightStatsScheduledArrivalTime)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled/Estimated Times Section - UPDATED: Using paired visibility logic */}
        <div className="scheduled-estimated-grid">
          {/* Departure Out Times */}
          <div className="departure-out-times">
            {/* Scheduled Out pair: flightAwareScheduledOut and flightAwareScheduledIn */}
            {/* Show scheduled out/in only if at least one has data */}
            {hasPairValue(flightData?.flightAwareScheduledOut, flightData?.flightAwareScheduledIn) && (
              <div className="info-item">
                <div className="info-label">Scheduled Out</div>
                {/* Always show value, display '—' if no data */}
                <div className="info-value">{getPairDisplayValue(flightData?.flightAwareScheduledOut)}</div>
              </div>
            )}
            {/* Estimated Out pair: fa_estimated_out and fa_estimated_in */}
            {/* Show estimated out/in only if at least one has data */}
            {hasPairValue(flightData?.fa_estimated_out, flightData?.fa_estimated_in) && (
              <div className="info-item">
                <div className="info-label">Estimated Out</div>
                {/* Always show value, display '—' if no data */}
                <div className="info-value">{getPairDisplayValue(flightData?.fa_estimated_out)}</div>
              </div>
            )}
          </div>

          {/* Arrival In Times */}
          <div className="arrival-in-times">
            {/* Scheduled In pair: flightAwareScheduledOut and flightAwareScheduledIn */}
            {/* Show scheduled out/in only if at least one has data */}
            {hasPairValue(flightData?.flightAwareScheduledOut, flightData?.flightAwareScheduledIn) && (
              <div className="info-item">
                <div className="info-label">Scheduled In</div>
                {/* Always show value, display '—' if no data */}
                <div className="info-value">{getPairDisplayValue(flightData?.flightAwareScheduledIn)}</div>
              </div>
            )}
            {/* Estimated In pair: fa_estimated_out and fa_estimated_in */}
            {/* Show estimated out/in only if at least one has data */}
            {hasPairValue(flightData?.fa_estimated_out, flightData?.fa_estimated_in) && (
              <div className="info-item">
                <div className="info-label">Estimated In</div>
                {/* Always show value, display '—' if no data */}
                <div className="info-value">{getPairDisplayValue(flightData?.fa_estimated_in)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryTable;