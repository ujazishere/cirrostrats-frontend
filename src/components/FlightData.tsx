// ✅ NEW FILE: This file contains the refactored custom hook for fetching flight data.
// By isolating this logic, we make the Details.jsx component cleaner and the flight data logic reusable.

import { useState, useEffect } from "react";
import axios from "axios"; // A promise-based HTTP client for making requests to our backend API.
import flightService from './utility/flightService'; // A service module with helper functions for flight data retrieval.
import { CombinedWeatherData, EDCTData, NASData, NASResponse, SearchValue } from "../types";
import useAirportData from "./utility/airportService";
import { normalizeAjms, validateAirportData } from "./utility/dataUtils";
import { CloudCog } from "lucide-react";
import searchService from "../components/Input/api/searchservice"; //
import { formatRawSearchResults, FormattedSuggestion } from "../components/Input/utils/searchUtils"; //

// =================================================================================
// Configuration
// =================================================================================
// Retrieve the API's base URL from environment variables. This is a best practice for security and configuration management.
const apiUrl = import.meta.env.VITE_API_URL;

type FlightState = {
  loadingFlight: boolean,      // For the main flight data
  loadingEdct: boolean,        // For the EDCT section
  loadingWeatherNas: boolean,  // For Weather and NAS tabs
  flightData: any;
  possibleSimilarMatches: object | null;
  weather: CombinedWeatherData | null;
  nas: NASData | null;
  edct: EDCTData | null;
  error: string | null;
};

// =================================================================================
// CUSTOM HOOK for fetching Flight Data
// This hook is responsible for all logic related to fetching flight, weather, NAS, and EDCT data.
// =================================================================================

