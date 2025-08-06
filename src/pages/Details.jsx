import React, { useState, useEffect } from "react"; // Core React hooks for state and lifecycle management.
import { useLocation } from "react-router-dom"; // Hook to access the current URL's location object, used here to get state passed during navigation.
import axios from "axios"; // A promise-based HTTP client for making requests to our backend API.
import UTCTime from "../components/UTCTime"; // Displays the current time in UTC.
import AirportCard from "../components/AirportCard"; // A card component to display airport details.
import { FlightCard, GateCard } from "../components/Combined"; // Cards for displaying flight and gate information.
import { LoadingFlightCard } from "../components/Skeleton"; // A placeholder/skeleton UI shown while data is loading.
import useAirportData from "../components/AirportData"; // Custom hook to fetch airport weather and NAS data.
import useGateData from "../components/GateData"; // Our newly separated custom hook for fetching gate-specific data.
import flightService from '../components/utility/flightService'; // A service module with helper functions for flight data retrieval.

// =================================================================================
// Configuration
// =================================================================================
// Retrieve the API's base URL from environment variables. This is a best practice for security and configuration management.
const apiUrl = import.meta.env.VITE_API_URL;

// =================================================================================
// CUSTOM HOOK for fetching Flight Data
// Note: In a real-world, large-scale application, this would also be in its own file (e.g., hooks/useFlightData.js) for better separation of concerns.
// This hook is responsible for all logic related to fetching flight, weather, NAS, and EDCT data.
// =================================================================================
const useFlightData = (searchValue) => {
  // We manage all related states within a single object. This simplifies state updates and reduces re-renders.
  const [flightState, setFlightState] = useState({
    loading: false, // Indicates if a fetch operation is in progress.
    data: null, // Holds the combined flight data.
    weather: null, // Holds weather information for departure/arrival airports.
    nas: null, // Holds NAS (National Airspace System) status.
    edct: null, // Holds EDCT (Expect Departure Clearance Time) data.
    error: null, // Holds any error message if a request fails.
  });

  // This `useEffect` hook triggers the data fetching logic whenever the `searchValue` changes.
  useEffect(() => {
    // First, we perform a guard check. If the search type isn't for a flight, we reset the state and do nothing further.
    // This prevents the hook from running unnecessarily.
    if (searchValue?.type !== "flight" && searchValue?.type !== "N-Number") {
      setFlightState({ loading: false, data: null, weather: null, nas: null, edct: null, error: null }); // Reset state to default.
      return; // Exit the effect.
    }

    // Define an async function to handle the entire flight data fetching process.
    const fetchFlightData = async () => {
      // Immediately set the loading state to true and clear out any old data or errors from previous searches.
      setFlightState({ loading: true, data: null, weather: null, nas: null, edct: null, error: null });

      // Check for a specific environment variable to use mock/test data. This is invaluable for development and testing without hitting live APIs.
      if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
        try {
          // Fetch the test data from a dedicated endpoint.
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          console.log("!!TEST FLIGHT DATA!!", res.data); // Log that we are using test data.
          // Populate the state with the mock data.
          setFlightState({
            loading: false,
            data: res.data.flightData || res.data,
            weather: res.data.weather || res.data,
            nas: res.data.NAS || res.data,
            edct: res.data.EDCT || res.data,
            error: null,
          });
        } catch (e) {
          console.error("Test Data Error:", e); // Log any errors fetching test data.
          // Set an error state if the mock data fetch fails.
          setFlightState({ loading: false, data: null, weather: null, nas: null, edct: null, error: "Failed to load test data." });
        }
        return; // Exit after handling test data.
      }

      // Extract the flight identifier from the `searchValue` object. It can be one of several properties.
      const flightID = searchValue?.flightID || searchValue?.nnumber || searchValue?.value;

      // If no valid flightID can be found, we can't proceed. Set an error and stop.
      if (!flightID) {
        setFlightState({ loading: false, data: null, weather: null, nas: null, edct: null, error: "Invalid Flight ID provided." });
        return;
      }

      // This `try...catch` block handles potential errors during the multi-step API fetch process.
      try {
        // Step 1: Fetch primary flight data from various sources using our flight service.
        const {
          ajms, flightAwareRes, flightStatsTZRes
        } = await flightService.getPrimaryFlightData(flightID);

        // If core data sources fail, we can't build a complete picture. Set an error and exit.
        if (ajms.error && flightAwareRes.error) {
          setFlightState({ loading: false, data: null, weather: null, nas: null, edct: null, error: `Could not retrieve data for flight ${flightID}.` });
          return;
        }

        // Step 2: Extract airport identifiers (departure, arrival, alternates) from the aggregated primary data.
        const {
          departure, arrival, departureAlternate, arrivalAlternate
        } = flightService.getAirports({ ajms, flightAwareRes, flightStatsTZRes});
        
        // Step 3: Merge all the fetched data into a single, comprehensive object for the flight.
        const combinedFlightData = {
          flightID,
          departure,
          arrival,
          departureAlternate,
          arrivalAlternate,
          ...ajms.data,
          ...flightAwareRes.data,
          ...flightStatsTZRes.data,
        };

        let edctData = null; // Initialize EDCT data as null.
        // Step 4: Conditionally fetch EDCT data based on an environment flag. This allows turning the feature on/off easily.
        if (import.meta.env.VITE_EDCT_FETCH === "1" && departure && arrival) {
            // Log in development mode to remind developers this potentially costly fetch is active.
            if (import.meta.env.VITE_ENV === "dev") {console.warn('Getting EDCT data. Switch it off in .env if not needed')};
            const { EDCTRes } = await flightService.getEDCT({ flightID, origin: departure.slice(1), destination: arrival.slice(1) });
            edctData = EDCTRes.data; // Store the result.
        }

        // Step 5: Fetch supplementary Weather and NAS data for all known airports.
        let weatherData = null; // Initialize weather data.
        let nasData = null; // Initialize NAS data.
        
        // Create a list of airports that actually have an identifier to avoid fetching for null values.
        const airportsToFetch = [
          { key: 'departure', code: departure },
          { key: 'arrival', code: arrival },
          { key: 'departureAlternate', code: departureAlternate },
          { key: 'arrivalAlternate', code: arrivalAlternate },
        ].filter(item => item.code); // The `.filter` is crucial here.

        // Only proceed if we have at least one valid airport code.
        if (airportsToFetch.length > 0) {
          // Create an array of promises for all the data fetches.
          const requests = airportsToFetch.map(airport => flightService.getWeatherAndNAS(airport.code));
          // Use `Promise.all` to execute all these requests in parallel, which is much more efficient than sequential requests.
          const results = await Promise.all(requests);
          
          // Once all promises resolve, process the results.
          const finalWeather = {};
          const finalNas = {};
          results.forEach((result, index) => {
            const airportKey = airportsToFetch[index].key; // Get the original key ('departure', 'arrival', etc.).
            // Structure the weather and NAS data into a clean, keyed object.
            finalWeather[`${airportKey}WeatherMdb`] = result?.weather?.mdb || null;
            finalWeather[`${airportKey}WeatherLive`] = result?.weather?.live || null;
            finalNas[`${airportKey}NAS`] = result?.NAS || null;
          });
          weatherData = finalWeather;
          nasData = finalNas;
        }

        // Step 6: After all data has been fetched and processed, update the state in a single call.
        setFlightState({
          loading: false, // Set loading to false.
          data: combinedFlightData,
          weather: weatherData,
          nas: nasData,
          edct: edctData,
          error: null // Clear any previous errors.
        });

      } catch (e) {
        // If any part of the `try` block fails, this `catch` block will execute.
        console.error("Error fetching flight details bundle:", e); // Log the full error for debugging.
        // Set a user-friendly error message in the state.
        setFlightState({ loading: false, data: null, weather: null, nas: null, edct: null, error: `Failed to fetch details for flight ${flightID}.` });
      }
    };

    fetchFlightData(); // Execute the master fetching function.
  }, [searchValue]); // The dependency array ensures this entire effect is re-run only when `searchValue` changes.

  // The hook returns its state object, providing the component with everything it needs to render.
  return flightState;
};


// =================================================================================
// Details Component (Refactored)
// This is the main component for this view. Its primary role is to orchestrate the
// data fetching via hooks and render the appropriate UI based on the current state.
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
  // =================================================================================

  // Hook for airport-specific searches.
  const {
    airportWx, // Weather data for the airport.
    nasResponseAirport, // NAS data for the airport.
    loadingWeather, // Loading state for the airport hook.
    airportError, // Error state for the airport hook.
  } = useAirportData(searchValue, apiUrl);

  // Hook for flight-specific searches.
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
  // state of our data hooks (loading, error, or success).
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
