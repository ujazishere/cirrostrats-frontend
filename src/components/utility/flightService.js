// utils/flightDataUtils.js
// services/flightService.js
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const flightService = {
  /**
   * Extracts airports from multiple flight data sources.
   * Priority: AJMS > FlightAware > FlightStats > FlightView.
   * 
   * @param {Object} sources - Aggregated data from various providers.
   * @param {Object} sources.ajms - Data from AJMS API.
   * @param {Object} sources.flightAwareRes - Data from FlightAware API.
   * @param {Object} sources.flightStatsTZRes - Data from FlightStats API.
   * @param {Object} sources.flightViewGateInfo - Data from FlightView API.
   * 
   * @returns {Object} airports - Identified airport data:
   *  - {string|null} departure
   *  - {string|null} arrival
   *  - {string|null} departureAlternate
   *  - {string|null} arrivalAlternate
   * 
   * @note Inconsistencies between sources are possible due to data timing, icao/iata, weather, or vendor coverage.
   */
  getAirports: ({ ajms, flightAwareRes, flightStatsTZRes, flightViewGateInfo }) => {
    let departure = null;
    let arrival = null;
    let departureAlternate = null;
    let arrivalAlternate = null;

    // TODO VHP Test: compare departure and arrival from different sources for absolute verification! 
    // Anomaly may exist between sources and arrival/departure alternate may not be accurate depending on weather conditions -- mismatch possible.
    if (ajms?.data) {
      departure = ajms.data.departure || null;
      arrival = ajms.data.arrival || null;
      departureAlternate = ajms.data.departureAlternate || null;
      arrivalAlternate = ajms.data.arrivalAlternate || null;
    }

    if ((!departure || !arrival) && flightAwareRes?.data) {
      departure = flightAwareRes.data.fa_origin || departure;
      arrival = flightAwareRes.data.fa_destination || arrival;
    }

    if (!departure || !arrival) {
      departure = flightStatsTZRes?.data?.flightStatsOrigin || 
                  flightViewGateInfo?.data?.flightViewDeparture || 
                  departure;
      arrival = flightStatsTZRes?.data?.flightStatsDestination || 
                flightViewGateInfo?.data?.flightViewDestination || 
                arrival;
    }

    return { departure, arrival, departureAlternate, arrivalAlternate };
  },
  
  /**
   * Fetches core flight data from multiple sources in parallel.
   * Optional: FlightAware API can be toggled via `.env` setting.
   * 
   * @param {string} flightID
   * @param {string} args.flightID - The flight identifier used for all fetches.
   * 
   * @returns {Promise<Object>} Aggregated flight data from:
   *  - ajms
   *  - flightAwareRes
   *  - flightStatsTZRes
   *  - flightViewGateInfo
   */
  getPrimaryFlightData: async (flightID) => {

    const [ajms, flightViewGateInfo, flightStatsTZRes, ] = await Promise.all([
    axios.get(`${apiUrl}/ajms/${flightID}`).catch(e => { console.error("AJMS Error:", e); return { data: {}, error: true }; }),
    axios.get(`${apiUrl}/flightStatsTZ/${flightID}`).catch(e => { console.error("FlightStatsTZ Error:", e); return { data: {}, error: true }; }),
    axios.get(`${apiUrl}/flightViewGateInfo/${flightID}`).catch(e => { console.error("FlightViewGateInfo Error:", e); return { data: {}, error: true }; }),
    ]);

    let flightAwareRes = { data: {}, error: true };

    if (import.meta.env.VITE_APP_AVOID_FLIGHT_AWARE !== "true") {
      if (import.meta.env.VITE_ENV === "dev") {console.log('Getting flightaware data. Switch it off in .env if not needed')};    // let developer know flightaware fetch is on in dev mode.
      flightAwareRes = await axios.get(`${apiUrl}/flightAware/${flightID}`).catch(e => { 
        console.error("FlightAware Error:", e); 
        return { data: {}, error: true }; 
      });
    };
    return {ajms, flightAwareRes, flightStatsTZRes, flightViewGateInfo, }
  },


  /**
   * Fetches weather and nas for airport in parallel.
   * 
   * @param {string} departure
   * @param {string} arrival
   * @param {string|null} departureAlternate
   * @param {string|null} arrivalAlternate
   * 
   * @returns {Promise<Object>} weather and nas:
   *  - nasRes, depWeatherLive, destWeatherLive, depWeatherMdb, destWeatherMdb
   */
  getWeatherAndNAS: async (airportCode) => {
    try {
      // Execute both requests in parallel
      const [weatherRes, NASRes] = await Promise.all([
        flightService.getAirportWeather(airportCode),
        flightService.getAirportNAS(airportCode),
      ]);

      return {
        weather: weatherRes,
        NAS: NASRes,
      };
    } catch (error) {
      console.error("Error in getWeatherAndNAS:", error);
      throw error;
    }
  },

  getAirportWeather: async (airportCode) => {
    try {
      const [liveWeather, mdbWeather] = await Promise.all([
        axios.get(`${apiUrl}/liveAirportWeather/${airportCode}`).catch(() => null),
        axios.get(`${apiUrl}/mdbAirportWeather/${airportCode}`).catch(() => null)
      ]);

      return {
        live: liveWeather?.data || null,
        mdb: mdbWeather?.data || null,
      };
    } catch (error) {
      console.error(`Error getting weather for ${airportCode}:`, error);
      return null;
    }
  },

  getAirportNAS: async (airportCode) => {
    try {
      const nasRes = await axios.get(`${apiUrl}/NAS/?airport=${airportCode}`)
        .catch(error => {
          console.error("NAS API Error:", error);
          return null;
        });

      return nasRes?.data || null;
    } catch (error) {
      console.error(`Error getting NAS for ${airportCode}:`, error);
      return null;
    }
  },
};

export default flightService