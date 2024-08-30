import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import WeatherCard from "../components/WeatherCard";
import UTCTime from "../components/UTCTime"; // Import the UTC time component

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl${apiUrl}`);

const Details = () => {
  const [aiportData, setAiportData] = useState([]);
  const [flightData, setFlightData] = useState([]);
  const location = useLocation();
  const searchValue = location?.state?.searchValue;

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('searchValue in Details.jsx', searchValue);

        let res;
        if (searchValue?.id) {
          // Fetching weather data using the airport ID
          const airportId = searchValue.id;
          res = await axios.get(`${apiUrl}/airport/${airportId}`);
        } else {
          console.log("Couoldn't find airport in the suggestion. sending to /rawQuery.")
          // Fetching data using raw query
          res = await axios.get(`${apiUrl}/rawQuery/${searchValue}`);
        }

        console.log('res.data from Details.jsx', res.data);

        if (res.status !== 200) {
          throw new Error("Network error occurred");
        }

        setAiportData(res.data);
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
      {aiportData && <WeatherCard arrow={false} flightDetails={aiportData} />}
    </div>
  );
};

export default Details;