const useFlightData = (searchValue: SearchValue | null, submitTermString: string) => {
  // We manage all related states within a single object. This simplifies state updates and reduces re-renders.
  // REFACTORED: State now has granular loading flags for each data piece.
  const [flightState, setFlightState] = useState<FlightState>({
    loadingFlight: true,
    loadingEdct: true,
    loadingWeatherNas: true,
    flightData: null,
    possibleSimilarMatches: null,
    weather: null,
    nas: null,
    edct: null,
    error: null,
  });


  // This `useEffect` hook triggers the data fetching logic whenever the `searchValue` changes.
  useEffect(() => {
    // First, we perform a guard check. If the search type isn't for a flight, we reset the state and do nothing further.
    // This prevents the hook from running unnecessarily.
      if (searchValue?.type !== "flight" && searchValue?.type !== "nNumber") {
        setFlightState(prev => ({
          ...prev,
          loadingFlight: false,
          loadingEdct: false,
          loadingWeatherNas: false,
          flightData: null,
          weather: null,
          nas: null,
          edct: null,
          error: null,
        })); // Reset state to default.
        return; // Exit the effect.
      }
      // Define an async function to handle the entire flight data fetching process.
    const fetchFlightData = async () => {
        // On new search, reset all states and set all loaders to true.
        setFlightState(prev => ({
          ...prev,
          loadingFlight: true,
          loadingEdct: true,
          loadingWeatherNas: true,
          flightData: null,
          weather: null,
          nas: null,
          edct: null,
          error: null,
        }));
        
            // Check for a specific environment variable to use mock/test data. This is invaluable for development and testing without hitting live APIs.
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          try {
            // Fetch the test data from a dedicated endpoint.
            const res = await axios.get(`${apiUrl}/testDataReturns`);
            console.log("!!TEST FLIGHT DATA!!", res.data); // Log that we are using test data.
            // Populate the state with the mock data.
            setFlightState(prev => ({
              ...prev,
              loadingFlight: false,
              loadingEdct: false,
              loadingWeatherNas: false,
              flightData: res.data.flightData || res.data,
              weather: res.data.weather || res.data,
              nas: res.data.NAS || res.data,
              edct: res.data.EDCT || res.data,
              error: null,
            }));
          } catch (e) {
            console.error("Test Data Error:", e); // Log any errors fetching test data.
            // Set an error state if the mock data fetch fails.
            setFlightState(prev => ({
              ...prev,
              loadingFlight: false,
              loadingEdct: false,
              loadingWeatherNas: false,
              flightData: null,
              weather: null,
              nas: null,
              edct: null,
              error: "Failed to load test data.",
            }));
          }
          return; // Exit after handling test data.
        }
        // Extract the flight identifier from the `searchValue` object. It can be one of several properties.
        const flightID =
          searchValue?.type === "flight" ? (searchValue?.metadata as any)?.flightID || (searchValue?.metadata as any)?.ICAOFlightID :
          searchValue?.type === "nNumber" ? (searchValue?.metadata as any)?.nnumber : null;       // TODO VHP: add for .value support that may come from the search value.
          // searchValue?.flightID || searchValue?.nnumber || searchValue?.value;
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
        // Fetch data using flightID
        try {
          // --- STEP 1: Fetch and display PRIMARY flight data immediately ---
          const { rawAJMS, flightAwareRes, flightStatsTZRes } =
            await flightService.getPrimaryFlightData(searchValue);
          // console.log('primary flight data fetched', rawAJMS, flightAwareRes, flightStatsTZRes)
          // console.log('rawJMS', rawAJMS.data);
          // console.log('flightAware', flightAwareRes.data);
          // console.log('flightStats',flightStatsTZRes.data);
          // --- STEP 1.5: Validate AJMS data against FlightAware - *___ nullify JMS if discrepancy found ___*
          // TODO VHP: This is a temporary fix to catch AJMS data route discrepancies w flightAware.
            // This does not resolve the root cause of airport discrepancies but at least prevents displaying incorrect data.
            // Introduces a new problem - flightAware showing up data for tomorrows flighs, once the scheduled time passes vs flightStats showing today flights throughout the day.
            // Discrepancy fixes needed across all 3 sources- airport, datetime, multiple legs --> 
          
          // Validate before normalization
          const validatedAJMS = validateAirportData(rawAJMS, flightAwareRes);   // TODO VHP: what if there is a discrepancy between flightStats and the resolved JMS/flightAware?
          
          // TODO: *** CAUTION DO NOT REMOVE THIS NORMALIZATION STEP ***
          // *** Error prone such that it may return jumbled data from various dates. 
          // This is a temporary fix to normalize ajms data until we can fix the backend to return consistent data.
          // Fix JMS data structure issues at source trace it back from /ajms route's caution note
          // Normalize AJMS data to ensure consistent structure.
          const ajms = normalizeAjms(validatedAJMS.data || {});
          
          // console.log('normalized jms', ajms);
          // --- STEP 2: Extract airport identifiers (departure, arrival, alternates) from the aggregated primary data.
          const {
            departure, arrival, departureAlternate, arrivalAlternate
          } = flightService.getAirports({ ajms, flightAwareRes, flightStatsTZRes});
          // console.log('determine airports of interest', departure, arrival, departureAlternate, arrivalAlternate);
          // Newer code:
          // If core data sources fail, we can't build a complete picture. Set an error and exit.
          if ((ajms as any).error && (flightAwareRes as any).error) {
            setFlightState(prev => ({
              ...prev,
              loadingFlight: false,
              loadingEdct: false,
              loadingWeatherNas: false,
              flightData: null,
              weather: null,
              nas: null,
              edct: null,
              error: `Could not retrieve data for flight ${flightID}.`,
            }));
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
          console.log('final combinedFlights', combinedFlightData);

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
            setFlightState(prev => ({
              ...prev,
              loadingFlight: false,
              loadingEdct: false,
              loadingWeatherNas: false,
              flightData: null, // Set data to null to trigger the "no data" message
              weather: null,
              nas: null,
              edct: null,
              error: `Could not retrieve data for flight ${flightID}.`,
            }));
            return;
          }

          // --- STEP 3.5: FIRST RENDER - Update state with PRIMARY flight data immediately ---
          // This renders the SummaryTable(not the route panel?).
          setFlightState((prevState: FlightState)=> ({
            ...prevState,
            flightData: combinedFlightData,
            loadingFlight: false, // Turn off the main loader
          }));

          // --- STEP 3: Fetch SECONDARY data in the background ---
          // Step 4: Conditionally fetch EDCT data based on an environment flag. This allows turning the feature on/off easily.
          // Fetch EDCT data asynchronously
          if (import.meta.env.VITE_EDCT_FETCH === "1" && departure && arrival) {
            // Log in development mode to remind developers this potentially costly fetch is active.
            if (import.meta.env.VITE_ENV === "dev") {
              console.log(
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

        } catch (e) {
          console.error("Error fetching primary flight details:", e);
          setFlightState((prevState: FlightState)=> ({ 
            ...prevState, 
            loadingFlight: false,
            loadingEdct: false,
            loadingWeatherNas: false,
            flightData: null,
            weather: null,
            nas: null,
            edct: null,
            error: e.message
          }));
        }
  };
    fetchFlightData();
  }, [searchValue]); // The dependency array ensures this entire effect is re-run only when `searchValue` changes.

  const airportsToFetch = flightState.flightData ? [
    { key: "departure", airportCode: flightState.flightData.departure},
    { key: "arrival", airportCode: flightState.flightData.arrival},
    { key: "departureAlternate", airportCode: flightState.flightData.departureAlternate},
    { key: "arrivalAlternate", airportCode: flightState.flightData.arrivalAlternate},
  ].filter(a => a.airportCode) : [];

  const departureData = useAirportData(airportsToFetch.find(a => a.key === "departure")?.airportCode, apiUrl);
  const arrivalData = useAirportData(airportsToFetch.find(a => a.key === "arrival")?.airportCode, apiUrl);
  const departureAlternateData = useAirportData(airportsToFetch.find(a => a.key === "departureAlternate")?.airportCode, apiUrl);
  const arrivalAlternateData = useAirportData(airportsToFetch.find(a => a.key === "arrivalAlternate")?.airportCode, apiUrl);

  // 4. Combine airport data into flightState
  useEffect(() => {
    if (flightState.flightData && airportsToFetch.length > 0) {
      const weather: CombinedWeatherData = {};
      const NAS: NASResponse = {};

      // Update weather data with mdb data first if available, then live data if available.
      weather.departureWeather = departureData.airportWxMdb;
      if (departureData.airportWxLive) {
        weather.departureWeather = departureData.airportWxLive;
      }
      setFlightState(prev => ({
        ...prev,
        weather: Object.keys(weather).length > 0 ? weather : prev.weather,
      }));

      weather.arrivalWeather = arrivalData.airportWxLive || arrivalData.airportWxMdb;
      weather.departureAlternateWeather = departureAlternateData.airportWxLive || departureAlternateData.airportWxMdb;
      weather.arrivalAlternateWeather = arrivalAlternateData.airportWxLive || arrivalAlternateData.airportWxMdb;
      setFlightState(prev => ({
        ...prev,
        weather: Object.keys(weather).length > 0 ? weather : prev.weather,
      }));

      // Update NAS data
      if (departureData.nasResponseAirport) NAS.departureNAS = departureData.nasResponseAirport;
      if (arrivalData.nasResponseAirport) NAS.arrivalNAS = arrivalData.nasResponseAirport;
      if (departureAlternateData.nasResponseAirport) NAS.departureAlternateNAS = departureAlternateData.nasResponseAirport;
      if (arrivalAlternateData.nasResponseAirport) NAS.arrivalAlternateNAS = arrivalAlternateData.nasResponseAirport;

      const isAnyLoading =
        departureData.loadingWeather || departureData.LoadingNAS ||
        arrivalData.loadingWeather || arrivalData.LoadingNAS ||
        departureAlternateData.loadingWeather || departureAlternateData.LoadingNAS ||
        arrivalAlternateData.loadingWeather || arrivalAlternateData.LoadingNAS;

      setFlightState(prev => ({
        ...prev,
        nas: Object.keys(NAS).length > 0 ? NAS : prev.nas,
        loadingWeatherNas: isAnyLoading ? true : false
      }));
    }
  }, [
    
    flightState.flightData, 
    airportsToFetch.length,

    departureData.loadingWeather, departureData.LoadingNAS,
    arrivalData.loadingWeather, arrivalData.LoadingNAS,
    departureAlternateData.loadingWeather, departureAlternateData.LoadingNAS,
    arrivalAlternateData.loadingWeather, arrivalAlternateData.LoadingNAS,
    
    departureData.airportWxLive, departureData.airportWxMdb, departureData.nasResponseAirport,
    arrivalData.airportWxLive, arrivalData.airportWxMdb, arrivalData.nasResponseAirport,
    departureAlternateData.airportWxLive, departureAlternateData.airportWxMdb, departureAlternateData.nasResponseAirport,
    arrivalAlternateData.airportWxLive, arrivalAlternateData.airportWxMdb, arrivalAlternateData.nasResponseAirport,
    ]);

  // PossibleSimilarMatches fetching mechanism
  useEffect(() => {
    if (submitTermString && submitTermString.length > 0) {

      const fetchBackgroundMatches = async () => {
        try {
          // Perform the slow search now, while the user is already looking at the page
          const rawReturn = await searchService.fetchRawQuery(
            submitTermString.toUpperCase()
          );
          // let formattedResults: = [];
          const formattedResults: FormattedSuggestion[]  = formatRawSearchResults(rawReturn);

          console.log('possibleMatfhces found', formattedResults)
          setFlightState(prev => ({
            ...prev,
            possibleSimilarMatches: formattedResults
          }));

        } catch (error) {
          console.error("Background fetch failed", error);
        }
      };

      fetchBackgroundMatches();
    }
  }, [submitTermString]);

  // The hook returns its state object, providing the component with everything it needs to render.
  return flightState;

};

// ✅ ADD: Export the custom hook to make it available for import in other files.
export default useFlightData;