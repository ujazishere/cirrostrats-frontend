import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime"; // Import the UTC time component
import { FlightCard, WeatherCard } from "../components/Combined";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl: ${apiUrl}`);


const testData = false;      // Use this as true to instantantly return test data to test the design building process. make false to return real data


const Details = () => {
  const [airportWx, setAirportWx] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [UaDepDes, setUaDepDes] = useState(null);
  const [FlightStatsTZ, setFlightStatsTZ] = useState(null);
  const [FlightAwareReturns, setFlightAwareReturns] = useState(null);
  const [NASResponse, setNASResponse] = useState(null);
  const [WeatherResponse, setWeatherResponse] = useState(null);

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
          console.log("Returning airportData");
          setAirportWx(res.data);
        } else {
          
          if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === 'true') {   // This triggers the TEST DATA returns
            console.log("RETURNING TEST DATA");
            const res = await axios.get(`${apiUrl}/testDataReturns`);           // Raw query request
            setFlightData(res.data);
            setWeatherResponse(res.data);
            setNASResponse(res.data);
            console.log("res.data", res.data);
            return;
          } else {              // This triggers the REAL DATA returns
            const flightNumberQuery = searchValue?.flightNumber ? searchValue.flightNumber : searchValue;
            console.log("Couldn't find airport in the suggestion. Sending to /rawQuery.", flightNumberQuery);

            // Fetching data using raw query
            const [resRawQuery, depDesRes, flightStatsTZRes, flightAwareReturnsRes] = await Promise.all([
              axios.get(`${apiUrl}/rawQuery/${flightNumberQuery}`),           // Raw query request
              axios.get(`${apiUrl}/DepartureDestination/${flightNumberQuery}`), // Departure/Destination request
              axios.get(`${apiUrl}/DepartureDestinationTZ/${flightNumberQuery}`), // Timezone request 1
              axios.get(`${apiUrl}/flightAware/UA/${flightNumberQuery}`)        // FlightAware request
            ]);

            console.log("DepDes", depDesRes.data.destination_ID);
            console.log("flightStatsTZ", flightStatsTZRes.data);
            
            // Now send multiple requests based on depDesRes data fields
            const [nasRes, weatherRes] = await Promise.all([
              axios.get(`${apiUrl}/NAS/${depDesRes.data.departure_ID}/${depDesRes.data.destination_ID}`),
              axios.get(`${apiUrl}/Weather/${depDesRes.data.departure_ID}/${depDesRes.data.destination_ID}`),
            ]);
            setUaDepDes(depDesRes.data);
            setFlightStatsTZ(flightStatsTZRes.data);
            setFlightAwareReturns(flightAwareReturnsRes.data);
            setNASResponse(nasRes.data);
            setWeatherResponse(weatherRes.data);

            console.log("weatherRes", weatherRes.data); 
            const combinedFlightData = {
              ...resRawQuery.data,    // Use this to only get the test flight data. Comment all others out to speed up the design building process.
              ...depDesRes.data,
              ...flightStatsTZRes.data,
              ...flightAwareReturnsRes.data,
              ...nasRes.data,
              // ...weatherRes.data
            };         
            // setFlightData(resRawQuery.data);        }
            setFlightData(combinedFlightData);
          }
        }

        console.log('res.data from Details.jsx', res?.data, airportWx);

        if (res && res.status !== 200) {
          throw new Error("Network error occurred");
        }

        // If there is flight data, it has already been set above.
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
      
      {/* Render WeatherCard if searching for an airport */}
      {searchValue?.id && airportWx && (
        <>
          <h3 className="weather__title">
            <span>Weather for </span> {airportWx.name}
          </h3>
          <WeatherCard
            arrow={false}
            title="Airport Weather"
            weatherDetails={airportWx} // Ensure airportWx contains metar, taf, datis
          />
        </>
      )}

      {/* Render FlightCard if searching for a flight number */}
      {!searchValue?.id && flightData && (
        <FlightCard
          flightDetails={flightData}
          dep_weather={WeatherResponse?.dep_weather}
          dest_weather={WeatherResponse?.dest_weather}
          nasDepartureResponse={NASResponse?.nas_departure_affected}
          nasDestinationResponse={NASResponse?.nas_destination_affected}
        />
      )}
    </div>
  );
};

export default Details;