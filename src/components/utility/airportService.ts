import axios from "axios";
import { useState, useEffect } from "react";
import flightService from "./flightService";
import { NASResponse, SearchValue, WeatherData } from "../../types";

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
  getByReferenceId: async (apiUrl: string, referenceId: string): Promise<WeatherData | null> => {
    if (!referenceId) {
      console.error('No reference ID provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/mdbAirportWeatherById/${referenceId}`);
      // console.log("!!MDB AIRPORT DATA received!!", response.data);
      isMeaningfulWeather(response.data)
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
      const response = await axios.get(`${apiUrl}/liveAirportWeather/${airportCode}`);
      return response.data;
    } catch (error) {
      console.error(`Live Weather Error for ${airportCode}:`, error);
      return null;
    }
  },
}

interface UseAirportDataReturn {
  airportWx: WeatherData | null;
  nasResponseAirport: NASResponse;
  loadingWeather: boolean;
  LoadingNAS: boolean;
  airportError: any;
}


const useAirportData = (
  searchValue: SearchValue | null,
  apiUrl: string
): UseAirportDataReturn => {
  const [airportWx, setAirportWx] = useState<WeatherData | null>(null);
  const [nasResponseAirport, setNasResponseAirport] =
    useState<NASResponse | null>(null);
  const [loadingNAS, setLoadingNAS] = useState<boolean>(false);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [airportError, setAirportError] = useState<any>(null);

  useEffect(() => {
    // Only proceed if it's an airport search
    if (searchValue?.type !== "airport") {
      return;
    }
    // Reset states for a new airport search
    setAirportWx(null);
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
          let mdbAirportReferenceId = null;
          let mdbAirportCode = null;
          let ICAOformattedAirportCode = null;
          // @ts-expect-error - unused variable
          const _rawAirportCode = null;
          // Get instant airport weather from database if availbale - could be old data
          if (searchValue.referenceId) {
            mdbAirportReferenceId = searchValue.referenceId;
            setLoadingWeather(true);
            
            let mdbAirportWeather: WeatherData | null = await airportWeatherAPI.getByReferenceId(apiUrl, mdbAirportReferenceId);

            // Process the airport weather data if it exists and is not null
            if (mdbAirportWeather && (mdbAirportWeather as any).weather) {
              setAirportWx((mdbAirportWeather as any).weather);
              setLoadingWeather(false);
              // Assign code for live weather fetching.
              mdbAirportCode = (mdbAirportWeather as any).ICAO;
              // Format the airport code for the API calls
              // Store both the original code and the formatted code
              ICAOformattedAirportCode = mdbAirportCode; // if its international code its 4 chars but if its 3 char...
              if (mdbAirportCode && mdbAirportCode.length === 3) {
                // This if block only serves the purpose of converting IATA to ICAO in a bad way.
              console.log("!!MDB AIRPROT DATA received!!", mdbAirportCode, (mdbAirportWeather as any).ICAO);
                let USIATAairportCode = null;
                USIATAairportCode = mdbAirportCode;
                ICAOformattedAirportCode = `K${USIATAairportCode}`;     // TODO VHP: bad man! resolve asap!
              }
            } else {
              console.error(
                "Impossible error -- mdb data for weather not found"
              );
            }
          } else if (searchValue.label) {
            setLoadingWeather(true);
            ICAOformattedAirportCode = searchValue.label;
          }

          // Fetch Live data w ICAO airport code -- Use either mdb code or raw code through searchValue.airport - ICAO format accounted and pre-processed for.
          if (ICAOformattedAirportCode) {
            const [nasRes, liveAirportWeather] = await Promise.all([
              // Use the formatted code for NAS API
              axios
                .get(`${apiUrl}/NAS?airport=${ICAOformattedAirportCode}`)
                .catch(e => {
                  console.error("NAS Error:", e);
                  return { data: null };
                }),

              // Use the formatted code for live weather API
              axios
                .get(`${apiUrl}/liveAirportWeather/${ICAOformattedAirportCode}`)
                .catch(e => {
                  console.error("liveWeather fetch error:", e);
                  return { data: null };
                }),
            ]);

            if (nasRes.data) {
              setNasResponseAirport(nasRes.data);
              setLoadingNAS(false);
            }

            // --- FIX: REVISED LOGIC TO HANDLE POTENTIALLY EMPTY WEATHER DATA ---
            const liveData = liveAirportWeather.data;
            const mdbData = mdbAirportWeather?.data;
            // Helper to check for meaningful weather data (must not be an empty object and should have a METAR).
            const isMeaningful = (weatherObj: any): boolean =>
              weatherObj &&
              Object.keys(weatherObj).length > 0 &&
              weatherObj.metar;

            // Priority 1: Use live data if it's meaningful.
            if (isMeaningful(liveData)) {
              console.log(
                "!!! SUCCESSFUL LIVE DATA FETCH  and state updated!!!"
              );
              setAirportWx(liveData);

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
            }
            // Priority 2: Fallback to database data if it's meaningful and live data was not.
            else if (isMeaningful(mdbData)) {
              setAirportWx(mdbData);
            }
            // Priority 3: If no data from any source is meaningful, set state to null.
            else {
              setAirportWx(null);
            }
            // Finally, set loading to false.
            setLoadingWeather(false);
          } else {
            // FIX: If there's no airport code to search with, ensure state is null.
            setAirportWx(null);
            setLoadingWeather(false);
          }
        }
      } catch (e) {
        console.error("Error in fetchAirportData:", e);
        setAirportError(e);
        const airportIdentifier =
          searchValue?.label || searchValue?.referenceId|| "unknown airport";
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
  }, [searchValue, apiUrl]); // Effect dependencies

  return {
    airportWx,
    nasResponseAirport: nasResponseAirport ?? {},
    loadingWeather,
    LoadingNAS: loadingNAS,
    airportError,
  };
};

export default useAirportData;