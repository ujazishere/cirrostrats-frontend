import React from "react"; // Only React itself is needed now as hooks are in their own files.
import { useLocation } from "react-router-dom"; // Hook to access the current URL's location object, used here to get state passed during navigation.
import UTCTime from "../components/UTCTime"; // Displays the current time in UTC.
import AirportCard from "../components/AirportCard"; // A card component to display airport details.
import { FlightCard, GateCard } from "../components/Combined"; // Cards for displaying flight and gate information.
import { LoadingFlightCard } from "../components/Skeleton"; // A placeholder/skeleton UI shown while data is loading.
// Our custom data-fetching hooks are now imported. Each one handles a specific "concern."
import useAirportData from "../components/AirportData"; // Custom hook to fetch airport weather and NAS data.
import useGateData from "../components/GateData"; // Custom hook for fetching gate-specific data.
import useFlightData from "../components/flightData"; // **NEW**: Importing our newly separated custom hook for fetching flight-specific data.

// =================================================================================
// Configuration
// =================================================================================
// Retrieve the API's base URL from environment variables.
const apiUrl = import.meta.env.VITE_API_URL;

// =================================================================================
// Details Component (Refactored)
// This is the main component for this view. Its primary role is to orchestrate the
// data fetching via hooks and render the appropriate UI based on the current state.
// It is now a "Container" or "Controller" component, primarily concerned with state management and rendering logic, not data fetching implementation.
// =================================================================================

/**
 * The Details component displays information based on a search value from the URL state.
 * It acts as a controller, delegating data fetching to custom hooks and rendering
 * sub-components based on the search type and data availability.
 *
 * @param {object} location.state - The state passed from react-router during navigation.
 * @param {object} location.state.searchValue - The core search object that drives the component's behavior.
 * @property {string} searchValue.type - The type of search (e.g., "flight", "airport", "Terminal/Gate", "N-Number").
 * @property {string} searchValue.value - The primary value for the search (e.g., flight number, airport code).
 * @property {string} searchValue.label - A user-friendly label for the search term, often used for display.
 * @property {string} [searchValue.flightID] - A specific flight identifier, if applicable.
 * @property {string} [searchValue.nnumber] - An aircraft's N-number (tail number), if applicable.
 * @property {string} [searchValue.gate] - A specific gate identifier, if applicable.
 */
const Details = () => {
  // Access the location object provided by React Router.
  const location = useLocation();
  // Safely access the `searchValue` from the location's state. It might be undefined if the page is loaded directly.
  const searchValue = location?.state?.searchValue;

  // =================================================================================
  // Hook Instantiation
  // Here, we call our custom hooks, passing the `searchValue`.
  // The component subscribes to the state changes from these hooks.
  // The implementation details of HOW the data is fetched are hidden away inside the hooks themselves.
  // =================================================================================

  // Hook for airport-specific searches.
  const {
    airportWx, // Weather data for the airport.
    nasResponseAirport, // NAS data for the airport.
    loadingWeather, // Loading state for the airport hook.
    airportError, // Error state for the airport hook.
  } = useAirportData(searchValue, apiUrl);

  // Hook for flight-specific searches. We get all the state we need from our imported hook.
  const {
    loading: loadingFlightData, // Loading state from the flight hook.
    data: flightData, // Flight data object.
    weather: weatherResponseFlight, // Associated weather data for the flight's airports.
    nas: nasResponseFlight, // Associated NAS data.
    edct: EDCT, // Associated EDCT data.
    error: flightError, // Error state from the flight hook.
  } = useFlightData(searchValue);

  // Hook for gate-specific searches.
  const {
    loading: loadingGateData, // Loading state from the gate hook.
    data: gateData, // Gate data object.
    error: gateError, // Error state from the gate hook.
  } = useGateData(searchValue);

  // =================================================================================
  // Render Logic
  // This function determines what to display on the screen based on the collective
  // state of our data hooks (loading, error, or success). This logic remains in the
  // Details component because its concern is "what to show the user."
  // =================================================================================
  const renderContent = () => {
    // Priority 1: Check for loading states. If any data is being fetched, show a loading indicator.
    // This provides immediate feedback to the user.
    if (loadingFlightData || loadingWeather || loadingGateData) {
      // We can show a generic or specific loading UI. Here, we use a skeleton card.
      return <LoadingFlightCard />;
    }

    // Priority 2: Check for error states. If any hook returned an error, display it.
    // This ensures the user is informed of problems.
    if (flightError) return <div>Error fetching flight data: {flightError}</div>;
    if (airportError) return <div>Error fetching airport data: {airportError}</div>;
    if (gateError) return <div>Error fetching gate data: {gateError}</div>;

    // Priority 3: If not loading and no errors, render the data.
    // We must ensure `searchValue` exists before trying to render data based on its type.
    if (searchValue) {
        // A `switch` statement is a clean way to handle rendering for different search types.
        switch (searchValue.type) {
            // These two cases both result in showing the FlightCard.
            case "flight":
            case "N-Number":
                // Render the FlightCard only if `flightData` is available (truthy).
                return flightData ? (
                    <FlightCard
                        flightData={flightData}
                        weather={weatherResponseFlight}
                        NAS={nasResponseFlight}
                        EDCT={EDCT}
                    />
                ) : null; // Render nothing if data is not yet available (or failed silently).

            case "airport":
                // Render the AirportCard only if `airportWx` data is available.
                return airportWx ? (
                    <AirportCard
                        weatherDetails={airportWx}
                        nasResponseAirport={nasResponseAirport}
                    />
                ) : null;

            case "Terminal/Gate":
                // Render the GateCard only if `gateData` is available.
                return gateData ? (
                    <GateCard gateData={gateData} currentSearchValue={searchValue} />
                ) : null;

            // A default case is good practice for unhandled search types.
            default:
                return <p>Select a search type to begin.</p>;
        }
    }
    
    // Fallback message if there's no data to display after all checks.
    return <p>No results found. Please try a new search.</p>;
  };

  // =================================================================================
  // Component Return
  // This is the final JSX structure of the component.
  // =================================================================================
  return (
    // The main container div for the details page.
    <div className="details">
      {/* The UTC time component is always displayed. */}
      <UTCTime />
      {/* Conditionally render the main content.
        If `searchValue` exists, we call `renderContent()` to go through the loading/error/data logic.
        If `searchValue` doesn't exist (e.g., on initial page load), we show a prompt to the user.
      */}
      {searchValue ? renderContent() : <p>Please perform a search to see details.</p>}
    </div>
  );
};

// Export the component to make it available for use in other parts of the application, like the router.
export default Details;