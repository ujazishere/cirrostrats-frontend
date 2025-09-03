import { useState, useEffect } from "react"; // Core React hooks for state and lifecycle management.
import axios from "axios"; // A promise-based HTTP client for making requests to our backend API.
import flightService from './utility/flightService'; // A service module with helper functions for flight data retrieval.

// =================================================================================
// Configuration
// =================================================================================
// Retrieve the API's base URL from environment variables. This is a best practice for security and configuration management.
const apiUrl = import.meta.env.VITE_API_URL;

// =================================================================================
// CUSTOM HOOK for fetching Flight Data
// This hook is responsible for all logic related to fetching flight, weather, NAS, and EDCT data.
// By isolating this logic, we make the main component (Details.jsx) cleaner and more focused on rendering.
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

// Export the custom hook as the default export of this module.
export default useFlightData;