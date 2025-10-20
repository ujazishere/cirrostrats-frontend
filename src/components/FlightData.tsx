// ✅ NEW FILE: This file contains the refactored custom hook for fetching flight data.
// By isolating this logic, we make the Details.jsx component cleaner and the flight data logic reusable.

import { useState, useEffect } from "react";
import axios from "axios"; // A promise-based HTTP client for making requests to our backend API.
import flightService from './utility/flightService'; // A service module with helper functions for flight data retrieval.
type FlightService = typeof flightService;
import { EDCTData, NASData, SearchValue, WeatherData } from "../types";

// =================================================================================
// Configuration
// =================================================================================
// Retrieve the API's base URL from environment variables. This is a best practice for security and configuration management.
const apiUrl = import.meta.env.VITE_API_URL;


// =================================================================================
// Helper Function
// This function was moved from Details.jsx along with the hook.
// =================================================================================
function normalizeAjms(ajms: any): { data: any;error?:any } {
  // TODO: *** CAUTION DO NOT REMOVE THIS NORMALIZATION STEP ***
    // *** Error prone such that it may return jumbled data from various dates. 
    // This is a temporary fix to normalize ajms data until we can fix the backend to return consistent data.
  const result: any = {};

  for (const [key, val] of Object.entries(ajms)) {
    if (val && typeof val === "object" && "value" in val) {
      // case: { timestamp, value }
      result[key] = (val as any).value;
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

type FlightState = {
  loadingFlight: boolean,      // For the main flight data
  loadingEdct: boolean,        // For the EDCT section
  loadingWeatherNas: boolean,  // For Weather and NAS tabs
  // loading: boolean;
  data: any;
  weather: WeatherData | null;
  nas: NASData | null;
  edct: EDCTData | null;
  error: string | null;
};

// =================================================================================
// CUSTOM HOOK for fetching Flight Data
// This hook is responsible for all logic related to fetching flight, weather, NAS, and EDCT data.
// =================================================================================
// flightdata.jsx: line 76
const useFlightData = (searchValue: SearchValue | null) => {
  // We manage all related states within a single object. This simplifies state updates and reduces re-renders.
  // REFACTORED: State now has granular loading flags for each data piece.
  const [flightState, setFlightState] = useState<FlightState>({
    loadingFlight: true,
    loadingEdct: true,
    loadingWeatherNas: true,
    data: null,
    weather: null,
    nas: null,
    edct: null,
    error: null,
  });

  // This `useEffect` hook triggers the data fetching logic whenever the `searchValue` changes.
  useEffect(() => {
    // First, we perform a guard check. If the search type isn't for a flight, we reset the state and do nothing further.
    // This prevents the hook from running unnecessarily.
    if (searchValue?.type !== "flight" && searchValue?.type !== "N-Number") {
      setFlightState({
        loadingFlight: false,
        loadingEdct: false,
        loadingWeatherNas: false,
        data: null,
        weather: null,
        nas: null,
        edct: null,
        error: null,
      }); // Reset state to default.
      return; // Exit the effect.
    }

    // Define an async function to handle the entire flight data fetching process.
  const fetchFlightData = async () => {
      // On new search, reset all states and set all loaders to true.
      setFlightState({
        loadingFlight: true,
        loadingEdct: true,
        loadingWeatherNas: true,
        data: null,
        weather: null,
        nas: null,
        edct: null,
        error: null,
      });
      
           // Check for a specific environment variable to use mock/test data. This is invaluable for development and testing without hitting live APIs.
      if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
        try {
          // Fetch the test data from a dedicated endpoint.
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          console.log("!!TEST FLIGHT DATA!!", res.data); // Log that we are using test data.
          // Populate the state with the mock data.
          setFlightState({
            loadingFlight: false,
            loadingEdct: false,
            loadingWeatherNas: false,
            data: res.data.flightData || res.data,
            weather: res.data.weather || res.data,
            nas: res.data.NAS || res.data,
            edct: res.data.EDCT || res.data,
            error: null,
          });
        } catch (e) {
          console.error("Test Data Error:", e); // Log any errors fetching test data.
          // Set an error state if the mock data fetch fails.
          setFlightState({
            loadingFlight: false,
            loadingEdct: false,
            loadingWeatherNas: false,
            data: null,
            weather: null,
            nas: null,
            edct: null,
            error: "Failed to load test data.",
          });
        }
        return; // Exit after handling test data.
      }

      // Extract the flight identifier from the `searchValue` object. It can be one of several properties.
      const flightID =
        searchValue?.flightID || searchValue?.nnumber || searchValue?.value;

      // If no valid flightID can be found, we can't proceed. Set an error and stop.
      if (!flightID) {
        setFlightState((s: FlightState) => ({ 
          ...s, 
          error: "Invalid Flight ID", 
          loadingFlight: false, 
          loadingEdct: false, 
          loadingWeatherNas: false 
        }));
        return;
      }

      // This `try...catch` block handles potential errors during the multi-step API fetch process.
      try {
        // --- STEP 1: Fetch and display PRIMARY flight data immediately ---
        const { rawAJMS, flightAwareRes, flightStatsTZRes } =
          await flightService.getPrimaryFlightData(flightID);

        // --- STEP 1.5: Validate AJMS data against FlightAware - *___ nullify JMS if discrepancy found ___*
        // TODO VHP: This is a temporary fix to catch AJMS data route discrepancies w flightAware.
          // This does not resolve the root cause of airport discrepancies but at least prevents displaying incorrect data.
          // Introduces a new problem - flightAware showing up data for tomorrows flighs, once the scheduled time passes vs flightStats showing today flights throughout the day.
          // Discrepancy fixes needed across all 3 sources- airport, datetime, multiple legs --> 
        function validateAirportData(
          ajmsData: { data: { departure: string; arrival: string } },
          flightAwareRes: {
            data: { fa_origin: string; fa_destination: string };
            error: boolean;
          },
          flightService: FlightService
        ) {
          // If no AJMS data or no FlightAware data, return as-is
          if (!ajmsData?.data || !flightAwareRes?.data || flightAwareRes.error) {
            return ajmsData;
          }
          
          const ajmsDeparture = ajmsData.data.departure;
          const ajmsArrival = ajmsData.data.arrival;
          const faOrigin = flightAwareRes.data.fa_origin;
          const faDestination = flightAwareRes.data.fa_destination;
          
          // Check for discrepancy
          if (
            (ajmsDeparture && faOrigin && ajmsDeparture !== faOrigin) ||
            (ajmsArrival && faDestination && ajmsArrival !== faDestination)
          ) {
            // Log the discrepancy
            flightService.postNotifications(
              `Airport Discrepancy: \n**ajms** ${JSON.stringify(
                ajmsData.data
              )} \n**flightAware** ${JSON.stringify(flightAwareRes.data)}`
            );
            
            // TODO VHP:  what if there is a discrepancy between flightStats and the resolved JMS/flightAware?
            // Return nullified AJMS data (mark as faulty)
            return { ...ajmsData, data: null, error: 'Airport discrepancy detected' };
          }
          
          // No discrepancy, return original
          return ajmsData;
        }
        
        // Validate before normalization
        const validatedAJMS = validateAirportData(rawAJMS, flightAwareRes, flightService);
        
        // TODO: *** CAUTION DO NOT REMOVE THIS NORMALIZATION STEP ***
        // *** Error prone such that it may return jumbled data from various dates. 
        // This is a temporary fix to normalize ajms data until we can fix the backend to return consistent data.
        // Fix JMS data structure issues at source trace it back from /ajms route's caution note
        // Normalize AJMS data to ensure consistent structure.
        const ajms = normalizeAjms(validatedAJMS.data || {});
        

        // --- STEP 2: Extract airport identifiers (departure, arrival, alternates) from the aggregated primary data.
        const {
          departure, arrival, departureAlternate, arrivalAlternate
        } = flightService.getAirports({ ajms, flightAwareRes, flightStatsTZRes});
        
        // Newer code:
        // If core data sources fail, we can't build a complete picture. Set an error and exit.
        if ((ajms as any).error && (flightAwareRes as any).error) {
          setFlightState({
            loadingFlight: false,
            loadingEdct: false,
            loadingWeatherNas: false,
            data: null,
            weather: null,
            nas: null,
            edct: null,
            error: `Could not retrieve data for flight ${flightID}.`,
          });
          return;
        }
        // Older code:
        // if (ajms.error && flightAwareRes.error) throw new Error(`Could not retrieve JMS or FlightAware data for flight ${flightID}.`);
        
        // TODO VHP: airport descrepency handling -
            // Wouldn't this nullify airport validation since were re-introducing all sources again here?
            // The whole idea of departure/arrival resolution was to pick the most reliable source among all 3.
            // But then this re-introduces airport discrepancy by bringing back all 3 sources which has the root departure/arrival as is. 

        // --- STEP 3: Merge all the fetched data into a single, comprehensive object for the flight. ---
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
            loadingFlight: false,
            loadingEdct: false,
            loadingWeatherNas: false,
            data: null, // Set data to null to trigger the "no data" message
            weather: null,
            nas: null,
            edct: null,
            error: `Could not retrieve data for flight ${flightID}.`,
          });
          return;
        }

        // --- STEP 3.5: FIRST RENDER - Update state with PRIMARY flight data immediately ---
        // This renders the SummaryTable(not the route panel?).
        setFlightState((prevState: FlightState)=> ({
          ...prevState,
          data: combinedFlightData,
          loadingFlight: false, // Turn off the main loader
        }));

        // --- STEP 3: Fetch SECONDARY data in the background ---
        // Step 4: Conditionally fetch EDCT data based on an environment flag. This allows turning the feature on/off easily.
        // Fetch EDCT data asynchronously
        if (import.meta.env.VITE_EDCT_FETCH === "1" && departure && arrival) {
          // Log in development mode to remind developers this potentially costly fetch is active.
          if (import.meta.env.VITE_ENV === "dev") {
            console.warn(
              "Getting EDCT data. Switch it off in .env if not needed"
            );
          }
          flightService.getEDCT({ 
            flightID, 
            origin: departure.slice(1), 
            destination: arrival.slice(1) 
          })
            .then(({ EDCTRes }: { EDCTRes: {data: EDCTData} }) => {
              setFlightState((prevState: FlightState)=> ({ 
                ...prevState, 
                edct: EDCTRes?.data, 
                loadingEdct: false 
              }));
            })
            .catch((error: Error) => {
              console.error("Failed to fetch EDCT data:", error);
              setFlightState((prevState: FlightState)=> ({ 
                ...prevState, 
                loadingEdct: false 
              }));
            });
        } else {
          setFlightState((prevState: FlightState)=> ({ 
            ...prevState, 
            loadingEdct: false 
          }));
        }

        // Fetch Weather and NAS data asynchronously
        const airportsToFetch = [
          { key: "departure", code: departure },
          { key: "arrival", code: arrival },
          { key: "departureAlternate", code: departureAlternate },
          { key: "arrivalAlternate", code: arrivalAlternate },
        ].filter(item => item.code); // The `.filter` is crucial here.

        // Only proceed if we have at least one valid airport code.
        if (airportsToFetch.length > 0) {
          // Create an array of promises for all the data fetches.
          const requests = airportsToFetch.map(airport =>
            flightService.getWeatherAndNAS(airport.code || "")
          );
          // Use `Promise.all` to execute all these requests in parallel, which is much more efficient than sequential requests.
          Promise.all(requests).then((results: any[]) => {
            const finalWeather: { [key: string]: any } = {};
            const finalNas: { [key: string]: any } = {};
              
            results.forEach((result, index) => {
              const airportKey = airportsToFetch[index].key; // Get the original key ('departure', 'arrival', etc.).
              // Structure the weather and NAS data into a clean, keyed object.
              finalWeather[`${airportKey}WeatherMdb`] = result?.weather?.mdb || null;
              finalWeather[`${airportKey}WeatherLive`] = result?.weather?.live || null;
              finalNas[`${airportKey}NAS`] = result?.NAS || null;
            });
          
            setFlightState((prevState: FlightState) => ({ 
                ...prevState, 
                weather: finalWeather, 
                nas: finalNas, 
                loadingWeatherNas: false 
              }));
            }).catch((error: Error) => {
              console.error("Failed to fetch weather/NAS data:", error);
              setFlightState((prevState: FlightState) => ({ 
                ...prevState, 
                loadingWeatherNas: false 
              }));
            });
            } else {
              setFlightState((prevState: FlightState) => ({ 
                ...prevState, 
                loadingWeatherNas: false 
            }));
            };
        //     setFlightState(prevState => ({ ...prevState, weather: finalWeather, nas: finalNas, loadingWeatherNas: false }));
        //   }).catch(() => setFlightState(prevState => ({ ...prevState, loadingWeatherNas: false })));
        // } else {
        //   setFlightState(prevState => ({ ...prevState, loadingWeatherNas: false }));
        // }

      } catch (e) {
        console.error("Error fetching primary flight details:", e);
        setFlightState({ loadingFlight: false, loadingEdct: false, loadingWeatherNas: false, data: null, weather: null, nas: null, edct: null, error: e.message });
      }
  };
    fetchFlightData();
  }, [searchValue]); // The dependency array ensures this entire effect is re-run only when `searchValue` changes.

  // The hook returns its state object, providing the component with everything it needs to render.
  return flightState;
};

// ✅ ADD: Export the custom hook to make it available for import in other files.
export default useFlightData;