import { useState, useEffect } from 'react';
import axios from 'axios';

const useAirportData = (searchValue, apiUrl) => {
  const [airportWx, setAirportWx] = useState(null);
  const [nasResponseAirport, setNasResponseAirport] = useState(null);
  const [LoadingNAS, setLoadingNAS] = useState(null)
  const [loadingAirportDetails, setLoadingAirportDetails] = useState(false); // Initialized to false, true when relevant search
  const [airportError, setAirportError] = useState(null);

  useEffect(() => {
    // Only proceed if it's an airport search
    if (!searchValue || searchValue?.type !== "airport") {
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
        let mdbAirportWeather = null;
        let rawAirportCode = null;

        if (searchValue.id) { // Search by airport ID (likely from a selection)
          const mdbAirportWeather = await axios.get(`${apiUrl}/mdbAirportWeather/${searchValue.id}`)
            .catch(e => {
              console.error("mdbAirportWeather Error:", e.response?.data || e.message);
              setAirportError(prev => ({ ...prev, mdb: e.response?.data || e.message }));
              return { data: null };
            });

          if (mdbAirportWeather.data) {
            setAirportWx(mdbAirportWeather.data); // Initial set, might be overridden by live
            setLoadingAirportDetails(false);
            mdbAirportCode = mdbAirportWeather.data.code; // e.g., "LAX"
            // Format the airport code for the API calls
            // Store both the original code and the formatted code
            formattedAirportCode = mdbAirportCode;
            if (mdbAirportCode && mdbAirportCode.length === 3) {
              formattedAirportCode = `K${mdbAirportCode}`; // Prefixes with 'K' for US IATA codes
            } 
          }
        } else if (searchValue.airport) { // Search by raw airport code input
          rawAirportCode = searchValue.airport.toUpperCase();
          formattedAirportCode = searchValue.airport
        }
        console.log('mdb', mdbAirportWeather);


        // Only proceed with additional API calls if we have a valid airport code
        if (formattedAirportCode) {
          const [nasRes, liveAirportWeather] = await Promise.all([
            // Use the formatted code for NAS API
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
            setLoadingNAS(false);
          }
          
          console.log('mdf', formattedAirportCode, mdbAirportWeather, );
          // Set the weather data, 
          // prioritizing live data if it exists and differs from mdb. Is a must!
          if (liveAirportWeather.data && mdbAirportWeather &&
            JSON.stringify(liveAirportWeather.data) !== JSON.stringify(mdbAirportWeather.data)) {
            setAirportWx(liveAirportWeather.data)
            setLoadingAirportDetails(false);
            } 
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