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
  
  // ✅ NEW: Helper function to format a full date-time string into just HH:MM AM/PM.
  const formatTime = (dateString, datePart) => {
    try {
      const fullDateString = `${datePart} ${dateString}`;
      const date = new Date(fullDateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      
      return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return dateString; // Fallback to original string on error
    }
  };

  // ✅ NEW: Major logic overhaul. This function now generates a comprehensive state object
  // for both the delay badge AND the departure time display based on the four scenarios.
  // ✅ NEW: Major logic overhaul. This function now generates a comprehensive state object
  // for both the delay badge AND the departure time display based on the four scenarios.
  const getDepartureDisplayInfo = (flightData) => {
    const departureDate = flightData?.flightStatsScheduledDepartureDate;
    const scheduledTime = flightData?.flightStatsScheduledDepartureTime;
    const actualTime = flightData?.flightStatsActualDepartureTime;
    const estimatedTime = flightData?.flightStatsEstimatedDepartureTime; 

    // Helper function to format delay time
    const formatDelay = (totalMinutes) => {
      if (totalMinutes < 60) {
        return `${totalMinutes} mins`;
      }
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const hoursText = `${hours}h${hours > 1 ? '' : ''}`;
      // Only add minutes if they are not zero
      const minutesText = minutes > 0 ? ` ${minutes}m${minutes > 1 ? '' : ''}` : '';
      return `${hoursText}${minutesText}`;
    };

    // Base state for a normal, on-time flight.
    const defaultState = {
      isDelayed: false,
      badgeText: null,
      departureLabel: 'Scheduled Local',
      departureTime: getPairDisplayValue(scheduledTime),
      // ✅ FIX: Use a class for styling instead of an inline color.
      departureTimeClass: '', 
      showStrikethrough: false,
      scheduledDepartureTimeForDisplay: null
    };

    if (!hasValue(scheduledTime) || !hasValue(departureDate)) {
      return defaultState;
    }

    const hasActual = hasValue(actualTime);
    const hasEstimated = hasValue(estimatedTime);

    const comparisonTime = hasActual ? actualTime : (hasEstimated ? estimatedTime : null);

    if (!comparisonTime) {
      return defaultState;
    }

    try {
      const scheduledDateTimeString = `${departureDate} ${scheduledTime}`;
      const comparisonDateTimeString = `${departureDate} ${comparisonTime}`;
      const scheduledDate = new Date(scheduledDateTimeString);
      const comparisonDate = new Date(comparisonDateTimeString);

      if (isNaN(scheduledDate.getTime()) || isNaN(comparisonDate.getTime())) {
        return defaultState;
      }

      const diffMinutes = Math.round((comparisonDate.getTime() - scheduledDate.getTime()) / (1000 * 60));
      const formattedScheduledTime = formatTime(scheduledTime, departureDate);
      const formattedComparisonTime = formatTime(comparisonTime, departureDate);
      
      if (hasActual) {
        if (diffMinutes > 0) {
          // **SCENARIO 2: Actual Delay**
          return {
            isDelayed: true,
            // ✅ UPDATED: Using the new formatDelay function
            badgeText: `Departed ${formatDelay(diffMinutes)} Late`,
            departureLabel: 'DEPARTED',
            departureTime: formattedComparisonTime,
            // ✅ FIX: Set class for delayed time (red).
            departureTimeClass: 'time-delayed',
            showStrikethrough: true,
            scheduledDepartureTimeForDisplay: formattedScheduledTime
          };
        } else {
          // **SCENARIO 4: Actual On-Time or Early**
          return {
            isDelayed: false,
            badgeText: null,
            departureLabel: 'DEPARTED',
            departureTime: formattedComparisonTime,
            // ✅ FIX: Set class for on-time departure (green).
            departureTimeClass: 'time-on-time',
            showStrikethrough: true,
            scheduledDepartureTimeForDisplay: formattedScheduledTime
          };
        }
      } 
      else if (hasEstimated) {
        if (diffMinutes > 0) {
          // **SCENARIO 1: Estimated Delay**
          return {
            isDelayed: true,
            // ✅ UPDATED: Using the new formatDelay function
            badgeText: `Delayed by ${formatDelay(diffMinutes)}`,
            departureLabel: 'Now @',
            departureTime: formattedComparisonTime,
            // ✅ FIX: Set class for delayed time (red).
            departureTimeClass: 'time-delayed',
            showStrikethrough: true,
            scheduledDepartureTimeForDisplay: formattedScheduledTime
          };
        } else {
          // **SCENARIO 3: Estimated On-Time or Early**
          return defaultState;
        }
      }

      return defaultState;

    } catch (error) {
      console.error("Error calculating flight departure status:", error);
      return defaultState;
    }
  };

  // ✅ UPDATED: Call the new, more powerful display info function.
  const departureInfo = getDepartureDisplayInfo(flightData);

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

        {/* ✅ UPDATED: Display logic is simpler. It only shows if the flight is delayed. */}
        {departureInfo.isDelayed && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}> {/* Centered container for the badge */}
            <span 
              style={{
                backgroundColor: 'rgba(220, 53, 69, 0.2)', // Always red for delays
                color: '#dc3545', 
                padding: '5px 15px',
                borderRadius: '16px',
                fontSize: '0.9em',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}
            >
              {departureInfo.badgeText}
            </span>
          </div>
        )}

        {/* Airport Codes with Arrow - UPDATED: Using paired visibility logic */}
        {hasPairValue(flightData?.departure, flightData?.arrival) && (
          <div className="airport-codes-section">
            <div className="airport-code-large">{getPairDisplayValue(flightData?.departure)}</div>
            <div className="arrow-icon">→</div>
            <div className="airport-code-large">{getPairDisplayValue(flightData?.arrival)}</div>
          </div>
        )}

        {/* Main Flight Details: Gates and Scheduled Local Times - UPDATED: Using paired visibility logic */}
        <div className="flight-details-grid">
          {/* Departure Details */}
          <div className="departure-details">
            {hasPairValue(flightData?.flightStatsOriginGate, flightData?.flightStatsDestinationGate) && (
              <div className="info-item">
                <div className="info-label">Gate</div>
                <div className="info-value">{getPairDisplayValue(flightData?.flightStatsOriginGate)}</div>
              </div>
            )}
            
            {/* ✅ UPDATED: This section is now fully dynamic based on the departureInfo object. */}
            {hasPairValue(flightData?.flightStatsScheduledDepartureTime, flightData?.flightStatsScheduledArrivalTime) && (
              <div className="info-item">
                <div className="info-label">{departureInfo.departureLabel}</div>
                {departureInfo.showStrikethrough ? (
                  <div>
                    {/* ✅ FIX: Switched from inline style to className for color control. */}
                    <div className={`time-value ${departureInfo.departureTimeClass}`} style={{ fontWeight: 'bold' }}>
                      {departureInfo.departureTime}
                    </div>
                    <div style={{ fontSize: '0.8em', textDecoration: 'line-through', opacity: 0.7 }}>
                      {departureInfo.scheduledDepartureTimeForDisplay}
                    </div>
                  </div>
                ) : (
                  <div className="time-value">{departureInfo.departureTime}</div>
                )}
              </div>
            )}
          </div>

          {/* Arrival Details */}
          <div className="arrival-details">
            {hasPairValue(flightData?.flightStatsOriginGate, flightData?.flightStatsDestinationGate) && (
              <div className="info-item">
                <div className="info-label">Gate</div>
                <div className="info-value">{getPairDisplayValue(flightData?.flightStatsDestinationGate)}</div>
              </div>
            )}
            {hasPairValue(flightData?.flightStatsScheduledDepartureTime, flightData?.flightStatsScheduledArrivalTime) && (
              <div className="info-item">
                <div className="info-label">Scheduled Local</div>
                <div className="time-value">{getPairDisplayValue(flightData?.flightStatsScheduledArrivalTime)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled/Estimated Times Section - UPDATED: Using paired visibility logic */}
        <div className="scheduled-estimated-grid">
          <div className="departure-out-times">
            {hasPairValue(flightData?.flightAwareScheduledOut, flightData?.flightAwareScheduledIn) && (
              <div className="info-item">
                <div className="info-label">Scheduled Out</div>
                <div className="info-value">{getPairDisplayValue(flightData?.flightAwareScheduledOut)}</div>
              </div>
            )}
            {hasPairValue(flightData?.fa_estimated_out, flightData?.fa_estimated_in) && (
              <div className="info-item">
                <div className="info-label">Estimated Out</div>
                <div className="info-value">{getPairDisplayValue(flightData?.fa_estimated_out)}</div>
              </div>
            )}
          </div>

          <div className="arrival-in-times">
            {hasPairValue(flightData?.flightAwareScheduledOut, flightData?.flightAwareScheduledIn) && (
              <div className="info-item">
                <div className="info-label">Scheduled In</div>
                <div className="info-value">{getPairDisplayValue(flightData?.flightAwareScheduledIn)}</div>
              </div>
            )}
            {hasPairValue(flightData?.fa_estimated_out, flightData?.fa_estimated_in) && (
              <div className="info-item">
                <div className="info-label">Estimated In</div>
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
