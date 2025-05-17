import { useState, useEffect } from 'react';
import axios from 'axios';

const useAirportData = (searchValue, apiUrl) => {
  const [airportWx, setAirportWx] = useState(null);
  const [nasResponseAirport, setNasResponseAirport] = useState(null);
  const [loadingAirportDetails, setLoadingAirportDetails] = useState(false); // Initialized to false, true when relevant search
  const [airportError, setAirportError] = useState(null);

  useEffect(() => {
    // Only proceed if it's an airport search
    if (!searchValue || searchValue?.type !== "airport") {
      setAirportWx(null);
      setNasResponseAirport(null);
      setAirportError(null);
      setLoadingAirportDetails(false);
      return;
    }

    // Reset states for a new airport search
    setAirportWx(null);
    setNasResponseAirport(null);
    setAirportError(null);
    setLoadingAirportDetails(true);

    const fetchAirportData = async () => {
      try {
        let mdbAirportCode = null;
        let formattedAirportCode = null;
        let mdbAirportWeatherData = null;
        let rawAirportCode = null;

        if (searchValue.id) { // Search by airport ID (likely from a selection)
          const mdbResponse = await axios.get(`${apiUrl}/mdbAirportWeather/${searchValue.id}`)
            .catch(e => {
              console.error("mdbAirportWeather Error:", e.response?.data || e.message);
              setAirportError(prev => ({ ...prev, mdb: e.response?.data || e.message }));
              return { data: null };
            });

          if (mdbResponse.data) {
            mdbAirportWeatherData = mdbResponse.data;
            setAirportWx(mdbResponse.data); // Initial set, might be overridden by live
            mdbAirportCode = mdbResponse.data.code; // e.g., "LAX"
            if (mdbAirportCode && mdbAirportCode.length === 3) {
              formattedAirportCode = `K${mdbAirportCode}`; // Prefixes with 'K' for US IATA codes
            } else {
              formattedAirportCode = mdbAirportCode; // Assumes ICAO or already prefixed
            }
          }
        } else if (searchValue.airport) { // Search by raw airport code input
          rawAirportCode = searchValue.airport.toUpperCase();
          if (rawAirportCode.length === 3 && !rawAirportCode.startsWith('K')) {
            // Assuming 3-letter codes are IATA and for US context, need 'K' prefix for some APIs.
            formattedAirportCode = `K${rawAirportCode}`;
          } else {
            formattedAirportCode = rawAirportCode; // Assumes "KLAX" or "EGLL" (ICAO)
          }
        }

        if (formattedAirportCode) {
          const [nasRes, liveAirportWeatherRes] = await Promise.all([
            axios.get(`${apiUrl}/NAS/${formattedAirportCode}/${formattedAirportCode}`) // Using formatted code for NAS
              .catch(e => {
                console.error(`NAS Error for ${formattedAirportCode}:`, e.response?.data || e.message);
                setAirportError(prev => ({ ...prev, nas: e.response?.data || e.message }));
                return { data: null };
              }),
            axios.get(`${apiUrl}/liveAirportWeather/${formattedAirportCode}`) // Using formatted code for live weather
              .catch(e => {
                console.error(`liveAirportWeather Error for ${formattedAirportCode}:`, e.response?.data || e.message);
                setAirportError(prev => ({ ...prev, liveWeather: e.response?.data || e.message }));
                return { data: null };
              })
          ]);

          if (nasRes.data) {
            setNasResponseAirport(nasRes.data);
          }

          if (liveAirportWeatherRes.data) {
            // Prioritize live data if it exists and differs from mdb, or if it's a raw code search without mdb hit
            if ((mdbAirportWeatherData && JSON.stringify(liveAirportWeatherRes.data) !== JSON.stringify(mdbAirportWeatherData)) || (rawAirportCode && !mdbAirportWeatherData) ) {
              setAirportWx(liveAirportWeatherRes.data);
            } else if (!mdbAirportWeatherData) { // If MDB data wasn't attempt/found but live data is there
                setAirportWx(liveAirportWeatherRes.data);
            }
            // If live data is same as MDB, airportWx remains the MDB data. If live failed, airportWx remains MDB.
          }
        } else {
          console.warn("No valid airport code determined for API calls from searchValue:", searchValue);
          // If mdbAirportWeatherData was set, it remains. Otherwise, airportWx is null.
        }
      } catch (e) {
        console.error("Error in fetchAirportData:", e);
        setAirportError(e);
      } finally {
        setLoadingAirportDetails(false);
      }
    };

    fetchAirportData();

  }, [searchValue, apiUrl]); // Effect dependencies

  return { airportWx, nasResponseAirport, loadingAirportDetails, airportError };
};

export default useAirportData;