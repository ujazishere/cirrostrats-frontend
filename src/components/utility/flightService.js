// utils/flightDataUtils.js
// services/flightService.js
// Imports the axios library for making HTTP requests.
import axios from "axios";

// Retrieves the base URL for the API from the application's environment variables.
const apiUrl = import.meta.env.VITE_API_URL;

// Defines a service object to encapsulate all API calls related to flight data.
const flightService = {
  /**
   * Extracts airports from multiple flight data sources.
   * Priority: AJMS > FlightAware > FlightStats.
   * * @param {Object} sources.ajms - Data from AJMS API.
   * @param {Object} sources.flightAwareRes - Data from FlightAware API.
   * @param {Object} sources.flightStatsTZRes - Data from FlightStats API.
   * * @returns {Object} airports - Identified airport data:
   * - {string|null} departure
   * - {string|null} arrival
   * - {string|null} departureAlternate
   * - {string|null} arrivalAlternate
   * * @note Inconsistencies between sources are possible due to data timing, icao/iata, weather, or vendor coverage.
   */
  // This method consolidates airport information from various sources with a specific priority order.
  getAirports: ({ ajms, flightAwareRes, flightStatsTZRes}) => {
    // Initializes variables with null to hold the airport data.
    let departure = null;
    let arrival = null;
    let departureAlternate = null;
    let arrivalAlternate = null;

    // TODO VHP Test: compare departure and arrival from different sources for absolute verification! 
      // If jms availbale return and show that first. use others to verify accuracy.
      // Anomaly may exist between sources and arrival/departure alternate may not be accurate depending on weather conditions -- mismatch possible.
      // Especially when one flight number has multiple flights back and forth.
    // First priority: Try to get data from the AJMS source. Optional chaining (?.) prevents errors if 'ajms' or 'ajms.data' is null/undefined.
    if (ajms?.data) {
      departure = ajms.data.departure || null;
      arrival = ajms.data.arrival || null;
      departureAlternate = ajms.data.departureAlternate || null;
      arrivalAlternate = ajms.data.arrivalAlternate || null;
    }

    // Second priority: If departure or arrival is still not found, try the FlightAware source.
    // It only updates a variable if it's currently null, preserving any data found from AJMS.
    if ((!departure || !arrival) && flightAwareRes?.data) {
      departure = flightAwareRes.data.fa_origin || departure;
      arrival = flightAwareRes.data.fa_destination || arrival;
    }

    // Third priority: As a final fallback, try the FlightStats source if departure or arrival is still missing.
    if (!departure || !arrival) {
      departure = flightStatsTZRes?.data?.flightStatsOrigin || 
                  departure;
      arrival = flightStatsTZRes?.data?.flightStatsDestination || 
                arrival;
    }

    // Returns an object containing the consolidated airport information.
    return { departure, arrival, departureAlternate, arrivalAlternate };
  },
  
  /**
   * Fetches core flight data from multiple sources in parallel.
   * Optional: FlightAware API can be toggled via `.env` setting.
   * * @param {string} flightID
   * @param {string} args.flightID - The flight identifier used for all fetches.
   * * @returns {Promise<Object>} Aggregated flight data from:
   * - ajms
   * - flightAwareRes
   * - flightStatsTZRes
   */
  // This asynchronous method fetches primary flight details from several APIs concurrently.
  getPrimaryFlightData: async (flightID) => {

    // # TODO: To fetch test jms - need to completely redesign ajms response architecture since current setup is inefficient
      // Current setup requests ajms from bakend which is inefficient but secure since it abstracts away ajms through backend.
    // `Promise.all` executes multiple API requests in parallel for faster data retrieval.
    // A `.catch` is attached to each promise to prevent `Promise.all` from failing if a single request fails.
    const [rawAJMS, flightStatsTZRes] = await Promise.all([
    axios.get(`${apiUrl}/ajms/${flightID}`).catch(e => { console.error("AJMS Error:", e); return { data: {}, error: true }; }),
    axios.get(`${apiUrl}/flightStatsTZ/${flightID}`).catch(e => { console.error("FlightStatsTZ Error:", e); return { data: {}, error: true }; }),
    ]);

    // Initializes the FlightAware response with a default error state.
    let flightAwareRes = { data: {}, error: true };

    // Conditionally fetches FlightAware data based on an environment variable.
    if (import.meta.env.VITE_APP_AVOID_FLIGHT_AWARE !== "true") {
      // Note for dev guys using flightaware -- dont use it if you dont need.
      if (import.meta.env.VITE_ENV === "dev") {console.log('Getting flightaware data. Switch it off in .env if not needed')};    // let developer know flightaware fetch is on in dev mode.
      // Awaits the FlightAware API call, also with its own error handling.
      flightAwareRes = await axios.get(`${apiUrl}/flightAware/${flightID}`).catch(e => { 
        console.error("FlightAware Error:", e); 
        return { data: {}, error: true }; 
      });
    };

    // Returns an object containing the results from all API calls.
    return {rawAJMS, flightAwareRes, flightStatsTZRes }
  },

  /**
   * Fetches EDCT in parallel.
   * * @param {string} flightID
   * @param {string|null} origin
   * @param {string|null} destination
   * * @returns {Promise<Array>}
   * - list/array of edct items
   * -- filedDepartureTime, edct, controlElement, flightCancelled
   */
  // This method fetches Expect Departure Clearance Time (EDCT) data.
  getEDCT: async ({flightID, origin, destination}) => {
    // A try-catch block to handle any unexpected errors during the process.
    try {
      // Execute both requests in parallel
      // Uses Promise.all for the API call, with .catch to handle failures gracefully.
      const [EDCTRes] = await Promise.all([
        axios.get(`${apiUrl}/EDCTLookup/${flightID}?origin=${origin}&destination=${destination}`).catch(() => null),
      ]);

      // Returns the response wrapped in an object.
      return {
        EDCTRes
      };
    } catch (error) {
      // Logs any caught errors and re-throws them.
      console.error("Error in getWeatherAndNAS:", error);
      throw error;
    }
  },

  /**
   * Fetches weather and nas for airport in parallel.
   * * @param {string} departure
   * @param {string} arrival
   * @param {string|null} departureAlternate
   * @param {string|null} arrivalAlternate
   * * @returns {Promise<Object>} weather and nas:
   * - nasRes, depWeatherLive, destWeatherLive, depWeatherMdb, destWeatherMdb
   */
  // This method orchestrates fetching both weather and NAS data for a given airport.
  getWeatherAndNAS: async (airportCode) => {
    try {
      // Execute both requests in parallel
      // Calls other methods within this service concurrently using Promise.all.
      const [weatherRes, NASRes] = await Promise.all([
        flightService.getAirportWeather(airportCode),
        flightService.getAirportNAS(airportCode),
      ]);

      // Returns an object containing both weather and NAS data.
      return {
        weather: weatherRes,
        NAS: NASRes,
      };
    } catch (error) {
      console.error("Error in getWeatherAndNAS:", error);
      throw error;
    }
  },

  // This method fetches two types of weather data (live and mdb) for a specific airport.
  getAirportWeather: async (airportCode) => {
    try {
      // Fetches both weather sources in parallel for efficiency.
      const [liveWeather, mdbWeather] = await Promise.all([
        axios.get(`${apiUrl}/liveAirportWeather/${airportCode}`).catch(() => null),
        axios.get(`${apiUrl}/mdbAirportWeather/${airportCode}`).catch(() => null)
      ]);

      // Returns an object with the data from both sources, defaulting to null if a request failed.
      return {
        live: liveWeather?.data || null,
        mdb: mdbWeather?.data || null,
      };
    } catch (error) {
      console.error(`Error getting weather for ${airportCode}:`, error);
      // Returns null in case of a critical error.
      return null;
    }
  },

  // This method fetches National Airspace System (NAS) data for a specific airport.
  getAirportNAS: async (airportCode) => {
    try {
      // Makes a single API call to the NAS endpoint.
      const nasRes = await axios.get(`${apiUrl}/NAS?airport=${airportCode}`)
        // The .catch block handles potential API errors gracefully.
        .catch(error => {
          console.error("NAS API Error:", error);
          return null;
        });

      // Safely returns the data property of the response, or null if the request failed.
      return nasRes?.data || null;
    } catch (error) {
      console.error(`Error getting NAS for ${airportCode}:`, error);
      return null;
    }
  },

  // TODO: Obviously This doesnt belong here -- move to notification api folder.
    //  Move all api to api folder other than flightservice.
  // This method sends a notification message to a backend service.
  postNotifications: async (message) => {
    try {
      // Makes a POST request to the notification endpoint. The message is URI-encoded to be safely passed as a query parameter.
      await axios.post(`${apiUrl}/sendTelegramNotification?message=${encodeURIComponent(message)}`)
      // Returns true on successful submission.
      return true;
    } catch (error) {
      console.error("Notification API Error:", error);
      // Returns null if an error occurs.
      return null;
    }
  },
};

// Exports the flightService object for use in other parts of the application.
export default flightService;