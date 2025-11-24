// utils/flightDataUtils.ts
// services/flightService.ts
import axios, { AxiosResponse } from "axios";
import { SearchValue, WeatherData } from "../../types";

const apiUrl = import.meta.env.VITE_API_URL;

interface AirportData {
  departure: string | null;
  arrival: string | null;
  departureAlternate: string | null;
  arrivalAlternate: string | null;
}

interface AJMSData {
  data?: {
    departure?: string;
    arrival?: string;
    departureAlternate?: string;
    arrivalAlternate?: string;
  };
}

interface FlightAwareData {
  data: {
    fa_origin?: string;
    fa_destination?: string;
  };
  error?: boolean;
}

interface FlightStatsTZData {
  data?: {
    flightStatsOrigin?: string;
    flightStatsDestination?: string;
  };
}

interface GetAirportsParams {
  ajms: AJMSData;
  flightAwareRes: FlightAwareData;
  flightStatsTZRes: FlightStatsTZData;
}

interface WeatherDataCollective {
  live: WeatherData;
  mdb: WeatherData;
}

interface WeatherAndNASResult {
  weather: WeatherDataCollective | null;
  NAS: any;
}

interface EDCTResult {
  EDCTRes: AxiosResponse | null;
}

interface EDCTParams {
  flightID: string;
  origin: string | null;
  destination: string | null;
}

interface PrimaryFlightData {
  rawAJMS: any;
  flightAwareRes: any;
  flightStatsTZRes: any;
}

