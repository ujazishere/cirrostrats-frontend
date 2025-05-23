import React from 'react';

/**
 * Component for displaying flight route information in a tabbed interface
 * @param {Object} props
 * @param {Object} props.flightData - Flight details containing route information
 */
const RoutePanel = ({ flightData }) => {
  return (
    <div className="weather-tab-panel">
      <div className="route-tab-content">
        <h3 className="weather-tab-title">
          Route
        </h3>
        {flightData?.route ? (
          <>
            <div className="route-display">
              <div className="card-body">
                <div className="data-content">{flightData.route}</div>
                {flightData?.sv && (
                  <div className="route-actions">
                    <a href={flightData.sv} target="_blank" rel="noopener noreferrer" className="sky-vector-link">
                      View on SkyVector
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Add margin-top to this container */}
            <div className="route-display" style={{ marginTop: '20px' }}>
              <div className="card-body">
                <h3 className="weather-tab-title">Clearance</h3>
                <div className="data-content">{flightData.clearance}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-route-data">No route information available</div>
        )}
      </div>
    </div>
  );
};

export default RoutePanel;
