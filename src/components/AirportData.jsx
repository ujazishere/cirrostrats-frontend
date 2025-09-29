import flightService from '../components/utility/flightService'; // A service module with helper functions for flight data retrieval.
import { useState, useEffect } from 'react';
import axios from 'axios';

const useAirportData = (searchValue, apiUrl) => {
  const [airportWx, setAirportWx] = useState(null);
  const [nasResponseAirport, setNasResponseAirport] = useState(null);
  const [loadingNAS, setLoadingNAS] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(null)
  const [loadingAirportDetails, setLoadingAirportDetails] = useState(false); // Initialized to false, true when relevant search
  const [airportError, setAirportError] = useState(null);

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
      // TODO test: Impletement this notification api for absolute errors.
      // console.log('notification api here');
      // await flightService.postNotifications(`This is a test notification: ${searchValue.label || searchValue.r_id}`);
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          const res = await axios.get(`${apiUrl}/testDataReturns?airportLookup=KBOS`);
          setLoadingWeather(true)
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
        let mdbAirportId = null
        let mdbAirportCode = null;
        let ICAOformattedAirportCode = null;
        let mdbAirportWeather = null
        let rawAirportCode = null
        // Get instant airport weather from database if availbale - could be old data
        if (searchValue.r_id) {
          mdbAirportId = searchValue.r_id
          setLoadingWeather(true)
          mdbAirportWeather = await axios.get(`${apiUrl}/mdbAirportWeather/${mdbAirportId}`)
          .catch(e => { 
            console.error("mdb Error:", e); 
            return { data: null }; 
          });
          // Process the airport weather data if it exists
          if (mdbAirportWeather.data){
            // FIX: We no longer set state here immediately. We wait to compare it with live data.
            console.log("!!MDB AIRPROT DATA received!!");
            setAirportWx(mdbAirportWeather.data); 
            setLoadingWeather(false);
            // Assign code for live weather fetching.
            mdbAirportCode = mdbAirportWeather.data.code
            // Format the airport code for the API calls
            // Store both the original code and the formatted code
            ICAOformattedAirportCode = mdbAirportCode;    // if its international code its 4 chars but if its 3 char...
            if (mdbAirportCode && mdbAirportCode.length === 3) {
              let USIATAairportCode = null
              USIATAairportCode = mdbAirportCode
              ICAOformattedAirportCode = `K${USIATAairportCode}`;
            }
          } else {
            console.error('Impossible error -- mdb data for weather not found')
          }
        } else if (searchValue.label){
          rawAirportCode = searchValue.label
          setLoadingWeather(true)
          ICAOformattedAirportCode = searchValue.label
        }
        
        // Fetch Live data w ICAO airport code -- Use either mdb code or raw code through searchValue.airport - ICAO format accounted and pre-processed for.
        if (ICAOformattedAirportCode) {
          const [nasRes, liveAirportWeather] = await Promise.all([
            // Use the formatted code for NAS API
            axios.get(`${apiUrl}/NAS?airport=${ICAOformattedAirportCode}`)
              .catch(e => { 
                console.error("NAS Error:", e); 
                return { data: null }; 
              }),
            
            // Use the formatted code for live weather API
            axios.get(`${apiUrl}/liveAirportWeather/${ICAOformattedAirportCode}`)
              .catch(e => { 
                console.error("liveWeather fetch error:", e); 
                return { data: null }; 
              })
          ]);

          if (nasRes.data){
            setNasResponseAirport(nasRes.data);
            setLoadingNAS(false);
          } 
        
          // --- FIX: REVISED LOGIC TO HANDLE POTENTIALLY EMPTY WEATHER DATA ---
          const liveData = liveAirportWeather.data;
          const mdbData = mdbAirportWeather?.data;
          // Helper to check for meaningful weather data (must not be an empty object and should have a METAR).
          const isMeaningful = (weatherObj) => weatherObj && Object.keys(weatherObj).length > 0 && weatherObj.metar;

          // Priority 1: Use live data if it's meaningful.
          if (isMeaningful(liveData)) {
            console.log("!!! SUCCESSFUL LIVE DATA FETCH  and state updated!!!");
            setAirportWx(liveData);
            
            // If live data is different from MDB data, trigger a backend update.
            if (mdbAirportId && JSON.stringify(liveData) !== JSON.stringify(mdbData)) {
              await axios.post(`${apiUrl}/storeLiveWeather?mdbId=${mdbAirportId}&rawCode=${ICAOformattedAirportCode}`)
                .catch(e => { 
                  console.error("Error sending airport code/mdbID to backend for fresh data fetch and store:", e);
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
      }} catch (e) {
        console.error("Error in fetchAirportData:", e);
        setAirportError(e);
      } finally {
        setLoadingAirportDetails(false);
      }
    };

    fetchAirportData();

  }, [searchValue, apiUrl]); // Effect dependencies

  return { airportWx, nasResponseAirport, loadingWeather, LoadingNAS: loadingNAS, airportError };
};

export default useAirportData;