import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime";
import { FlightCard, WeatherCard, GateCard } from "../components/Combined";

// API base URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// Skeleton Loader Component: Displays a shimmering effect to indicate loading
const SkeletonLoader = ({ height, width }) => (
  <div
    style={{
      height: height || "1em",
      width: width || "100%",
      borderRadius: "4px",
      margin: "4px 0",
      background: "linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%)",
      backgroundSize: "1000px 100%",
      animation: "shimmer 3s infinite linear",
      overflow: "hidden",
    }}
    className="skeleton-loader"
  />
);

// LoadingWeatherCard: Displays a skeleton loader for weather-related information
const LoadingWeatherCard = () => (
  <div className="card">
    {[1, 2, 3].map((section) => (
      <div key={section}>
        <div className="card__depature__subtitle card__header--dark">
          <SkeletonLoader width="100%" />
        </div>
        <div className="card__depature__details">
          <SkeletonLoader width="80%" />
          <SkeletonLoader width="60%" />
          <SkeletonLoader width="90%" />
        </div>
      </div>
    ))}
  </div>
);

// LoadingFlightCard: Displays a skeleton loader for flight-related details
const LoadingFlightCard = () => (
  <div className="details">
    <div className="details__card">
      <SkeletonLoader height="2em" width="100%" />
      <div className="detail__body">
        <div className="detail__depature">
          <SkeletonLoader height="1.5em" width="70%" />
          <div className="detail__gate">
            <p className="detail__gate__title">Gate</p>
            <SkeletonLoader width="100%" />
          </div>
          <SkeletonLoader width="60%" />
          <SkeletonLoader width="60%" />
        </div>
        <div className="detail__arrival">
          <SkeletonLoader height="1.5em" width="70%" />
          <div className="detail__gate">
            <p className="detail__gate__title">Gate</p>
            <SkeletonLoader width="40%" />
          </div>
          <SkeletonLoader width="60%" />
          <SkeletonLoader width="60%" />
        </div>
      </div>
    </div>
    <div className="table-container">
      <div className="sticky-header">
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title"></h3>
        </div>
      </div>
      <table className="flight_card">
        <tbody>
          <LoadingWeatherCard />
        </tbody>
      </table>
    </div>
  </div>
);

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
  const searchValue = location?.state?.searchValue; // Extract search value from the location state

  // Effect to fetch data based on search type
  useEffect(() => {
    async function fetchData() {
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          // Fetch test data(for frontend development efficiency) if the environment variable for test data is set to true
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          setFlightData(res.data);
          setWeatherResponse(res.data);
          setNasResponse(res.data);

        } else if (searchValue?.type === "Airport") {
          // search query is an airport and returns airport weather component
          const res = await axios.get(`${apiUrl}/airport/${searchValue.mdb}`);
          setAirportWx(res.data);
          setLoadingWeather(false);

        } else if (searchValue?.type === "Terminal/Gate") {
          // search query is a gate type and returns airport weather component
          const res = await axios.get(`${apiUrl}/gates`);
          setGateData(res.data);

        } else if (searchValue?.type === "flightNumber" || searchValue) {
          // search query is a flight number - fetches flight data using flight number and serves FlightCard component
          const flightNumberQuery = searchValue?.flightNumber || searchValue;
          const [depDesRes, flightStatsTZRes, flightAwareRes] = await Promise.all([
            axios.get(`${apiUrl}/DepartureDestination/${flightNumberQuery}`),
            axios.get(`${apiUrl}/DepartureDestinationTZ/${flightNumberQuery}`),
            axios.get(`${apiUrl}/flightAware/UA/${flightNumberQuery}`),
          ]);
          setFlightData({
            ...depDesRes.data,
            ...flightStatsTZRes.data,
            ...flightAwareRes.data,
          });
          setLoadingFlightData(false);

          const [nasRes, depWeather, destWeather] = await Promise.all([
            axios.get(`${apiUrl}/NAS/${depDesRes.data.departure_ID}/${depDesRes.data.destination_ID}`),
            axios.get(`${apiUrl}/Weather/${depDesRes.data.departure_ID}`),
            axios.get(`${apiUrl}/Weather/${depDesRes.data.destination_ID}`),
          ]);

          setWeatherResponse({
            dep_weather: depWeather.data,
            dest_weather: destWeather.data,
          });
          setNasResponse(nasRes.data);
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
    if (loadingFlightData && searchValue?.type === "flightNumber") {
      return <LoadingFlightCard />;
    }
    return (
      <>
        {airportWx && <WeatherCard title="Airport Weather" weatherDetails={airportWx} />}
        {gateData && <GateCard gateData={searchValue.id} />}
        {flightData && (
          <FlightCard
            flightDetails={flightData}
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
