import axios from "axios";
import testJmsflights from './testJmsFlights.json';

const searchService = {
  /**
   * Fetch most searched items.
   * @param {string} userEmail
   */
  fetchMostSearched: async (userEmail, inputValue="", page=0, pageSize=10) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/searches/suggestions/${userEmail}?query=${inputValue}&page=${page}&page_size=${pageSize}`)
      // const response = await axios.get(`${apiUrl}/initialSuggestions/${userEmail}?query=${inputValue}&page=${page}`)
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // handle error, e.g., display error message to user
    }
    // const response = await axios.get(`${apiUrl}/searches/suggestions/${userEmail}`)
  },


  fetchJmsuggestions: () => {                 // fetch for testing in local dev.
    // fetchJmsuggestions: async () => {      // fetch (async) for production fetching.
    
    return testJmsflights;
    // const apiUrl = import.meta.env.VITE_JMS_URL;
    // console.log("fetching from", flights);
    // // actual fetch from jms
    // const response = await axios.get(`${apiUrl}/flights`);
    // console.log("response", response.data);
  },

  /**
   * Fetch search suggestions (airports, flight numbers, concourses).
   * @param {string} searchTerm
   * @param {string} userEmail
   * @param {boolean} isLoggedIn
   */
  fetchSuggestions: async (searchTerm, userEmail, isLoggedIn) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${apiUrl}/searches/suggestions/${userEmail}?q=${searchTerm}`);
    return response.data;
  },

  /**
   * Fetch airports matching the search term.
   * @param {string} searchTerm
   * @param {string} userEmail
   * @param {boolean} isLoggedIn
   */
  fetchAirports: async (searchTerm, userEmail, isLoggedIn) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${apiUrl}/airports`)
    return response.data;
  },

  /**
   * Fetch flight numbers matching the search term.
   * @param {string} searchTerm
   * @param {string} userEmail
   * @param {boolean} isLoggedIn
   */
  fetchFlightNumbers: async (searchTerm, userEmail, isLoggedIn) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${apiUrl}/flightNumbers`);
          
    return response.data;
  },

  /**
   * Fetch concourses matching the search term.
   * @param {string} searchTerm
   * @param {string} userEmail
   * @param {boolean} isLoggedIn
   */
  fetchConcourses: async (searchTerm, userEmail, isLoggedIn) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${apiUrl}/gates`);
    return response.data;
  },

  /**
   * Fetch raw query
   * @param {string} searchTerm
   * @param {string} userEmail
   * @param {boolean} isLoggedIn
   */
  fetchRawQuery: async (debouncedInputValue ) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${apiUrl}/query?search=${debouncedInputValue}`);
    return response.data;
  },
};

export default searchService;

// Custom hook for debouncing input value changes
// const searchService = async ( debouncedInputValue,userEmail, isLoggedIn) => {
//     const apiUrl = import.meta.env.VITE_API_URL;
//     print('apiUrl', apiUrl);
//     //   if (isFetched || isLoading) return;

//     //   setIsLoading(true);
//       try {
//         const response = await axios.get(
//             axios.get(`${apiUrl}/searches/suggestions/${userEmail}`),
//         );

//         return response.data
//       } catch (error) {
//         console.error("Error fetching data from backend:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }

// export default searchService

//   useEffect(() => {
//     const fetchData = async () => {
//       if (isFetched || isLoading) return;

//       setIsLoading(true);
//       try {
//         // TODO: This needs to be changed such that the data fetched is incremental instead of lumpsum
//         // This section fetches all data in parallel.
//         const [searchSuggestions] = await Promise.all([
//             axios.get(`${apiUrl}/searches/suggestions/${userEmail}`),
//           // axios.get(`${apiUrl}/airports`),
//           // axios.get(`${apiUrl}/flightNumbers`),
//           // axios.get(`${apiUrl}/gates`),
//         ]);

//         // const airportOptions = resAirports.data.map((airport) => ({
//         //   value: `${airport.name} (${airport.code})`,
//         //   label: `${airport.name} (${airport.code})`,
//         //   name: airport.name,
//         //   code: airport.code,
//         //   id: airport._id,
//         //   type: "airport",
//         // }));

//         // const flightNumberOptions = resFlightNumbers.data.map((f) => ({
//         //   value: f.flightNumber,
//         //   label: f.flightNumber,
//         //   flightNumber: f.flightNumber,
//         //   type: "flightNumber",
//         // }));

//         // const gateOptions = resGates.data.map((c) => ({
//         //   value: c.Gate,
//         //   label: c.Gate,
//         //   gate: c.Gate,
//         //   flightStatus: c.flightStatus,
//         //   type: "gate",
//         // }));
//         // print(gateOptions);

//         // setAirports(airportOptions);
//         // setFlightNumbers(flightNumberOptions);
//         // setGates(gateOptions);

//         setSearchSuggestions(searchSuggestions.data);
//         setIsFetched(true);
//       } catch (error) {
//         console.error("Error fetching data from backend:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);
  
//   return {searchSuggestions, isFetched, isLoading };

// };

// export default useFetchData;

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// // Custom hook for debouncing input value changes
// const useFetchData = (userEmail) => {
//   const [airports, setAirports] = useState([]);
//   const [flightNumbers, setFlightNumbers] = useState([]);
//   const [gates, setGates] = useState([]);
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [isFetched, setIsFetched] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
  
//   const apiUrl = import.meta.env.VITE_API_URL;
//   // print('apiUrl', apiUrl);

//   /**
//    * Initial data fetch effect
//    * Retrieves airports, flight numbers, and gates from the API when homepage is requested initially.
//    * Data is used for search dropdown selection
//    */
//   useEffect(() => {
//     const fetchData = async () => {
//       if (isFetched || isLoading) return;

//       setIsLoading(true);
//       try {
//         // TODO: This needs to be changed such that the data fetched is incremental instead of lumpsum
//         // This section fetches all data in parallel.
//         const [searchSuggestions] = await Promise.all([
//           // axios.get(`${apiUrl}/airports`),
//           // axios.get(`${apiUrl}/flightNumbers`),
//           // axios.get(`${apiUrl}/gates`),
//           axios.get(`${apiUrl}/searches/suggestions/${userEmail}`),
//         ]);

//         // const airportOptions = resAirports.data.map((airport) => ({
//         //   value: `${airport.name} (${airport.code})`,
//         //   label: `${airport.name} (${airport.code})`,
//         //   name: airport.name,
//         //   code: airport.code,
//         //   id: airport._id,
//         //   type: "airport",
//         // }));

//         // const flightNumberOptions = resFlightNumbers.data.map((f) => ({
//         //   value: f.flightNumber,
//         //   label: f.flightNumber,
//         //   flightNumber: f.flightNumber,
//         //   type: "flightNumber",
//         // }));

//         // const gateOptions = resGates.data.map((c) => ({
//         //   value: c.Gate,
//         //   label: c.Gate,
//         //   gate: c.Gate,
//         //   flightStatus: c.flightStatus,
//         //   type: "gate",
//         // }));
//         // print(gateOptions);

//         // setAirports(airportOptions);
//         // setFlightNumbers(flightNumberOptions);
//         // setGates(gateOptions);

//         setSearchSuggestions(searchSuggestions.data);
//         setIsFetched(true);
//       } catch (error) {
//         console.error("Error fetching data from backend:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);
  
//   return {searchSuggestions, isFetched, isLoading };

// };

// export default useFetchData;