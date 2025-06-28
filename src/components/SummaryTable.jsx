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
 * Also includes a ClearanceSection component that conditionally renders.
 */
import React from 'react';

/**
 * Displays comprehensive flight information in a grid layout
 * @param {Object} props
 * @param {Object} props.flightData - Flight information with departure and destination details
 */
const SummaryTable = ({ flightData }) => {
  // Helper function to check if a value exists and is not empty
  const hasValue = (value) => {
    return value && value.toString().trim() !== '' && value !== 'N/A';
  };

  return (
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

      {/* Airport Codes with Arrow (Departure on left, Arrow in middle, Arrival on right) */}
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
          {hasValue(flightData?.flightViewDepartureGate) && (
            <div className="info-item">
              <div className="info-label">Gate</div>
              <div className="info-value">{flightData.flightViewDepartureGate}</div>
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
          {hasValue(flightData?.flightViewArrivalGate) && (
            <div className="info-item">
              <div className="info-label">Gate</div>
              <div className="info-value">{flightData.flightViewArrivalGate}</div>
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
  );
};

/**
 * ClearanceSection component displays flight clearance information.
 * This section is only rendered if clearance data is available.
 * @param {Object} props
 * @param {Object} props.flightData - Flight information containing clearance details
 */
const ClearanceSection = ({ flightData }) => {
  // Only render the section if flightData.clearance has a truthy value
  // and is not just whitespace
  if (!flightData?.clearance || flightData.clearance.trim() === "") {
    return null; // Don't render anything if no clearance data
  }

  return (
    <div className="flight-clearance-container"> {/* Changed class for potential distinct styling */}
      <h3 className="clearance-title">Clearance</h3>
      <div className="clearance-content">{flightData.clearance}</div>
    </div>
  );
};

// You can export ClearanceSection as a named export if you want to use it elsewhere
// export { ClearanceSection };

export default SummaryTable;