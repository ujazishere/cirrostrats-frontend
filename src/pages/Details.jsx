import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card";
import Dummy from "../components/Dummy";
import DetailCard from "../components/Cards/DetailCard";
import UTCTime from "../components/UTCTime"; // Import the UTC time component

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl${apiUrl}`);


const Details = () => {
  const [aiportData, setAiportData] = useState([]);
  const [flightData, setFlightData] = useState([]);
  const location = useLocation();
  const searchValue = location?.state?.searchValue;
  const noResults = location?.state?.noResults;
  useEffect(() => {
    async function fetchData() {

      // The purpose of this if was to send oddball search queries to the backend for processing.
      // This seems more complex than initially thought since noResults i always truthy 
      // Selecting an airport from a dropdown makes the filtered airports null which is causing it to be truthy all the time.
      // if (noResults) {
        // const res = await axios.get(`${apiUrl}/query/${searchValue}`); 
        
      // } else {
 
 
      const airportId = searchValue.id;
      console.log('SEARCH VALLLLLLL',searchValue)
      console.log('Details.jsx useEffect')
      // This gets the actual weather from backend using mongoDB.
      const res = await axios.get(`${apiUrl}/airport/${airportId}`); 
      console.log('RES',res.data)
      // TODO: set airportdata to res.data then use it on the Card component to display

      if (!res.status === 200) {
        throw new Error("network error occured");
      }

      setAiportData(res.data);
      // if there is flight data then setFlightData(res.data))

    }
    if (searchValue) fetchData();
  }, [searchValue]);

  return (
    <div className="details">
    <UTCTime /> {/* Add the UTC time component */}
      
      {/* The following code for Card component states that if airportData is truthy it will render the Card component */}
      {/* the && is the 'if' operator in this case checking if the airportData is truthy. */}
      {aiportData && <Card arrow={false} flightDetails={aiportData} />}
      {/* {aiportData && <Dummy arrow={false} flightDetails={aiportData} />} */}
      {/* {flightData && <Dummy arrow={false} flightDetails={aiportData} />} */}

    </div>
  );
};

export default Details;
