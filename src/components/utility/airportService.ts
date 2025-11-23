import { AirportToFetch, NASResponse, MdbWeatherData, WeatherData } from './../../types/index';
import axios from "axios";
import { CloudFog } from 'lucide-react';
import { useState, useEffect } from "react";

// Minimal, reusable weather helpers
export const isMeaningfulWeather = (weatherObj: WeatherData): boolean =>
  !!(
    weatherObj &&
    typeof weatherObj === "object" &&
    Object.keys(weatherObj).length > 0 &&
    (weatherObj as any).metar
  );

type ChooseArgs = {
  apiUrl: string;
  mdbAirportReferenceId?: string | null;
  airportCodeICAO?: string | null; // e.g., KJFK
  mdbData?: any | null;
  liveData?: any | null;
};

// Chooses live over mdb when meaningful. If live differs from mdb and we have mdbAirportReferenceId,
// it will notify backend to store fresh live weather. Returns the chosen payload (or null).
export async function chooseAirportWeatherAndMaybeUpdate({
  apiUrl,
  mdbAirportReferenceId,
  airportCodeICAO,
  mdbData,
  liveData,
}: ChooseArgs): Promise<any | null> {
  const hasLive = isMeaningfulWeather(liveData);
  const hasMdb = isMeaningfulWeather(mdbData);

  if (hasLive) {
    if (
      mdbAirportReferenceId &&
      hasMdb &&
      JSON.stringify(liveData) !== JSON.stringify(mdbData)
    ) {
      try {
        await axios.post(
          `${apiUrl}/storeLiveWeather?mdbAirportReferenceId=${mdbAirportReferenceId}&rawCode=${airportCodeICAO || ""}`
        );
      } catch (e) {
        console.error("Error notifying backend to store live weather:", e);
      }
    }
    return liveData;
  }

  if (hasMdb) return mdbData;

  return null;
}

