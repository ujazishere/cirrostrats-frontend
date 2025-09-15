// Imports the React library and specific hooks for state management and side effects.
import React, { useState, useCallback, useEffect } from 'react';
// Imports the axios library for making HTTP requests.
import axios from "axios";

/**
 * Component for displaying flight route information with a refresh button.
 * @param {Object} props
 * @param {Object} props.flightData - Flight details containing route information.
 * @param {Function} props.onRefresh - A function to be called to refetch the flight data.
 */

// Retrieves the base URL for the API from the application's environment variables.
const apiUrl = import.meta.env.VITE_API_URL;

// Defines the RoutePanel functional component, which accepts flightData and an onRefresh function as props.
const RoutePanel = ({ flightData, onRefresh }) => {
  // State to track if a data refresh is currently in progress (e.g., for a loading spinner).
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State to manage a cooldown period to prevent frequent refresh requests.
  const [cooldownActive, setCooldownActive] = useState(false);
  // TODO: Routes needs to be compared for inconsistencies and conflict resolution should be handled by user:
        // Hey we found a route conflict between faa route and fllightaware - which one is accurate?
  // State to hold the flight route string, initialized with a fallback from the flightData prop.
  const [route, setRoute] = useState(flightData.fa_route || flightData.route);
  // State to hold the SkyVector link, also initialized with a fallback.
  const [skyVectorLink, setSkyVectorLink] = useState(flightData.fa_sv || flightData.faa_skyvector);

  // This ensures the timeout is cleared if the component is removed, preventing memory leaks.
  // This useEffect hook is responsible for managing the cooldown timer.
  useEffect(() => {
    // A variable to hold the timer ID.
    let cooldownTimer;
    // The timer is only set if the cooldown state is active.
    if (cooldownActive) {
      // Schedules a function to run after a 120-second (2-minute) delay.
      cooldownTimer = setTimeout(() => {
        // After the delay, it deactivates the cooldown.
        setCooldownActive(false);
      }, 120000); // 2 minutes in milliseconds
    }
    // This is the cleanup function for the effect.
    return () => {
      // It clears any existing timer when the component unmounts or when the cooldownActive state changes.
      clearTimeout(cooldownTimer);
    };
  }, [cooldownActive]); // The dependency array ensures this effect only runs when cooldownActive changes.

  // The useCallback hook memoizes this function, preventing it from being recreated on every render.
  const handleRefresh = useCallback(async () => {
    // Prevent clicking if a refresh is in progress or cooldown is active
    // This guard clause stops the function if a refresh is already happening or the cooldown is on.
    if (isRefreshing || cooldownActive) {
      return;
    }

    // Immediately set the states to indicate a refresh has started.
    setIsRefreshing(true);
    setCooldownActive(true); // Start 2-minute cooldown immediately

    // A try...catch...finally block to handle the asynchronous API call.
    try {
      // Call the refresh function passed from the parent component
      // const response = await axios.get(`${apiUrl}/flightAware/${flightData.fa_ident_icao}`);
      // setRoute(response.data.fa__route) if route
      // Makes an API call to get new data. (Currently a test endpoint).
      const response = await axios.get(`${apiUrl}/testDataReturns`);
      console.log('latest',response.data.flightData.fa_ident_icao);
      let nroute = 'NEWA ROUTER'
      // Updates the local state with the newly fetched route.
      setRoute(nroute)
      // await onRefresh();
    } catch (error) {
      // Logs any errors that occur during the API call.
      console.error("Failed to refresh route data:", error);
      // If refresh fails, you might want to end the cooldown early
      // setCooldownActive(false); 
    } finally {
      // The 'finally' block always executes, ensuring the refreshing indicator is turned off.
      setIsRefreshing(false); // Stop the spinning animation
    }
  }, [onRefresh, isRefreshing, cooldownActive]); // Dependencies for the useCallback hook.

  // The return statement contains the JSX that defines the component's UI.
  return (
    // A React.Fragment is used to return multiple elements without adding an extra node to the DOM.
    <>
      {/* CSS Styles for the new refresh button and animations */}
      {/* This style block injects CSS directly into the document for component-specific styling. */}
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
      {/* TODO ismail:  This naming 'weather-tab-panel' is inappropriate for route panel.
      Same name is used in weather tabs. So change it all to `tab-panel`? */}
      <div className="weather-tab-panel">
        <div className="route-tab-content">
          <h3 className="weather-tab-title">Route</h3>
          {/* A ternary operator conditionally renders content based on whether a route exists. */}
          {route ? (
            // This block is rendered if a route is available.
            <>
              <div className="route-display">
                {/* Refresh Button */}
                {/* <button
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
                </button> */}

                <div className="card-body">
                  {/* Displays the flight route string from the state. */}
                  <div className="data-content">{route}</div>
                  {/* This is a short-circuit conditional render; the link is only shown if a skyVectorLink exists. */}
                  {skyVectorLink && (
                    <div className="route-actions">
                      <a href={skyVectorLink} target="_blank" rel="noopener noreferrer" className="sky-vector-link">
                        View on SkyVector
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditionally renders the clearance information if it exists in the flightData prop. */}
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
            // This block is rendered as a fallback if no route information is available.
            <div className="no-route-data">No route information available</div>
          )}
        </div>
      </div>
    </>
  );
};

// Exports the RoutePanel component to be used in other parts of the application.
export default RoutePanel;