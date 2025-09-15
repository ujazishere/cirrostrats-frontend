import flightService from '../components/utility/flightService'; // A service module with helper functions for flight data retrieval.
import { useState, useEffect } from 'react';
import axios from 'axios';

// Defines a custom hook 'useAirportData' for fetching and managing all data related to a specific airport.
const useAirportData = (searchValue, apiUrl) => {
  // State to store the consolidated weather information (from DB or live).
  const [airportWx, setAirportWx] = useState(null);
  // State to store the National Airspace System (NAS) response data.
  const [nasResponseAirport, setNasResponseAirport] = useState(null);
  // State to track the loading status specifically for NAS data.
  const [loadingNAS, setLoadingNAS] = useState(null)
  // State to track the loading status specifically for weather data.
  const [loadingWeather, setLoadingWeather] = useState(null)
  // A general loading state for the entire airport data fetching process.
  const [loadingAirportDetails, setLoadingAirportDetails] = useState(false); // Initialized to false, true when relevant search
  // State to store any errors that occur during the data fetching process.
  const [airportError, setAirportError] = useState(null);

  // The useEffect hook encapsulates the entire data fetching logic.
  // It re-runs whenever the 'searchValue' or 'apiUrl' dependencies change.
  useEffect(() => {
    // Only proceed if it's an airport search
    // This is a guard clause. If the search value is not for an airport, the hook does nothing.
    if (searchValue?.type !== "airport") {
      return;
    }
    // Reset states for a new airport search
    // This ensures that old data from a previous search is cleared out before a new one begins.
    setAirportWx(null);
    setNasResponseAirport(null);
    setAirportError(null);

    // Defines an asynchronous function to perform the data fetching operations.
    const fetchAirportData = async () => {
      // TODO test: Impletement this notification api for absolute errors.
      // console.log('notification api here');
      // await flightService.postNotifications(`This is a test notification: ${searchValue.label || searchValue.r_id}`);
      // A try...catch...finally block to handle the asynchronous operations, errors, and final state updates.
      try {
        // Checks an environment variable to see if the application is in test mode.
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          // If in test mode, it fetches a static test data file instead of making live API calls.
          const res = await axios.get(`${apiUrl}/testDataReturns?airportLookup=KBOS`);
          // Sets loading states before and after updating the main data states.
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
        // Declares variables to hold intermediate data during the live fetching process.
        let mdbAirportId = null
        let mdbAirportCode = null;
        let ICAOformattedAirportCode = null;
        let mdbAirportWeather = null
        let rawAirportCode = null
        // Get instant airport weather from database if availbale - could be old data
        // Checks if the search value contains a database ID (r_id).
        if (searchValue.r_id) {
          // If an ID exists, it's used to fetch potentially cached weather data from our own database (MongoDB).
          mdbAirportId = searchValue.r_id
          setLoadingWeather(true)
          mdbAirportWeather = await axios.get(`${apiUrl}/mdbAirportWeather/${mdbAirportId}`)
          .catch(e => { 
            console.error("mdb Error:", e); 
            return { data: null }; 
          });
          // Process the airport weather data if it exists
          // If data is successfully retrieved from our database...
          if (mdbAirportWeather.data){
            //...it's immediately set to the state to provide a fast initial display.
            setAirportWx(mdbAirportWeather.data);
            setLoadingWeather(false);
            // Assign code for live weather fetching.
            // The airport code from this data is then prepared for fetching live data.
            mdbAirportCode = mdbAirportWeather.data.code
            // Format the airport code for the API calls
            // Store both the original code and the formatted code
            // This logic ensures the airport code is in the 4-letter ICAO format (e.g., adding 'K' to US codes).
            ICAOformattedAirportCode = mdbAirportCode;    // if its international code its 4 chars but if its 3 char...
            if (mdbAirportCode && mdbAirportCode.length === 3) {
              let USIATAairportCode = null
              USIATAairportCode = mdbAirportCode
              ICAOformattedAirportCode = `K${USIATAairportCode}`;
            }
          } else {
            console.error('Impossible error -- mdb data for weather not found')
          }
        // If there's no database ID, it falls back to using the raw label from the search.
        } else if (searchValue.label){
          rawAirportCode = searchValue.label
          setLoadingWeather(true)
          ICAOformattedAirportCode = searchValue.label
        }
        
        // Fetch Live data w ICAO airport code -- Use either mdb code or raw code through searchValue.airport - ICAO format accounted and pre-processed for.
        // This block proceeds only if a valid ICAO-formatted code has been determined.
        if (ICAOformattedAirportCode) {
          // Promise.all is used to fetch live NAS and live weather data concurrently for better performance.
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

          // If the NAS data was fetched successfully, update the state.
          if (nasRes.data){
            setNasResponseAirport(nasRes.data);
            setLoadingNAS(false);
          } 
        
          // Set the weather data, 
          // prioritizing live data if it exists and differs from mdb. Is a must!
          // This complex condition decides whether to update the UI with the newly fetched live weather.
          if ((liveAirportWeather.data && mdbAirportWeather &&

            // If live data is different from mdb data
            // It updates if the live data is different from the cached data...
            JSON.stringify(liveAirportWeather.data) !== JSON.stringify(mdbAirportWeather.data)) || rawAirportCode){

              //...or if the search was performed with a raw airport code (implying no cached data was shown).
              setAirportWx(liveAirportWeather.data)
              setLoadingWeather(false);

              // axios post for fastAPI to store the new data
              // If the live data was new and we had a database ID...
              if (mdbAirportId){
                // send code to get new data!! Caution to my futureself -- dont send html injected weather straight to the db.
                //  Let backend fetch new live weather raw data and store that raw data in the db.
                // ...a request is sent to the backend to update our database with this fresh data.
                if (mdbAirportId){ ICAOformattedAirportCode = null }
                await axios.post(`${apiUrl}/storeLiveWeather?mdbId=${mdbAirportId}&rawCode=${ICAOformattedAirportCode}`)
                .catch(e => { 
                  console.error("Error sending airport code/mdbID to backend for fresh data fetch and store:", e);
                });
              };
            };
        }
      }} catch (e) {
        // If any error occurs in the 'try' block, it's caught here.
        console.error("Error in fetchAirportData:", e);
        // The error is stored in the state to be potentially displayed in the UI.
        setAirportError(e);
      } finally {
        // The 'finally' block always runs, regardless of success or failure.
        // It's used here to ensure the general loading indicator is turned off.
        setLoadingAirportDetails(false);
      }
    };

    // The data fetching function is called to initiate the process.
    fetchAirportData();

  }, [searchValue, apiUrl]); // Effect dependencies

  // The hook returns an object containing all the relevant state and data.
  // This allows the component using the hook to access the weather, NAS data, loading states, and any errors.
  return { airportWx, nasResponseAirport, loadingWeather, LoadingNAS: loadingNAS, airportError };
};

// Exports the custom hook to be used in other components.
export default useAirportData;