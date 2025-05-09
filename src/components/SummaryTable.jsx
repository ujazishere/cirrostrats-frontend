/**
 * SummaryTable component displays flight information in a grid layout
 * Shows departure and destination airport details including:
 * - Airport codes
 * - Gate information
 * - Scheduled times
 * - Scheduled in/out times
 */

import React from 'react';

/**
 * Displflight-number-textays comprehensive flight information in a grid layout
 * @param {Object} props
 * @param {Object} props.flightData - Flight information with departure and destination details
 */
const SummaryTable = ({ flightData }) => {
  return (
    <div className="flight-info-container">
      {/* Departure Airport Information */}
      <div className="airport-section">
        <div className="airport-code">{flightData?.departure}</div>
        <br />
        <div className="info-item">
          <div className="info-label">Gate</div>
          <div className="info-value">{flightData?.flightViewDepartureGate}</div>
        </div>
        <br />
        <div className="info-item">
          <div className="info-label">Scheduled Local</div>
          <div className="time-value">{flightData?.flightStatsScheduledDepartureTime}</div>
        </div>
        <br />
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Scheduled In</div>
            {/* This scheduled_in time is from flightAware. 
            TODO: need to change name to flightAwareScheduledIn. */}
            <div className="info-value">{flightData?.scheduled_in}</div>
          </div>
        </div>
      </div>

      {/* Destination Airport Information */}
      <div className="airport-section">
        <div className="airport-code">{flightData?.arrival}</div>
        <br />
        <div className="info-item">
          <div className="info-label">Gate</div>
          <div className="info-value">{flightData?.flightViewArrivalGate}</div>
        </div>
        <br />
        <div className="info-item">
          <div className="info-label">Scheduled Local</div>
          <div className="time-value">{flightData?.flightStatsScheduledArrivalTime}</div>
        </div>
        <br />
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Scheduled Out</div>
            {/* This scheduled_out time is from flightAware.
            TODO: Need to change name to flightAwareScheduledOut. */}
            <div className="info-value">{flightData?.scheduled_out}</div>   
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryTable;