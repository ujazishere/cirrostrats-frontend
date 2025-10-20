// ✅ NEW FILE: This file contains the refactored custom hook for fetching flight data.
// By isolating this logic, we make the Details.jsx component cleaner and the flight data logic reusable.

import { useState, useEffect } from "react";
import axios from "axios"; // A promise-based HTTP client for making requests to our backend API.
import flightService from './utility/flightService'; // A service module with helper functions for flight data retrieval.

// =================================================================================
// Configuration
// =================================================================================
// Retrieve the API's base URL from environment variables. This is a best practice for security and configuration management.
const apiUrl = import.meta.env.VITE_API_URL;


// =================================================================================
// Helper Function
// This function was moved from Details.jsx along with the hook.
// =================================================================================
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

// =================================================================================
// CUSTOM HOOK for fetching Flight Data
// This hook is responsible for all logic related to fetching flight, weather, NAS, and EDCT data.
// =================================================================================
// flightdata.jsx: line 76
const useFlightData = (searchValue) => {
  // REFACTORED: State now has granular loading flags for each data piece.
  const [flightState, setFlightState] = useState({
    loadingFlight: true,      // For the main flight data
    loadingEdct: true,        // For the EDCT section
    loadingWeatherNas: true,  // For Weather and NAS tabs
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
      setFlightState({ loadingFlight: false, loadingEdct: false, loadingWeatherNas: false, data: null, weather: null, nas: null, edct: null, error: null });
      return; // Exit the effect.
    }

    // Define an async function to handle the entire flight data fetching process.
    // flightdata.jsx: line 90
    const fetchFlightData = async () => {
      // On new search, reset all states and set all loaders to true.
      setFlightState({
        loadingFlight: true, loadingEdct: true, loadingWeatherNas: true,
        data: null, weather: null, nas: null, edct: null, error: null,
      });
      
      const flightID = searchValue?.flightID || searchValue?.nnumber || searchValue?.value;
      if (!flightID) {
        setFlightState(s => ({ ...s, error: "Invalid Flight ID", loadingFlight: false, loadingEdct: false, loadingWeatherNas: false }));
        return;
      }

      try {
        // --- STEP 1: Fetch and display PRIMARY flight data immediately ---
        const { rawAJMS, flightAwareRes, flightStatsTZRes } = await flightService.getPrimaryFlightData(flightID);

        // --- STEP 1.5: Validate AJMS data against FlightAware - *___ nullify JMS if discrepancy found ___*
        // TODO VHP: This is a temporary fix to catch AJMS data route discrepancies w flightAware.
          // This does not resolve the root cause of airport discrepancies but at least prevents displaying incorrect data.
          // Introduces a new problem - flightAware showing up data for tomorrows flighs, once the scheduled time passes vs flightStats showing today flights throughout the day.
          // Discrepancy fixes needed across all 3 sources- airport, datetime, multiple legs --> 
        function validateAirportData(ajmsData, flightAwareRes, flightService) {
          // If no AJMS data or no FlightAware data, return as-is
          if (!ajmsData?.data || !flightAwareRes?.data || flightAwareRes.error) {
            return ajmsData;
          }
          
          const ajmsDeparture = ajmsData.data.departure;
          const ajmsArrival = ajmsData.data.arrival;
          const faOrigin = flightAwareRes.data.fa_origin;
          const faDestination = flightAwareRes.data.fa_destination;
          
          // Check for discrepancy
          if (ajmsDeparture && faOrigin && ajmsDeparture !== faOrigin ||
              ajmsArrival && faDestination && ajmsArrival !== faDestination) {
            // Log the discrepancy
            flightService.postNotifications(
              `Airport Discrepancy: \n**ajms** ${JSON.stringify(ajmsData.data)} \n**flightAware** ${JSON.stringify(flightAwareRes.data)}`
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
        
        // If core data sources fail, we can't build a complete picture. Set an error and exit.
        if (ajms.error && flightAwareRes.error) throw new Error(`Could not retrieve JMS or FlightAware data for flight ${flightID}.`);
        
        // TODO VHP: airport descrepency handling -
            // Wouldn't this nullify airport validation since were re-introducing all sources again here?
            // The whole idea of departure/arrival resolution was to pick the most reliable source among all 3.
            // But then this re-introduces airport discrepancy by bringing back all 3 sources which has the root departure/arrival as is. 
        const combinedFlightData = {
          flightID, departure, arrival, departureAlternate, arrivalAlternate,
          ...ajms.data, ...flightAwareRes.data, ...flightStatsTZRes.data,
        };

        // FIRST RENDER: Update state as soon as primary data is available.
        // This renders the SummaryTable and RoutePanel.
        setFlightState(prevState => ({
          ...prevState,
          data: combinedFlightData,
          loadingFlight: false, // Turn off the main loader
        }));

        // --- STEP 3: Fetch SECONDARY data in the background ---
        // Fetch EDCT data asynchronously
        if (import.meta.env.VITE_EDCT_FETCH === "1" && departure && arrival) {
          flightService.getEDCT({ flightID, origin: departure.slice(1), destination: arrival.slice(1) })
            .then(({ EDCTRes }) => {
              setFlightState(prevState => ({ ...prevState, edct: EDCTRes.data, loadingEdct: false }));
            })
            .catch(() => setFlightState(prevState => ({ ...prevState, loadingEdct: false }))); // Still turn off loader on error
        } else {
          setFlightState(prevState => ({ ...prevState, loadingEdct: false }));
        }

        // Fetch Weather and NAS data asynchronously
        const airportsToFetch = [
          { key: 'departure', code: departure }, { key: 'arrival', code: arrival },
          { key: 'departureAlternate', code: departureAlternate }, { key: 'arrivalAlternate', code: arrivalAlternate },
        ].filter(item => item.code);

        if (airportsToFetch.length > 0) {
          const requests = airportsToFetch.map(airport => flightService.getWeatherAndNAS(airport.code));
          Promise.all(requests).then(results => {
            const finalWeather = {}; const finalNas = {};
            results.forEach((result, index) => {
              const airportKey = airportsToFetch[index].key;
              finalWeather[`${airportKey}WeatherMdb`] = result?.weather?.mdb || null;
              finalWeather[`${airportKey}WeatherLive`] = result?.weather?.live || null;
              finalNas[`${airportKey}NAS`] = result?.NAS || null;
            });
            setFlightState(prevState => ({ ...prevState, weather: finalWeather, nas: finalNas, loadingWeatherNas: false }));
          }).catch(() => setFlightState(prevState => ({ ...prevState, loadingWeatherNas: false })));
        } else {
          setFlightState(prevState => ({ ...prevState, loadingWeatherNas: false }));
        }

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