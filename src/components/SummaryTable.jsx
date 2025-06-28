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
  return (
    <div className="flight-info-container">
      {/* Top Header Section: Flight, Tail Number, Aircraft */}
      <div className="flight-header-section">
        <div className="flight-header-item">
          <span className="flight-header-label">Flight</span>
          <h2 className="flight-number-text">{flightData?.flightID || 'N/A'}</h2>
        </div>
        <div className="flight-header-item">
          <span className="flight-header-label">Tail Number</span>
          <span className="aircraft-number">{flightData?.registration || 'N/A'}</span>
        </div>
        <div className="flight-header-item">
          <span className="flight-header-label">Aircraft</span>
          <span className="aircraft-type">{flightData?.aircraftType || 'N/A'}</span>
        </div>
      </div>

      {/* Airport Codes with Arrow (Departure on left, Arrow in middle, Arrival on right) */}
      <div className="airport-codes-section">
        <div className="airport-code-large">{flightData?.departure || 'N/A'}</div>
        <div className="arrow-icon">→</div>
        <div className="airport-code-large">{flightData?.arrival || 'N/A'}</div>
      </div>

      {/* Main Flight Details: Gates and Scheduled Local Times */}
      <div className="flight-details-grid">
        {/* Departure Details */}
        <div className="departure-details">
          <div className="info-item">
            <div className="info-label">Gate</div>
            <div className="info-value">{flightData?.flightViewDepartureGate || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Scheduled Local</div>
            <div className="time-value">{flightData?.flightStatsScheduledDepartureTime || 'N/A'}</div>
          </div>
        </div>

        {/* Arrival Details */}
        <div className="arrival-details">
          <div className="info-item">
            <div className="info-label">Gate</div>
            <div className="info-value">{flightData?.flightViewArrivalGate || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Scheduled Local</div>
            <div className="time-value">{flightData?.flightStatsScheduledArrivalTime || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Scheduled/Estimated Times Section */}
      <div className="scheduled-estimated-grid">
        {/* Departure Out Times */}
        <div className="departure-out-times">
          <div className="info-item">
            <div className="info-label">Scheduled Out</div>
            <div className="info-value">{flightData?.flightAwareScheduledOut || 'N/A'}</div> {/* Renamed */}
          </div>
          <div className="info-item">
            <div className="info-label">Estimated Out</div>
            <div className="info-value">{flightData?.fa_estimated_out || 'N/A'}</div>
          </div>
        </div>

        {/* Arrival In Times */}
        <div className="arrival-in-times">
          <div className="info-item">
            <div className="info-label">Scheduled In</div>
            <div className="info-value">{flightData?.flightAwareScheduledIn || 'N/A'}</div> {/* Renamed */}
          </div>
          <div className="info-item">
            <div className="info-label">Estimated In</div>
            <div className="info-value">{flightData?.fa_estimated_in || 'N/A'}</div>
          </div>
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
