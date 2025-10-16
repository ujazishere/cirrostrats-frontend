// flightdata.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import flightService from './utility/flightService';

const apiUrl = import.meta.env.VITE_API_URL;

function normalizeAjms(ajms) {
  const result = {};
  for (const [key, val] of Object.entries(ajms)) {
    if (val && typeof val === "object" && "value" in val) {
      result[key] = val.value;
    } else if (typeof val === "string") {
      result[key] = val;
    } else {
      result[key] = null;
    }
  }
  return { data: result };
}

const useFlightData = (searchValue) => {
  // State is restructured with granular loading flags
  const [flightState, setFlightState] = useState({
    loadingFlight: true,      // For primary flight info
    loadingEdct: true,        // For EDCT data
    loadingWeatherNas: true,  // For Weather and NAS tabs
    data: null,
    weather: null,
    nas: null,
    edct: null,
    error: null,
  });

  useEffect(() => {
    if (searchValue?.type !== "flight" && searchValue?.type !== "N-Number") {
      setFlightState({ loadingFlight: false, loadingEdct: false, loadingWeatherNas: false, data: null, weather: null, nas: null, edct: null, error: null });
      return;
    }

    const fetchFlightData = async () => {
      // Reset all states for a new search
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
        // --- STEP 1: Fetch and display primary flight data immediately ---
        const { rawAJMS, flightAwareRes, flightStatsTZRes } = await flightService.getPrimaryFlightData(flightID);

        const ajms = normalizeAjms(rawAJMS.data || {});
        if (ajms.error && flightAwareRes.error) throw new Error(`Could not retrieve data for flight ${flightID}.`);
        
        const { departure, arrival, departureAlternate, arrivalAlternate } = flightService.getAirports({ ajms, flightAwareRes, flightStatsTZRes });
        const combinedFlightData = {
          flightID, departure, arrival, departureAlternate, arrivalAlternate,
          ...ajms.data, ...flightAwareRes.data, ...flightStatsTZRes.data,
        };

        // FIRST RENDER TRIGGER: Update state with primary data. This renders the main summary.
        setFlightState(prevState => ({
          ...prevState,
          data: combinedFlightData,
          loadingFlight: false, // Turn off the main loader
        }));

        // --- STEP 2: Fetch secondary data in the background without blocking the UI ---
        
        // Fetch EDCT data
        if (import.meta.env.VITE_EDCT_FETCH === "1" && departure && arrival) {
          flightService.getEDCT({ flightID, origin: departure.slice(1), destination: arrival.slice(1) })
            .then(({ EDCTRes }) => {
              setFlightState(prevState => ({ ...prevState, edct: EDCTRes.data, loadingEdct: false }));
            })
            .catch(() => setFlightState(prevState => ({ ...prevState, loadingEdct: false })));
        } else {
          setFlightState(prevState => ({ ...prevState, loadingEdct: false }));
        }

        // Fetch Weather and NAS data
        const airportsToFetch = [
          { key: 'departure', code: departure }, { key: 'arrival', code: arrival },
          { key: 'departureAlternate', code: departureAlternate }, { key: 'arrivalAlternate', code: arrivalAlternate },
        ].filter(item => item.code);

        if (airportsToFetch.length > 0) {
          const requests = airportsToFetch.map(airport => flightService.getWeatherAndNAS(airport.code));
          Promise.all(requests).then(results => {
            const finalWeather = {};
            const finalNas = {};
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
  }, [searchValue]);

  return flightState;
};

export default useFlightData;