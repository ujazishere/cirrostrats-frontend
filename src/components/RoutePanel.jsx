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
        {(flightData?.fa_route || flightData?.route) ? (
          <>
            <div className="route-display">
              <div className="card-body">
                <div className="data-content">{flightData.fa_route || flightData.route}</div>
                {(flightData?.fa_sv || flightData?.faa_skyvector) && (
                  <div className="route-actions">
                    <a href={flightData.fa_sv || flightData.faa_skyvector} target="_blank" rel="noopener noreferrer" className="sky-vector-link">
                      View on SkyVector
                    </a>
                  </div>
                )}
              </div>
            </div>
            {/* Add margin-top to this container */}
            {flightData?.clearance && (
              <div className="clearance-display" style={{ marginTop: '20px' }}>
                <div className="clearance-body">
                  <h3 className="clearance-tab-title">Clearance</h3>
                  <div className="clearance-content">{flightData.clearance}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-route-data">No route information available</div>
        )}
      </div>
    </div>
  );
};
export default RoutePanel;