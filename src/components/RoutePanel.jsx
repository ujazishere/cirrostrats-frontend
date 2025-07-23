import React, { useState, useCallback, useEffect } from 'react';

/**
 * Component for displaying flight route information with a refresh button.
 * @param {Object} props
 * @param {Object} props.flightData - Flight details containing route information.
 * @param {Function} props.onRefresh - A function to be called to refetch the flight data.
 */
const RoutePanel = ({ flightData, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);

  // This ensures the timeout is cleared if the component is removed, preventing memory leaks.
  useEffect(() => {
    let cooldownTimer;
    if (cooldownActive) {
      cooldownTimer = setTimeout(() => {
        setCooldownActive(false);
      }, 120000); // 2 minutes in milliseconds
    }
    return () => {
      clearTimeout(cooldownTimer);
    };
  }, [cooldownActive]);

  const handleRefresh = useCallback(async () => {
    // Prevent clicking if a refresh is in progress or cooldown is active
    if (isRefreshing || cooldownActive) {
      return;
    }

    setIsRefreshing(true);
    setCooldownActive(true); // Start 2-minute cooldown immediately

    try {
      // Call the refresh function passed from the parent component
      await onRefresh();
    } catch (error) {
      console.error("Failed to refresh route data:", error);
      // If refresh fails, you might want to end the cooldown early
      // setCooldownActive(false); 
    } finally {
      setIsRefreshing(false); // Stop the spinning animation
    }
  }, [onRefresh, isRefreshing, cooldownActive]);

  return (
    <>
      {/* CSS Styles for the new refresh button and animations */}
      <style>{`
        .route-display {
          position: relative; /* Needed for positioning the button */
        }
        .refresh-route-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, transform 0.2s;
        }
        .refresh-route-btn:hover:not(:disabled) {
          background: #e0e0e0;
          transform: scale(1.1);
        }
        .refresh-route-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .refresh-icon {
          width: 16px;
          height: 16px;
          color: #333;
        }
        .refresh-icon.spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="weather-tab-panel">
        <div className="route-tab-content">
          <h3 className="weather-tab-title">Route</h3>
          {(flightData?.fa_route || flightData?.route) ? (
            <>
              <div className="route-display">
                {/* Refresh Button */}
                <button
                  className="refresh-route-btn"
                  onClick={handleRefresh}
                  disabled={cooldownActive || isRefreshing}
                  title={cooldownActive ? "Refresh available in 2 minutes" : "Refresh route"}
                >
                  <svg
                    className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                  </svg>
                </button>

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
    </>
  );
};

export default RoutePanel;