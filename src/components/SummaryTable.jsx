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
import React from 'react';

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

  // Component to render the EDCT table
  const EDCTSection = ({ edctData }) => {
    // Don't render the section if there's no data, or it's not a non-empty array
    if (!edctData || !Array.isArray(edctData) || edctData.length === 0) {
      return null;
    }

    return (
      <div className="edct-section">
        <h3 className="edct-title">EDCT Details</h3>
        <div className="edct-table">
          {/* EDCT Table Header */}
          <div className="edct-row edct-header">
            <div className="edct-cell">Filed Departure Time</div>
            <div className="edct-cell">EDCT</div>
            <div className="edct-cell">Control Element</div>
            <div className="edct-cell">Flight Cancelled</div>
          </div>

          {/* EDCT Table Body - Map through each EDCT record */}
          {edctData.map((item, index) => (
            <div className="edct-row" key={index}>
              <div className="edct-cell" data-label="Filed Departure Time">
                {hasValue(item.filedDepartureTime) ? item.filedDepartureTime : '—'}
              </div>
              <div className="edct-cell" data-label="EDCT">
                {hasValue(item.edct) ? item.edct : '—'}
              </div>
              <div className="edct-cell" data-label="Control Element">
                {hasValue(item.controlElement) ? item.controlElement : '—'}
              </div>
              <div className="edct-cell" data-label="Flight Cancelled">
                {hasValue(item.flightCancelled) ? item.flightCancelled.toString() : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    // Use a React Fragment to return multiple top-level elements
    <>
      <div className="flight-info-container">
        {/* Top Header Section: Flight, Tail Number, Aircraft */}
        <div className="flight-header-section">
          {hasValue(flightData?.flightID) && (
            <div className="flight-header-item">
              <span className="flight-header-label">Flight</span>
              {/* This is the line that was causing the error, now removed: <h2 className="flight-number-text">{EDCT}</h2> */}
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

    </>
  );
};

export default SummaryTable;
