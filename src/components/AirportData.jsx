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
        if (searchValue.id) {
          mdbAirportId = searchValue.id
          setLoadingWeather(true)
          mdbAirportWeather = await axios.get(`${apiUrl}/mdbAirportWeather/${mdbAirportId}`)
          .catch(e => { 
            console.error("mdb Error:", e); 
            return { data: null }; 
          });
          // Process the airport weather data if it exists
          if (mdbAirportWeather.data){
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
        } else if (searchValue.airport){
          rawAirportCode = searchValue.airport
          setLoadingWeather(true)
          ICAOformattedAirportCode = searchValue.airport
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
            // TODO: Need to show this component in the weather card.
            setNasResponseAirport(nasRes.data);
            setLoadingNAS(false);
          } 
        
          // Set the weather data, 
          // prioritizing live data if it exists and differs from mdb. Is a must!
          if ((liveAirportWeather.data && mdbAirportWeather &&

            // If live data is different from mdb data
            JSON.stringify(liveAirportWeather.data) !== JSON.stringify(mdbAirportWeather.data)) || rawAirportCode){

              setAirportWx(liveAirportWeather.data)
              setLoadingWeather(false);

              // axios post for fastAPI to store the new data
              if (mdbAirportId){
                // send code to get new data!! Caution to my futureself -- dont send html injected weather straight to the db.
                //  Let backend fetch new live weather raw data and store that raw data in the db.
                if (mdbAirportId){ ICAOformattedAirportCode = null }
                await axios.post(`${apiUrl}/storeLiveWeather?mdbId=${mdbAirportId}&rawCode=${ICAOformattedAirportCode}`)
                .catch(e => { 
                  console.error("Error sending airport code/mdbID to backend for fresh data fetch and store:", e);
                });
              };
            };
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