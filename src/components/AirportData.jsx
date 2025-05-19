import { useState, useEffect } from 'react';
import axios from 'axios';

const useAirportData = (searchValue, apiUrl) => {
  const [airportWx, setAirportWx] = useState(null);
  const [nasResponseAirport, setNasResponseAirport] = useState(null);
  const [LoadingNAS, setLoadingNAS] = useState(null)
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
        // Initialize variables
        let mdbAirportCode = null;
        let formattedAirportCode = null;
        let mdbAirportWeather = null
        let rawAirportCode = null
        // Get airport weather from database if availbale - could be old data
        if (searchValue.id) {
          setLoadingWeather(true)
          mdbAirportWeather = await axios.get(`${apiUrl}/mdbAirportWeather/${searchValue.id}`)
          .catch(e => { 
            console.error("mdb Error:", e); 
            return { data: null }; 
          });
          // Process the airport weather data if it exists
          if (mdbAirportWeather.data){
            setAirportWx(mdbAirportWeather.data);
            setLoadingWeather(false);
            mdbAirportCode = mdbAirportWeather.data.code
            // Format the airport code for the API calls
            // Store both the original code and the formatted code
            formattedAirportCode = mdbAirportCode;
            if (mdbAirportCode && mdbAirportCode.length === 3) {
              formattedAirportCode = `K${mdbAirportCode}`;
            }
          }
        } else if (searchValue.airport){
          setLoadingWeather(true)
          rawAirportCode = searchValue.airport
          formattedAirportCode = searchValue.airport
        }
        
        // Only proceed with additional API calls if we have a valid airport code
        if (formattedAirportCode) {
          const [nasRes, liveAirportWeather] = await Promise.all([
            // Use the formatted code for NAS API
            axios.get(`${apiUrl}/NAS/${formattedAirportCode}/${formattedAirportCode}`)
              .catch(e => { 
                console.error("NAS Error:", e); 
                return { data: null }; 
              }),
            
            // Use the formatted code for live weather API
            axios.get(`${apiUrl}/liveAirportWeather/${formattedAirportCode}`)
              .catch(e => { 
                console.error("liveWeather Error:", e); 
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
            JSON.stringify(liveAirportWeather.data) !== JSON.stringify(mdbAirportWeather.data)) || rawAirportCode){
            setAirportWx(liveAirportWeather.data)
            setLoadingWeather(false);
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

  return { airportWx, nasResponseAirport, loadingWeather, LoadingNAS, airportError };
};

export default useAirportData;