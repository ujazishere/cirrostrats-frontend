import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime"; 
import { FlightCard, WeatherCard } from "../components/Combined";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl: ${apiUrl}`);

const LoadingWeatherCard = () => (
  <div className="card">
    {['D-ATIS', 'METAR', 'TAF'].map((section) => (
      <div key={section}>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">{section}</h3>
          <span className="card__depature__time">Loading...</span>
        </div>
        <div className="card__depature__details">
          <p>Loading weather data...</p>
        </div>
      </div>
    ))}
  </div>
);

const LoadingFlightCard = () => (
  <div className="details">
    <div className="details__card">
      <h3 className="details__card__title">Loading flight details...</h3>

      <div className="detail__body">
        {/* Departure Loading State */}
        <div className="detail__depature">
          <h3 className="detail__depature__title">Loading...</h3>
          <div className="detail__gate">
            <p className="detail__gate__title">Gate</p>
            <h3>Loading...</h3>
          </div>
          <div className="detail__depature__time">
            <p className="detail__depature__local">Scheduled Local</p>
            <h3>Loading...</h3>
          </div>
          <div className="detail__depature__utc__time">
            <p className="detail__depature__utc">UTC</p>
            <h3>Loading...</h3>
          </div>
        </div>

        {/* Arrival Loading State */}
        <div className="detail__arrival">
          <h3 className="detail__arrival__title">Loading...</h3>
          <div className="detail__gate">
            <p className="detail__gate__title">Gate</p>
            <h3>Loading...</h3>
          </div>
          <div className="detail__arrival__time">
            <p className="detail__arrival__local">Scheduled Local</p>
            <h3>Loading...</h3>
          </div>
          <div className="detail__arrival__utc__time">
            <p className="detail__arrival__utc">UTC</p>
            <h3>Loading...</h3>
          </div>
        </div>
      </div>
    </div>

    {/* Departure Weather Loading State */}
    <div className="table-container">
  <table className="flight_card" style={{ width: '100%' }}>
    <tbody>
      <LoadingWeatherCard />
    </tbody>
  </table>
</div>

    {/* Route Loading State */}
    <table className="route">
      <tbody>
        <tr>
          <th>ROUTE</th>
        </tr>
        <tr>
          <td>Loading route information...</td>
        </tr>
      </tbody>
    </table>

    {/* NAS Details Loading State */}
    <div className="nas-details">
      <h3>Airport Closure - Departure</h3>
      <p>Loading closure information...</p>
    </div>

    {/* Destination Weather Loading State */}
    <div className="table-container">
  <table className="flight_card" style={{ width: '100%' }}>
    <tbody>
      <LoadingWeatherCard />
    </tbody>
  </table>
</div>

    {/* NAS Details Destination Loading State */}
    <div className="nas-details">
      <h3>Airport Closure - Destination</h3>
      <p>Loading closure information...</p>
    </div>
  </div>
);

const Details = () => {
  const [airportWx, setAirportWx] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [UaDepDes, setUaDepDes] = useState(null);
  const [FlightStatsTZ, setFlightStatsTZ] = useState(null);
  const [FlightAwareReturns, setFlightAwareReturns] = useState(null);
  const [NASResponse, setNASResponse] = useState(null);
  const [WeatherResponse, setWeatherResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const searchValue = location?.state?.searchValue;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      console.log('searchValue in Details.jsx', searchValue);
      try {
        let res;
        if (searchValue?.id) {
          const airportId = searchValue.id;
          res = await axios.get(`${apiUrl}/airport/${airportId}`);
          console.log("Returning airportData");
          setAirportWx(res.data);
        } else {
          if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === 'true') {
            console.log("RETURNING TEST DATA");
            const res = await axios.get(`${apiUrl}/testDataReturns`);
            setFlightData(res.data);
            setWeatherResponse(res.data);
            setNASResponse(res.data);
            console.log("res.data", res.data);
          } else {
            const flightNumberQuery = searchValue?.flightNumber ? searchValue.flightNumber : searchValue;
            console.log("Couldn't find airport in the suggestion. Need to send to /rawQuery.", flightNumberQuery);

            const [depDesRes, flightStatsTZRes, flightAwareReturnsRes] = await Promise.all([
              axios.get(`${apiUrl}/DepartureDestination/${flightNumberQuery}`),
              axios.get(`${apiUrl}/DepartureDestinationTZ/${flightNumberQuery}`),
              axios.get(`${apiUrl}/flightAware/UA/${flightNumberQuery}`)
            ]);

            setUaDepDes(depDesRes.data);
            setFlightStatsTZ(flightStatsTZRes.data);
            setFlightAwareReturns(flightAwareReturnsRes.data);

            const [nasRes, depWeather, destWeather] = await Promise.all([
              axios.get(`${apiUrl}/NAS/${depDesRes.data.departure_ID}/${depDesRes.data.destination_ID}`),
              axios.get(`${apiUrl}/Weather/${depDesRes.data.departure_ID}`),
              axios.get(`${apiUrl}/Weather/${depDesRes.data.destination_ID}`),
            ]);

            const weatherRes = {
              'dep_weather': depWeather.data,
              'dest_weather': destWeather.data
            };

            setNASResponse(nasRes.data);
            setWeatherResponse(weatherRes);

            const combinedFlightData = {
              ...depDesRes.data,
              ...flightStatsTZRes.data,
              ...flightAwareReturnsRes.data,
              ...nasRes.data,
            };
            setFlightData(combinedFlightData);
          }
        }

        if (res && res.status !== 200) {
          throw new Error("Network error occurred");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (searchValue) fetchData();
  }, [searchValue]);

  return (
    <div className="details">
      <UTCTime />
      
      {searchValue?.id ? (
        <>
          <h3 className="weather__title">
            <span>Weather for </span> {airportWx?.name || searchValue.name}
          </h3>
          {isLoading ? (
            <LoadingWeatherCard />
          ) : (
            airportWx && (
              <WeatherCard
                arrow={false}
                title="Airport Weather"
                weatherDetails={airportWx}
              />
            )
          )}
        </>
      ) : (
        isLoading ? (
          <LoadingFlightCard />
        ) : (
          flightData && (
            <FlightCard
              flightDetails={flightData}
              dep_weather={WeatherResponse?.dep_weather}
              dest_weather={WeatherResponse?.dest_weather}
              nasDepartureResponse={NASResponse?.nas_departure_affected}
              nasDestinationResponse={NASResponse?.nas_destination_affected}
            />
          )
        )
      )}
    </div>
  );
};

export default Details;