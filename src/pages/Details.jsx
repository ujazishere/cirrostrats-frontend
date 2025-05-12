import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime";
import { FlightCard, WeatherCard, GateCard } from "../components/Combined";
import { LoadingFlightCard } from "../components/Skeleton";

// API base URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

const Details = () => {
  // State variables for managing data and loading statuses
  const [airportWx, setAirportWx] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [gateData, setGateData] = useState(null); // Should hold data for a specific gate or all gates if GateCard filters
  const [weatherResponse, setWeatherResponse] = useState(null);
  const [nasResponse, setNasResponse] = useState(null);

  const [loadingFlightData, setLoadingFlightData] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingNAS, setLoadingNAS] = useState(true);

  const location = useLocation();
  const searchValue = location?.state?.searchValue;

  useEffect(() => {
    // --- BEGIN FIX: Reset states on new search ---
    setAirportWx(null);
    setFlightData(null);
    setGateData(null);
    setWeatherResponse(null);
    setNasResponse(null);

    if (searchValue) {
      // Set loading states to true only if we have a search value
      // Specific loading states will be set to false as data comes in or if not applicable
      setLoadingFlightData(true);
      setLoadingWeather(true);
      setLoadingNAS(true);
    } else {
      // No search value, so nothing is loading, clear all.
      setLoadingFlightData(false);
      setLoadingWeather(false);
      setLoadingNAS(false);
      return; // Exit early if no searchValue
    }
    // --- END FIX ---

    async function fetchData() {
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          console.log("!!TEST DATA!!", res.data);
          // Assuming test data might provide all pieces of data needed
          setFlightData(res.data.flightData || res.data); // Adjust based on actual test data structure
          setWeatherResponse(res.data.weatherResponse || res.data);
          setNasResponse(res.data.nasResponse || res.data);
          setAirportWx(res.data.airportWx || null); // If test data includes airport weather
          setGateData(res.data.gateData || null); // If test data includes gate data

          setLoadingFlightData(false);
          setLoadingWeather(false);
          setLoadingNAS(false);

        } else if (searchValue?.type === "airport") {
          const res = await axios.get(`${apiUrl}/mdbAirportWeather/${searchValue.id}`);
          setAirportWx(res.data);
          setLoadingWeather(false);
          // For an airport search, we are not loading flight data or NAS primarily
          setLoadingFlightData(false);
          setLoadingNAS(false);

        } else if (searchValue?.type === "Terminal/Gate") {
          // This fetches all gates. GateCard would need to filter or this API needs to change.
          // For this example, assuming GateCard can take the searchValue to identify the specific gate from the list,
          // or the API needs to be more specific: `${apiUrl}/gates/${searchValue.id}`
          const res = await axios.get(`${apiUrl}/gates`); // Fetches all gates
          setGateData(res.data); // gateData now holds an array of all gates
          // For a gate search, not loading flight, weather, or NAS primarily
          setLoadingFlightData(false);
          setLoadingWeather(false);
          setLoadingNAS(false);

        } else if (searchValue?.type === "flight" || (searchValue && typeof searchValue === 'string') || (searchValue && !searchValue.type)) {
          // Handles flight type or raw string input (assumed to be a flight number)
          let flightID = null;
          if (searchValue?.flightID) {
            flightID = searchValue.flightID;
          } else if (typeof searchValue === 'string') {
            flightID = searchValue;
          } else if (searchValue?.value) { // From Autocomplete option not having flightID but a value
            flightID = searchValue.value;
          } else if (searchValue?.label) { // Fallback to label
             flightID = searchValue.label;
          }


          if (!flightID) {
            console.error("Could not determine Flight ID from searchValue:", searchValue);
            setLoadingFlightData(false);
            setLoadingWeather(false);
            setLoadingNAS(false);
            return;
          }
          
          console.log("Resolved flightID for API calls:", flightID);

          const [ajms, flightViewGateInfo, flightStatsTZRes, flightAwareRes] = await Promise.all([
            axios.get(`${apiUrl}/ajms/${flightID}`).catch(e => { console.error("AJMS Error:", e); return { data: {} }; }),
            axios.get(`${apiUrl}/flightViewGateInfo/${flightID}`).catch(e => { console.error("FlightViewGateInfo Error:", e); return { data: {} }; }),
            axios.get(`${apiUrl}/flightStatsTZ/${flightID}`).catch(e => { console.error("FlightStatsTZ Error:", e); return { data: {} }; }),
            axios.get(`${apiUrl}/flightAware/UA/${flightID}`).catch(e => { console.error("FlightAware Error:", e); return { data: {} }; }), // TODO: Airline code might need to be dynamic
          ]);
          
          let departure, arrival;
          if (ajms.data?.arrival && ajms.data?.departure) {
            departure = ajms.data.departure;
            arrival = ajms.data.arrival;
          } else {
            departure = flightStatsTZRes.data?.flightStatsOrigin || flightViewGateInfo.data?.flightViewDeparture || null;
            arrival = flightStatsTZRes.data?.flightStatsDestination || flightViewGateInfo.data?.flightViewDestination || null;
          }
          console.log('Departure/Arrival for weather lookup:', arrival, departure);

          const combinedFlightData = {
            flightID: flightID,
            departure: departure,
            arrival: arrival,
            ...ajms.data,
            ...flightViewGateInfo.data,
            ...flightStatsTZRes.data,
            ...flightAwareRes.data,
          };
          setFlightData(combinedFlightData);
          setLoadingFlightData(false);


          if (departure && arrival) {
            const [nasRes, depWeatherLive, destWeatherLive, depWeatherMdb, destWeatherMdb] = await Promise.all([
              axios.get(`${apiUrl}/NAS/${departure}/${arrival}`).catch(e => { console.error("NAS Error:", e); return { data: {} }; }),
              axios.get(`${apiUrl}/liveAirportWeather/${departure}`).catch(e => { console.warn(`Live Dep Weather Error for ${departure}:`, e.response?.data); return { data: null }; }),
              axios.get(`${apiUrl}/liveAirportWeather/${arrival}`).catch(e => { console.warn(`Live Dest Weather Error for ${arrival}:`, e.response?.data); return { data: null }; }),
              axios.get(`${apiUrl}/mdbAirportWeather/${departure}`).catch(e => { console.warn(`MDB Dep Weather Error for ${departure}:`, e.response?.data); return { data: null }; }),
              axios.get(`${apiUrl}/mdbAirportWeather/${arrival}`).catch(e => { console.warn(`MDB Dest Weather Error for ${arrival}:`, e.response?.data); return { data: null }; }),
            ]);
            
            setWeatherResponse({
              dep_weather: depWeatherLive.data || depWeatherMdb.data, // Prioritize live, fallback to MDB
              dest_weather: destWeatherLive.data || destWeatherMdb.data,
            });
            setNasResponse(nasRes.data);
          } else {
            console.warn("Departure or arrival airport code missing for flightID", flightID, "Cannot fetch detailed weather/NAS.");
          }
          setLoadingWeather(false);
          setLoadingNAS(false);
        } else {
          // Fallback for unknown search type or if searchValue is present but not fitting other conditions
          console.warn("Unknown or unhandled search type:", searchValue?.type);
          setLoadingFlightData(false);
          setLoadingWeather(false);
          setLoadingNAS(false);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        setLoadingFlightData(false);
        setLoadingWeather(false);
        setLoadingNAS(false);
      }
    }

    fetchData(); // This is now safe due to the early return if !searchValue

  }, [searchValue]); // useEffect dependency

  const renderContent = () => {
    // Determine if the current search is primarily for a flight
    const isFlightSearch = searchValue?.type === "flight" || (searchValue && typeof searchValue === 'string' && !searchValue.type) || (searchValue && !searchValue.type && (searchValue.flightID || searchValue.value || searchValue.label));


    if (loadingFlightData && isFlightSearch) {
      return <LoadingFlightCard />;
    }

    // If it's an airport search and weather is loading (and not a flight search that also loads weather)
    if (loadingWeather && searchValue?.type === "airport" && !isFlightSearch) {
        // You might want a generic weather loading skeleton here
        return <p>Loading airport weather...</p>;
    }
    
    // If it's a gate search and data is loading (assuming a gate loading state if needed)
    // For now, GateCard is simple and doesn't have its own loading state in this example

    const noDataFound = !airportWx && !gateData && !flightData;
    const stillLoading = loadingFlightData || loadingWeather || loadingNAS;

    return (
      <>
        {airportWx && <WeatherCard title="Airport Weather" weatherDetails={airportWx} />}
        
        {/* If gateData is an array of all gates, GateCard needs to filter it using searchValue.id or label */}
        {/* For example: const targetGate = gateData?.find(g => g.id === searchValue.id || g.Gate === searchValue.label); */}
        {/* Then: {targetGate && <GateCard gateData={targetGate} />} */}
        {/* For simplicity, assuming gateData might be specific or GateCard handles it */}
        {gateData && searchValue?.type === "Terminal/Gate" && <GateCard gateData={gateData} currentSearchValue={searchValue} />}
        
        {flightData && (
          <FlightCard
            flightData={flightData}
            dep_weather={weatherResponse?.dep_weather}
            dest_weather={weatherResponse?.dest_weather}
            nasDepartureResponse={nasResponse?.nas_departure_affected}
            nasDestinationResponse={nasResponse?.nas_destination_affected}
          />
        )}
        {!stillLoading && noDataFound && searchValue && (
             <p>No information found for your search: {searchValue.label || searchValue.value || (typeof searchValue === 'string' && searchValue)}</p>
        )}
      </>
    );
  };

  return (
    <div className="details">
      <UTCTime />
      {renderContent()}
    </div>
  );
};

export default Details;