export const airportWeatherAPI = {
  /**
   * Fetch airport weather by reference ID
   */
  getByReferenceId: async (apiUrl: string, referenceId: string): Promise<MdbWeatherData | null> => {
    if (!referenceId) {
      console.error('No reference ID provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/mdbAirportWeatherById/${referenceId}`);
      // console.log("!!MDB AIRPORT DATA received!!", response.data);
      return response.data;
    } catch (error) {
      console.error("MDB Airport Weather Error:", error);
      return null;
    }
  },

   /**
   * Fetch live airport weather by ICAO code
   */
  getLiveByAirportCode: async (apiUrl: string, airportCode: string): Promise<WeatherData | null> => {
    if (!airportCode) {
      console.error('No airport code provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/liveAirportWeather/${airportCode}`);
      return response.data;
    } catch (error) {
      console.error(`Live Weather Error for ${airportCode}:`, error);
      return null;
    }
  },


   /**
   * Fetch NAS by ICAO
   */

  getMdbByAirportCode: async (apiUrl: string, airportCode: string): Promise<WeatherData | null> => {
    if (!airportCode) {
      console.error('No airport code provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/mdbAirportWeatherByAirportCode/${airportCode}`);
      return response.data;
    } catch (error) {
      console.error(`Live Weather Error for ${airportCode}:`, error);
      return null;
    }
  },
}

export const airportNasAPI ={
  getByAirportCode: async (apiUrl: string, airportCode: string): Promise<WeatherData | null> => {
    if (!airportCode) {
      console.error('No airportCode provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/NAS?airport=${airportCode}`);
      return response.data;
    } catch (error) {
      console.error("Airport NAS Error:", error);
      return null;
    }
  }
}

interface UseAirportDataReturn {
  airportWxLive: WeatherData | null;
  airportWxMdb: WeatherData | null;
  nasResponseAirport: NASResponse;
  loadingWeather: boolean;
  LoadingNAS: boolean;
  airportError: any;
}

/**
 * Custom hook: useAirportData
 * 
 * This hook retrieves live weather and NAS (National Airspace System) data for a given airport.
 * It is especially designed for use within the Details page (or similar), enabling rapid access to airport-specific data.
 * 
 * Usage:
 *  const {
 *    airportWx,
 *    nasResponseAirport,
 *    loadingWeather,
 *    loadingNAS,
 *    airportError
 *  } = useAirportData(airportsToFetch, apiUrl);
 * 
 * Parameters:
 *   airportsToFetch: Array of AirportToFetch objects - each object can include:
 *     - key: a string (e.g., "airport", "departure", etc.)
 *     - ICAOairportCode: the airport identifier (ICAO, e.g., "KBOS") or null.
 *     - referenceId: optional backend referenceId for the airport.
 *   apiUrl: string - base url for API requests (usually from .env).
 * 
 * Return value:
 *   {
 *     airportWx: WeatherData | null; // Live weather for the first (or specified) airport
 *     nasResponseAirport: NASResponse | null; // NAS information object for the airport
 *     loadingWeather: boolean;
 *     loadingNAS: boolean;
 *     airportError: any;
 *   }
 * 
 * Notes:
 * - The hook currently fetches data only for the first airport in the `airportsToFetch` array.
 *   This matches the Details page's logic for single-airport and airport search views.
 * - Handles both real requests and, if VITE_APP_TEST_FLIGHT_DATA === "true", returns test data from a mock endpoint.
 * - Callers should pass an array with a single well-formed AirportToFetch object to get accurate data.
 * - Intended for use (primarily) when searchValue?.type === "airport" (in Details.tsx), but can be reused wherever
 *   rapid single-airport data lookup is needed.
 * 
 * Example searchValue (from Details.tsx):
 *   searchValue = {
 *     type: "airport",
 *     value: "JFK",
 *     label: "JFK",
 *     id: "...",
 *     referenceId: "...",
 *     ...
 *   }
 * airportsToFetchForDetails = [{
 *     key: "airport",
 *     ICAOairportCode: searchValue.label || null,
 *     referenceId: searchValue.referenceId || null
 * }]
 */

const useAirportData = (
  airportToFetch: AirportToFetch | null,
  apiUrl: string
): UseAirportDataReturn => {
  const [airportWxLive, setAirportWxLive] = useState<WeatherData | null>(null);
  const [airportWxMdb, setAirportWxMdb] = useState<WeatherData | null>(null);
  const [nasResponseAirport, setNasResponseAirport] =
    useState<NASResponse | null>(null);
  const [loadingNAS, setLoadingNAS] = useState<boolean>(false);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [airportError, setAirportError] = useState<any>(null);

  useEffect(() => {
    // Only proceed if we have airports to fetch
    // console.log("airportToFetch in useAirportData", airportToFetch);
    if (!airportToFetch) {
      return;
    }
    // Reset states for a new airport search
    setAirportWxLive(null);
    setAirportWxMdb(null);
    setNasResponseAirport(null);
    setAirportError(null);

    const fetchAirportData = async () => {
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          const res = await axios.get(
            `${apiUrl}/testDataReturns?airportLookup=KBOS`
          );
          setLoadingWeather(true);
          console.log("!!TEST AIRPROT DATA!!", res.data);
          setAirportWx(res.data.weather);
          setLoadingWeather(false);

          setLoadingNAS(true);
          setNasResponseAirport(res.data.NAS);
          setLoadingNAS(false);

          // If test data needs to provide airportWx or gateData, it should be set here too.
          // e.g., setAirportWx(res.data.airportWx) // This would override the hook for test mode.
        } else {
          // Initialize variables
          // console.log("airportsToFetch in useAirportData", airportsToFetch);
          // Defensive: check first airport object in the array
          // If the string length is more than 4, treat as referenceId, otherwise as ICAO code
          const airportInput =
            typeof airportToFetch === "string"
              ? { referenceId: airportToFetch, ICAOairportCode: airportToFetch }
              : airportToFetch;

          const mdbAirportReferenceId =
            airportInput && typeof airportInput === "object"
              ? airportInput.referenceId || null
              : null;

          let ICAOformattedAirportCode =
            airportInput && typeof airportInput === "object"
              ? airportInput.ICAOairportCode || null
              : typeof airportToFetch === "string" &&
                airportToFetch.length === 4
              ? airportToFetch
              : null;

          // console.log("mdbAirportReferenceId for airportToFetch", mdbAirportReferenceId);
          let mdbAirportWeather = null;

          // NOTE: Temporary disabled - need to revisit this to use referenceId throught suggestions 
          // Get instant airport weather from database if available - could be old data
          // if (mdbAirportReferenceId) {
          //   setLoadingWeather(true);
            
          //   let fetchedMdbWeather: MdbWeatherData | null = await airportWeatherAPI.getByReferenceId(apiUrl, mdbAirportReferenceId);
          //   console.log("fetchedMdbWeather", fetchedMdbWeather?.weather);

          //   // Process the airport weather data if it exists and is not null
          //   if (fetchedMdbWeather && fetchedMdbWeather.weather) {
          //     console.log('airportWx set to', airportWx);
          //     setAirportWx(fetchedMdbWeather.weather);
          //     console.log('airportWx  updated to', airportWx);

          //     // Assign code for live weather fetching.
          //     mdbAirportWeather = fetchedMdbWeather.weather;
          //     ICAOformattedAirportCode = fetchedMdbWeather.metadata.ICAO;
          //     // Format the airport code for the API calls
          //     // Store both the original code and the formatted code
          //   } else {
          //     console.error(
          //       "Impossible error -- mdb data for weather not found"
          //     );
          //     // Fallback to ICAO code from airportToFetch if MDB fetch failed
          //   }
          // }

          // Fetch Live data w ICAO airport code -- Use either mdb code or raw code through searchValue.airport - ICAO format accounted and pre-processed for.
          if (ICAOformattedAirportCode) {
            // TODO: if the ICAO code is comging from flightData then 
            setLoadingWeather(true);
            let mdbAirportWeatherUsingICAO = await airportWeatherAPI.getMdbByAirportCode(apiUrl, ICAOformattedAirportCode) as MdbWeatherData | null;
            console.log("mdbAirportWeatherUsingICAO", mdbAirportWeatherUsingICAO?.weather);

            setAirportWxMdb(mdbAirportWeatherUsingICAO?.weather as WeatherData);
            setLoadingWeather(false);

            // console.log("ICAOformattedAirportCode", ICAOformattedAirportCode);
            // setLoadingWeather(true);
            // setLoadingNAS(true);
            const nasRes: WeatherData | null = await airportNasAPI.getByAirportCode(apiUrl, ICAOformattedAirportCode);
            let liveAirportWeather: WeatherData | null = await airportWeatherAPI.getLiveByAirportCode(apiUrl, ICAOformattedAirportCode);
            setLoadingWeather(false);
            // setLoadingNAS(false);
            // console.log("nasRes", nasRes);
            // console.log("liveAirportWeather", liveAirportWeather);
            // Note: Nidhi: This live weather needs to be compared with mdb weather and if 
              // different, update the state with the live weather and ALSO Store the live weather in the database - see above function 
              // `${apiUrl}/storeLiveWeather?mdbAirportReferenceId=${mdbAirportReferenceId}&rawCode=${airportCodeICAO || ""}`
            // return;
            if (nasRes) {
              setNasResponseAirport(nasRes);
              setLoadingNAS(false);
            }
            // return

            // --- FIX: REVISED LOGIC TO HANDLE POTENTIALLY EMPTY WEATHER DATA ---
            const liveData = liveAirportWeather;
            const mdbData =
              mdbAirportWeather ?? mdbAirportWeatherUsingICAO?.weather ?? null;
            // Helper to check for meaningful weather data (must not be an empty object and should have a METAR).
            const isMeaningful = (weatherObj: any): boolean =>
              weatherObj &&
              Object.keys(weatherObj).length > 0 &&
              weatherObj.metar;

            if (isMeaningful(liveData)) {
              console.log("!!! SUCCESSFUL LIVE DATA FETCH  and state updated!!!");
              setAirportWxLive(liveData);
              // If live data is different from MDB data, trigger a backend update.
              if (
                mdbAirportReferenceId &&
                JSON.stringify(liveData) !== JSON.stringify(mdbData)
              ) {
                await axios
                  .post(
                    `${apiUrl}/storeLiveWeather?mdbAirportReferenceId=${mdbAirportReferenceId}&rawCode=${ICAOformattedAirportCode}`
                  )
                  .catch(e => {
                    console.error(
                      "Error sending airport code/mdbAirportReferenceId to backend for fresh data fetch and store:",
                      e
                    );
                  });
              }
            } else if (isMeaningful(mdbData)) {
              console.log("mdbData is meaningful", mdbData);
              setAirportWxMdb(mdbData);
            } else {
              console.log("no data from any source is meaningful, setting state to null");
              setAirportWxLive(null);
              setAirportWxMdb(null);
            }

            // Finally, set loading to false.
            setLoadingWeather(false);
          } else {
            // FIX: If there's no airport code to search with, ensure state is null.
            console.log("no airport code to search with, setting state to null");
            setAirportWxLive(null);
            setAirportWxMdb(null);
            setLoadingWeather(false);
          }
        }
      } catch (e) {
        console.error("Error in fetchAirportData:", e);
        setAirportError(e);
        let errorSummary: string;
        if (e instanceof Error) {
          errorSummary = `${e.name}: ${e.message}`;
        } else if (typeof e === "string") {
          errorSummary = e;
        } else {
          try {
            errorSummary = JSON.stringify(e);
          } catch {
            errorSummary = "Unserializable error payload";
          }
        }
        // flightService
        //   .postNotifications(
        //     `AirportData absolute error\nAirport: ${airportIdentifier}\nDetails: ${errorSummary}`
        //   )
        //   .catch(notificationError => {
        //     console.error(
        //       "Failed to send absolute error notification:",
        //       notificationError
        //     );
        //   });
      } finally {
        // Loading state is already set in the individual branches above
      }
    };

    fetchAirportData();
  }, [airportToFetch, apiUrl]); // Effect dependencies

  return {
    airportWxLive,
    airportWxMdb,
    nasResponseAirport: nasResponseAirport ?? {},
    loadingWeather,
    LoadingNAS: loadingNAS,
    airportError,
  };
};

export default useAirportData;