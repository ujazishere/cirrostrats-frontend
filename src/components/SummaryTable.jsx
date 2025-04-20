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
 * Displays comprehensive flight information in a grid layout
 * @param {Object} props
 * @param {Object} props.flightDetails - Flight information with departure and destination details
 */
const SummaryTable = ({ flightDetails }) => {
  console.log('flightDetails', flightDetails);
  return (
    <div className="flight-info-container">
      {/* Departure Airport Information */}
      <div className="airport-section">
        <div className="airport-code">{flightDetails?.departure_ID}</div>
        <br />
        <div className="info-item">
          <div className="info-label">Gate</div>
          <div className="info-value">{flightDetails?.departure_gate}</div>
        </div>
        <br />
        <div className="info-item">
          <div className="info-label">Scheduled Local</div>
          <div className="time-value">{flightDetails?.scheduled_departure_time}</div>
        </div>
        <br />
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Scheduled In</div>
            <div className="info-value">{flightDetails?.scheduled_in}</div>
          </div>
        </div>
      </div>

      {/* Destination Airport Information */}
      <div className="airport-section">
        <div className="airport-code">{flightDetails?.destination_ID}</div>
        <br />
        <div className="info-item">
          <div className="info-label">Gate</div>
          <div className="info-value">{flightDetails?.arrival_gate}</div>
        </div>
        <br />
        <div className="info-item">
          <div className="info-label">Scheduled Local</div>
          <div className="time-value">{flightDetails?.scheduled_arrival_time}</div>
        </div>
        <br />
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Scheduled Out</div>
            <div className="info-value">{flightDetails?.scheduled_out}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryTable;