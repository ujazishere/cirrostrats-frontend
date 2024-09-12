import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import WeatherCard from "../components/WeatherCard";
import FlightCard from "../components/FlightCard";
import UTCTime from "../components/UTCTime"; // Import the UTC time component

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl${apiUrl}`);

const Details = () => {
  const [airportWx, setAirportWx] = useState([]);
  const [flightData, setFlightData] = useState([]);
  const location = useLocation();
  const searchValue = location?.state?.searchValue;
  // const noResults = location?.state?.noResults;

  console.log('searchValue in Details.jsx', searchValue);
  useEffect(() => {
    async function fetchData() {
      try {

        let res;
        if (searchValue?.id) {
          // Fetching weather data using the airport ID
          const airportId = searchValue.id;
          res = await axios.get(`${apiUrl}/airport/${airportId}`);
          console.log("Returning airportData")
          setAirportWx(res.data);
        } else {
          console.log("Couldn't find airport in the suggestion. sending to /rawQuery.")
          // Fetching data using raw query
          res = await axios.get(`${apiUrl}/rawQuery/${searchValue}`);
          setFlightData(res.data);
        }

        console.log('res.data from Details.jsx', res.data, airportWx);

        if (res.status !== 200) {
          throw new Error("Network error occurred");
        }

        // If there is flight data, you can set it here using setFlightData(res.data) if necessary.
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle the error here, e.g., set an error state or show a notification
      }
    }

    if (searchValue) fetchData();
  }, [searchValue]);

  return (
    <div className="details">
      <UTCTime /> {/* Add the UTC time component */}
      
      {/* The following code for Card component states that if airportData is truthy it will render the Card component */}
      {/* This is old code */}
      {/* {aiportData && <WeatherCard arrow={false} flightDetails={aiportData} />} */}

      {/* The following thing looks for searchValue's ID that is the airport weather logic. if its returned airport then it will return WeatherCard */}
      {/* Otherwise it will return the FlightCard */}
      {searchValue.id? (
        <WeatherCard arrow={false} weatherDetails={airportWx} />
      ) : flightData ? (
        <FlightCard flightDetails={flightData} />
      ) : null}
    </div>
  );
};

export default Details;
