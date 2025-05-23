import React, { useState, useEffect } from "react";
import axios from "axios";
// import {searchServices} from "../api/searchservice";

// Custom hook for debouncing input value changes
const useFetchData = (userEmail) => {
  const [airports, setAirports] = useState([]);
  const [flightNumbers, setFlightNumbers] = useState([]);
  const [gates, setGates] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // print('apiUrl', apiUrl);

  /**
   * Initial data fetch effect
   * Retrieves airports, flight numbers, and gates from the API when homepage is requested initially.
   * Data is used for search dropdown selection
   */
  useEffect(() => {
    const fetchData = async () => {
      if (isFetched || isLoading) return;

      setIsLoading(true);
      try {
        // This section fetches all data in parallel.
        const [searchSuggestions] = await Promise.all([
          // axios.get(`${apiUrl}/airports`),
          // axios.get(`${apiUrl}/flightNumbers`),
          // axios.get(`${apiUrl}/gates`),
          axios.get(`${apiUrl}/searches/suggestions/${userEmail}`),
        ]);

        // const airportOptions = resAirports.data.map((airport) => ({
        //   value: `${airport.name} (${airport.code})`,
        //   label: `${airport.name} (${airport.code})`,
        //   name: airport.name,
        //   code: airport.code,
        //   id: airport._id,
        //   type: "airport",
        // }));

        // const flightNumberOptions = resFlightNumbers.data.map((f) => ({
        //   value: f.flightNumber,
        //   label: f.flightNumber,
        //   flightNumber: f.flightNumber,
        //   type: "flightNumber",
        // }));

        // const gateOptions = resGates.data.map((c) => ({
        //   value: c.Gate,
        //   label: c.Gate,
        //   gate: c.Gate,
        //   flightStatus: c.flightStatus,
        //   type: "gate",
        // }));
        // print(gateOptions);

        // setAirports(airportOptions);
        // setFlightNumbers(flightNumberOptions);
        // setGates(gateOptions);

        setSearchSuggestions(searchSuggestions.data);
        setIsFetched(true);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  return {searchSuggestions, isFetched, isLoading };

};

export default useFetchData;