const flightService = {
  /**
   * Extracts airports from multiple flight data sources.
   * Priority: AJMS > FlightAware > FlightStats.
   *
   * @param {Object} sources.ajms - Data from AJMS API.
   * @param {Object} sources.flightAwareRes - Data from FlightAware API.
   * @param {Object} sources.flightStatsTZRes - Data from FlightStats API.
   *
   * @returns {Object} airports - Identified airport data:
   *  - {string|null} departure
   *  - {string|null} arrival
   *  - {string|null} departureAlternate
   *  - {string|null} arrivalAlternate
   *
   * @note Inconsistencies between sources are possible due to data timing, icao/iata, weather, or vendor coverage.
   */
  getAirports: ({
    ajms,
    flightAwareRes,
    flightStatsTZRes,
  }: GetAirportsParams): AirportData => {
    let departure = null;
    let arrival = null;
    let departureAlternate = null;
    let arrivalAlternate = null;

    // TODO VHP: mismatch for when one flight number has multiple flights back and forth.
    if (ajms?.data) {
      departure = ajms.data.departure || null;
      arrival = ajms.data.arrival || null;
      departureAlternate = ajms.data.departureAlternate || null;
      arrivalAlternate = ajms.data.arrivalAlternate || null;
    }

    // DONE: compare departure and arrival from different sources for absolute verification!
    // This validation is a precautionary measure. It is primarily handled by ValidateAiportData in details for detecting and resolving discrepancies between JMS and flightAware.
    if (
      flightAwareRes &&
      !flightAwareRes.error &&
      Object.keys(flightAwareRes.data).length > 0
    ) {
      // If AJMS data exists but differs from FlightAware, prefer FlightAware
      if (
        ajms?.data &&
        (departure !== flightAwareRes.data.fa_origin ||
          arrival !== flightAwareRes.data.fa_destination)
      ) {
        flightService.postNotifications(
          `Airport Discrepancy: \n**ajms** ${JSON.stringify(
            ajms.data
          )} \n**flightAware** ${JSON.stringify(
            flightAwareRes.data
          )} \n\n **flightStatsTZRes** ${JSON.stringify(flightStatsTZRes.data)}`
        );
        departure = flightAwareRes.data.fa_origin;
        arrival = flightAwareRes.data.fa_destination;
      }
      // Fallback: if no AJMS data or missing departure/arrival
      else if (!departure || !arrival) {
        departure = flightAwareRes.data.fa_origin || departure;
        arrival = flightAwareRes.data.fa_destination || arrival;
      }
    }

    // TODO TEST: final comparison for accuracy but flightStats returns IATA airport code instead of ICAO.
    // TODO VHP: Maybe consider validating the IATA from the backend itself and return associated ICAO? - will be so much cleaner
    if (!departure || !arrival) {
      departure = flightStatsTZRes?.data?.flightStatsOrigin || departure;
      arrival = flightStatsTZRes?.data?.flightStatsDestination || arrival;
    }

    return {
      departure: departure || null,
      arrival: arrival || null,
      departureAlternate: departureAlternate || null,
      arrivalAlternate: arrivalAlternate || null,
    };
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
   */
  getPrimaryFlightData: async (
    searchValue: SearchValue
  ): Promise<PrimaryFlightData> => {
    // # TODO: To fetch test jms - need to completely redesign ajms response architecture since current setup is inefficient
    // Current setup requests ajms from bakend which is inefficient but secure since it abstracts away the source ajms and proxies it from backend?
    const ICAOFlightID = searchValue?.type === "flight" ? (searchValue?.metadata as any)?.ICAOFlightID : null;
    const IATAFlightID = searchValue?.type === "flight" ? (searchValue?.metadata as any)?.IATAFlightID : null;
    const [rawAJMS, flightStatsTZRes] = await Promise.all([
      axios.get(`${apiUrl}/ajms/${ICAOFlightID}`).catch(e => {
        console.error("AJMS Error:", e);
        return { data: {}, error: true };
      }),
      axios.get(`${apiUrl}/flightStatsTZ/${IATAFlightID}`).catch(e => {
        console.error("FlightStatsTZ Error:", e);
        return { data: {}, error: true };
      }),
    ]);

    let flightAwareRes:
      | AxiosResponse
      | { data: Record<string, unknown>; error: boolean } = {
      data: {},
      error: true,
    };

    if (import.meta.env.VITE_APP_AVOID_FLIGHT_AWARE !== "true") {
      // Note for dev guys using flightaware -- dont use it if you dont need.
      if (import.meta.env.VITE_ENV === "dev") {
        console.log(
          "Getting flightaware data. Switch it off in .env if not needed"
        );
      } // let developer know flightaware fetch is on in dev mode.
      flightAwareRes = await axios
        .get(`${apiUrl}/flightAware/${IATAFlightID}`)
        .catch(e => {
          console.error("FlightAware Error:", e);
          return { data: {}, error: true };
        });
    }

    return { rawAJMS, flightAwareRes, flightStatsTZRes };
  },

  /**
   * Fetches EDCT in parallel.
   *
   * @param {string} flightID
   * @param {string|null} origin
   * @param {string|null} destination
   *
   * @returns {Promise<Array>}
   *  - list/array of edct items
   *  -- filedDepartureTime, edct, controlElement, flightCancelled
   */
  getEDCT: async ({
    flightID,
    origin,
    destination,
  }: EDCTParams): Promise<EDCTResult> => {
    try {
      // Execute both requests in parallel
      const [EDCTRes] = await Promise.all([
        axios
          .get(
            `${apiUrl}/EDCTLookup/${flightID}?origin=${origin}&destination=${destination}`
          )
          .catch(() => null),
      ]);

      return {
        EDCTRes,
      };
    } catch (error) {
      console.error("Error in getWeatherAndNAS:", error);
      throw error;
    }
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
  getWeatherAndNAS: async (
    airportCode: string
  ): Promise<WeatherAndNASResult> => {
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

  getAirportWeather: async (
    airportCode: string
  ): Promise<WeatherDataCollective | null> => {
    try {
      const [liveWeather, mdbWeather] = await Promise.all([
        axios
          .get(`${apiUrl}/liveAirportWeather/${airportCode}`)
          .catch(() => null),
        axios
          .get(`${apiUrl}/mdbAirportWeather/${airportCode}`)
          .catch(() => null),
      
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

  getAirportNAS: async (airportCode: string): Promise<any> => {
    try {
      const nasRes = await axios
        .get(`${apiUrl}/NAS?airport=${airportCode}`)
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

  // TODO: Obviously This doesnt belong here -- move to notification api folder.
  //  Move all api to api folder other than flightservice.
  postNotifications: async (message: string): Promise<boolean | null> => {
    try {
      await axios.post(
        `${apiUrl}/sendTelegramNotification?message=${encodeURIComponent(
          message
        )}`
      );
      return true;
    } catch (error) {
      console.error("Notification API Error:", error);
      return null;
    }
  },
};

export default flightService;
