import { useState, useEffect } from "react";
import axios from "axios";
import flightService from "./utility/flightService";
import { NASResponse, SearchValue, WeatherData } from "../types";

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
          let mdbAirportId = null;
          let mdbAirportCode = null;
          let ICAOformattedAirportCode = null;
          let mdbAirportWeather = null;
          // @ts-expect-error - unused variable
          const _rawAirportCode = null;
          // Get instant airport weather from database if availbale - could be old data
          if (searchValue.r_id) {
            mdbAirportId = searchValue.r_id;
            setLoadingWeather(true);
            mdbAirportWeather = await axios
              .get(`${apiUrl}/mdbAirportWeather/${mdbAirportId}`)
              .catch(e => {
                console.error("mdb Error:", e);
                return { data: null };
              });
            // Process the airport weather data if it exists
            if (mdbAirportWeather.data) {
              // FIX: We no longer set state here immediately. We wait to compare it with live data.
              console.log("!!MDB AIRPROT DATA received!!");
              setAirportWx(mdbAirportWeather.data);
              setLoadingWeather(false);
              // Assign code for live weather fetching.
              mdbAirportCode = mdbAirportWeather.data.code;
              // Format the airport code for the API calls
              // Store both the original code and the formatted code
              ICAOformattedAirportCode = mdbAirportCode; // if its international code its 4 chars but if its 3 char...
              if (mdbAirportCode && mdbAirportCode.length === 3) {
                let USIATAairportCode = null;
                USIATAairportCode = mdbAirportCode;
                ICAOformattedAirportCode = `K${USIATAairportCode}`;
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
                mdbAirportId &&
                JSON.stringify(liveData) !== JSON.stringify(mdbData)
              ) {
                await axios
                  .post(
                    `${apiUrl}/storeLiveWeather?mdbId=${mdbAirportId}&rawCode=${ICAOformattedAirportCode}`
                  )
                  .catch(e => {
                    console.error(
                      "Error sending airport code/mdbID to backend for fresh data fetch and store:",
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
          searchValue?.label || searchValue?.r_id || "unknown airport";
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
        flightService
          .postNotifications(
            `AirportData absolute error\nAirport: ${airportIdentifier}\nDetails: ${errorSummary}`
          )
          .catch(notificationError => {
            console.error(
              "Failed to send absolute error notification:",
              notificationError
            );
          });
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
