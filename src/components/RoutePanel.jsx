import React from 'react';

/**
 * Component for displaying flight route information in a tabbed interface
 * @param {Object} props
 * @param {Object} props.flightData - Flight details containing route information
 */
const RoutePanel = ({ flightData }) => {
  return (
    <div className="weather-tab-panel">
      <div className="weather-tab-header">
        <h3 className="weather-tab-title">
          Flight Route
        </h3>
      </div>
      <div className="route-tab-content">
        {flightData?.route ? (
          <div className="route-display">
            <div className="route-info">
              <div className="route-text">{flightData.route}</div>
              {flightData?.sv && (
                <div className="route-actions">
                  <a href={flightData.sv} target="_blank" rel="noopener noreferrer" className="sky-vector-link">
                    View on SkyVector
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-route-data">No route information available</div>
        )}
      </div>
    </div>
  );
};

export default RoutePanel;