import React, { useState, useEffect, useRef } from "react";
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
// TODO: Abstract the logic for fetching flight data into a separate service module just like we have airportData.jsx.

function normalizeAjms(ajms) {
  // TODO: *** CAUTION DO NOT REMOVE THIS NORMALIZATION STEP ***
    // *** Error prone such that it may return jumbled data from various dates. 
    // This is a temporary fix to normalize ajms data until we can fix the backend to return consistent data.
  const result = {};

  for (const [key, val] of Object.entries(ajms)) {
    if (val && typeof val === "object" && "value" in val) {
      // case: { timestamp, value }
      result[key] = val.value;
    } else if (typeof val === "string") {
      // case: plain string
      result[key] = val;
    } else {
      // everything else
      result[key] = null;
    }
  }

  return { data: result }; // keep .data wrapper
  // return result;
}

const useFlightData = (searchValue) => {
  // We manage all related states within a single object. This simplifies state updates and reduces re-renders.
  const [flightState, setFlightState] = useState({
    loading: true, // Indicates if a fetch operation is in progress.
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
          rawAJMS, flightAwareRes, flightStatsTZRes
        } = await flightService.getPrimaryFlightData(flightID);
        // TODO: *** CAUTION DO NOT REMOVE THIS NORMALIZATION STEP ***
                // *** Error prone such that it may return jumbled data from various dates. 
                // This is a temporary fix to normalize ajms data until we can fix the backend to return consistent data.
                // Fix JMS data structure issues at source trace it back from /ajms route's caution note
        // Normalize AJMS data to ensure consistent structure.
        const ajms = normalizeAjms(rawAJMS.data || {});
        
        // If core data sources fail, we can't build a complete picture. Set an error and exit.
        if (ajms.error && flightAwareRes.error) {
          // TODO test: Impletement this notification api for absolute errors.
          // console.log('post notification api here');
          // await flightService.postNotifications(`This is a test notification: ${searchValue}`);
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

        // --- FIX: VALIDATE DATA BEFORE PROCEEDING TO FURTHER FETCHES ---
        // A flight is considered to have no real data if we couldn't find its
        // departure/arrival airports AND we received no specific data from our primary sources.
        const isDataEffectivelyEmpty =
          !combinedFlightData.departure &&
          !combinedFlightData.arrival &&
          Object.keys(flightAwareRes.data || {}).length === 0 &&
          Object.keys(ajms.data || {}).length === 0;

        // If the initial data is empty, stop here and set the state to null.
        if (isDataEffectivelyEmpty) {
          setFlightState({
            loading: false,
            data: null, // Set data to null to trigger the "no data" message
            weather: null,
            nas: null,
            edct: null,
            error: null,
          });
          return; // Exit the function early
        }

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
  const location = useLocation();
  const searchValue = location?.state?.searchValue;

  // Use a ref to track the previous search value to detect the initial render after a search change.
  const previousSearchValueRef = useRef();
  useEffect(() => {
    previousSearchValueRef.current = searchValue;
  });
  const hasSearchChanged = JSON.stringify(previousSearchValueRef.current) !== JSON.stringify(searchValue);

  // =================================================================================
  // Hook Instantiation
  // =================================================================================

  const {
    airportWx,
    nasResponseAirport,
    loadingWeather,
    airportError,
  } = useAirportData(searchValue, apiUrl);

  const {
    loading: loadingFlightData,
    data: flightData,
    weather: weatherResponseFlight,
    nas: nasResponseFlight,
    edct: EDCT,
    error: flightError,
  } = useFlightData(searchValue);

  const {
    loading: loadingGateData,
    data: gateData,
    error: gateError,
  } = useGateData(searchValue);


  // =================================================================================
  // Render Logic
  // =================================================================================
  const renderContent = () => {
    // --- LOADING LOGIC ---
    // This section decides whether to show a skeleton, nothing, or proceed to show data.
    // It correctly handles the initial render cycle where hook loading states are not yet updated.
    
    const isFlightSearch = searchValue?.type === 'flight' || searchValue?.type === 'N-Number';
    const isAirportSearch = searchValue?.type === 'airport';
    const isGateSearch = searchValue?.type === 'Terminal/Gate';

    // ✅ FIX: For flight searches, show the skeleton immediately if the search just changed OR if it's still loading.
    // This removes the blank screen that appeared for a moment.
    if (isFlightSearch && (hasSearchChanged || loadingFlightData)) {
      return <LoadingFlightCard />;
    }

    // ✅ FIX: For fast searches (airport/gate), show null if the search just changed OR if it's still loading.
    // This prevents the "no data" message from flashing.
    if ((isAirportSearch && (hasSearchChanged || loadingWeather)) || (isGateSearch && (hasSearchChanged || loadingGateData))) {
        return null;
    }

    // --- DATA, ERROR, and NO-DATA LOGIC ---
    // If we get here, it means all loading is complete and we are ready to display the final result.

    if (searchValue) {
        switch (searchValue.type) {
            case "flight":
            case "N-Number":
                if (flightError) return <div>Error fetching flight data: {flightError}</div>;
                if (flightData) {
                    return (
                        <FlightCard
                            flightData={flightData}
                            weather={weatherResponseFlight}
                            NAS={nasResponseFlight}
                            EDCT={EDCT}
                        />
                    );
                }
                return (
                    <div className="no-data-message">
                      <p>No flight data could be found for this search.</p>
                    </div>
                );

            case "airport":
                if (airportError) return <div>Error fetching airport data: {airportError}</div>;
                if (airportWx && Object.keys(airportWx).length > 0) {
                    return (
                        <AirportCard
                            weatherDetails={airportWx}
                            nasResponseAirport={nasResponseAirport}
                        />
                    );
                }
                return (
                    <div className="no-data-message">
                      <p>No weather or airport data is available.</p>
                    </div>
                );

            case "Terminal/Gate":
                if (gateError) return <div>Error fetching gate data: {gateError}</div>;
                if (gateData && gateData.length > 0) {
                    return <GateCard gateData={gateData} currentSearchValue={searchValue} />;
                }
                return (
                    <div className="no-data-message">
                      <p>No departure information is available for this gate.</p>
                    </div>
                );

            default:
                return <p>Select a search type to begin.</p>;
        }
    }
    
    return (
      <div className="no-data-message">
        <p>No results found. Please try a new search.</p>
      </div>
    );
  };

  // =================================================================================
  // Component Return
  // =================================================================================
  return (
    <div className="details">
      <style>{`
        .no-data-message {
          text-align: center;
          color: #6c757d; /* A muted text color */
          padding: 5rem 1rem;
          font-size: 1.1rem;
        }
      `}</style>
      
      <UTCTime />
      {searchValue ? renderContent() : <p>Please perform a search to see details.</p>}
    </div>
  );
};

export default Details;