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
      {/* Departure Airport Information */}
      <div className="airport-section">
        <div className="airport-code">{flightData?.departure || 'N/A'}</div>
        <br />
        <div className="info-item">
          <div className="info-label">Gate</div>
          <div className="info-value">{flightData?.flightViewDepartureGate || 'N/A'}</div>
        </div>
        <br />
        <div className="info-item">
          <div className="info-label">Scheduled Local</div>
          <div className="time-value">{flightData?.flightStatsScheduledDepartureTime || 'N/A'}</div>
        </div>
        <br />
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Scheduled In</div>
            {/* This scheduled_in time is from flightAware.
            TODO: need to change name to flightAwareScheduledIn. */}
            <div className="info-value">{flightData?.scheduled_in || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Destination Airport Information */}
      <div className="airport-section">
        <div className="airport-code">{flightData?.arrival || 'N/A'}</div>
        <br />
        <div className="info-item">
          <div className="info-label">Gate</div>
          <div className="info-value">{flightData?.flightViewArrivalGate || 'N/A'}</div>
        </div>
        <br />
        <div className="info-item">
          <div className="info-label">Scheduled Local</div>
          <div className="time-value">{flightData?.flightStatsScheduledArrivalTime || 'N/A'}</div>
        </div>
        <br />
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Scheduled Out</div>
            {/* This scheduled_out time is from flightAware.
            TODO: Need to change name to flightAwareScheduledOut. */}
            <div className="info-value">{flightData?.scheduled_out || 'N/A'}</div>
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