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
  const [gateData, setGateData] = useState(null);
  const [weatherResponse, setWeatherResponse] = useState(null);
  const [nasResponse, setNasResponse] = useState(null);
  const [loadingFlightData, setLoadingFlightData] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingNAS, setLoadingNAS] = useState(true);

  const location = useLocation();

  // Extract search value from the location state. Passed in at navigate("/details", { state: { searchValue }});
  const searchValue = location?.state?.searchValue; 

  // Effect to fetch data based on search type
  useEffect(() => {
    async function fetchData() {
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          // Test data fetcch(for frontend development efficiency) if the environment variable for test data is set to true
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          console.log("!!TEST DATA!!", res.data);
          setFlightData(res.data);
          setWeatherResponse(res.data);
          setNasResponse(res.data);
          setLoadingFlightData(false); // Added this line to fix airport data not loading

        } else if (searchValue?.type === "airport") {
          // search query is an airport and returns airport weather component
          
          const res = await axios.get(`${apiUrl}/mdbAirportWeather/${searchValue.id}`);
          setAirportWx(res.data);
          setLoadingWeather(false);
          setLoadingFlightData(false); // Added this line to fix airport data not loading
  
          // TODO: once mdb weather gets updatede it should fetch live weather too.
              // Currently it wont since the searchValue is objectID type and need aiport code to be supplied
          // const [weather] = await Promise.all([
            // axios.get(`${apiUrl}/liveAirportWeather/${searchValue.code}`),
          // ]);

          setAirportWx(res.data);
          setLoadingWeather(false);

        } else if (searchValue?.type === "Terminal/Gate") {
          // search query is a gate type and returns airport weather component
          const res = await axios.get(`${apiUrl}/gates`);
          setGateData(res.data);

        } else if (searchValue?.type === "flight" || searchValue) {
          // search query is a flight number - fetches flight data using flight number and serves FlightCard component
          const flightID = searchValue?.flightID || searchValue;
          console.log("flightID", flightID);
          const [ajms, flightViewGateInfo, flightStatsTZRes, flightAwareRes] = await Promise.all([
            axios.get(`${apiUrl}/ajms/${flightID}`),    // TODO: Direct this to JMS instead of rerouting from backend - Dont make sense to trigger it 3 ways.
            axios.get(`${apiUrl}/flightViewGateInfo/${flightID}`),
            axios.get(`${apiUrl}/flightStatsTZ/${flightID}`),
            // TODO: flightAware needs fixing - airline code.
            axios.get(`${apiUrl}/flightAware/UA/${flightID}`),    
          ]);

          console.log("ajms", ajms.data);
          console.log("flightViewGateInfo",flightViewGateInfo.data );
          console.log("flightStatsTZRes", flightStatsTZRes.data);

          setFlightData({
            ...ajms.data,
            ...flightViewGateInfo.data,
            ...flightStatsTZRes.data,
            ...flightAwareRes.data,
            flightID:flightID,
          });
          setLoadingFlightData(false);


          let departure, arrival;
          if (ajms.data.arrival && ajms.data.departure) {
            departure = ajms.data.departure;
            arrival = ajms.data.arrival;
          } else {
            departure = flightStatsTZRes.data.flightStatsOrigin || flightViewGateInfo.data.flightViewDeparture || null; 
            arrival = flightStatsTZRes.data.flightStatsDestination || flightViewGateInfo.data.flightViewDestination || null; 
          }
          console.log('arrdep,', arrival, departure)
          // Fetch weather data as soon as AJMS data is available
          if (departure && arrival) {
            console.log('got jms data')
            const [nasRes, depWeather, destWeather] = await Promise.all([
              axios.get(`${apiUrl}/NAS/${departure}/${arrival}`),
              axios.get(`${apiUrl}/mdbAirportWeather/${departure}`),
              axios.get(`${apiUrl}/mdbAirportWeather/${arrival}`),
            ]);

            setWeatherResponse({
              dep_weather: depWeather.data,
              dest_weather: destWeather.data,
            });
            setNasResponse(nasRes.data);
            setLoadingWeather(false);
            setLoadingNAS(false);
          }

          // TODO: if at any time any departure,arrival codes availble then fire the weather. Otherwise if ajms or others unavailbale then this will throw errors.

          const [depWeather, destWeather] = await Promise.all([
            // axios.get(`${apiUrl}/mdbAirportWeather/${ajms.data.departure}`),
            // axios.get(`${apiUrl}/mdbAirportWeather/${ajms.data.arrival}`),

            // TODO: fetch live only once attempting mdbAirportWeather. if available match it with mdb if change then use liveWeather else use mdb,
                //if weather n/a in mdb then use liveWeather 
            axios.get(`${apiUrl}/liveAirportWeather/${departure}`),
            axios.get(`${apiUrl}/liveAirportWeather/${arrival}`),
          ]);

          setWeatherResponse({
            dep_weather: depWeather.data,
            dest_weather: destWeather.data,
          });
          setLoadingWeather(false);
          setLoadingNAS(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    if (searchValue) fetchData();
  }, [searchValue]);

  // Renders content based on the current state
  const renderContent = () => {
    if (loadingFlightData && (searchValue?.type === "flightNumber" || searchValue)) {
      return <LoadingFlightCard />;
    }
    return (
      <>
        {airportWx && <WeatherCard title="Airport Weather" weatherDetails={airportWx} />}
        {gateData && <GateCard gateData={searchValue.id} />}
        {flightData && (
          <FlightCard
            flightData={flightData}
            dep_weather={weatherResponse?.dep_weather}
            dest_weather={weatherResponse?.dest_weather}
            nasDepartureResponse={nasResponse?.nas_departure_affected}
            nasDestinationResponse={nasResponse?.nas_destination_affected}
          />
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