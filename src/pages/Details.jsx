import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime";
import { FlightCard, WeatherCard, GateCard } from "../components/Combined";

const apiUrl = import.meta.env.VITE_API_URL;

// Skeleton Loader Component
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

// Loading Weather Card Component
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

// Loading Flight Details Component
const LoadingFlightCard = () => (
  <div className="details">
    {/* Flight Info Section */}
    <div className="details__card">
      <SkeletonLoader height="2em" width="100%" />
      
      <div className="detail__body">
        {/* Departure Section */}
        <div className="detail__depature">
          <SkeletonLoader height="1.5em" width="70%" />
          <div className="detail__gate">
            <p className="detail__gate__title">Gate</p>
            <SkeletonLoader width="100%" />
          </div>
          <SkeletonLoader width="60%" />
          <SkeletonLoader width="60%" />
        </div>

        {/* Arrival Section */}
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

    {/* Departure Weather Section */}
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

    {/* Route Section */}
    <table className="route">
      <tbody>
        <tr>
          <th></th>
        </tr>
        <tr>
          <td><SkeletonLoader width="90%" /></td>
        </tr>
      </tbody>
    </table>

    {/* NAS Departure Section */}
    <div className="nas-details">
      <h3></h3>
      <SkeletonLoader width="100%" height="1.5em" />
    </div>

    {/* Destination Weather Section */}
    <div className="table-container">
      <div className="sticky-header">
        <div className="card__destination__subtitle card__header--dark">
          <h3 className="card__destination__subtitle__title"></h3>
        </div>
      </div>
      <table className="flight_card">
        <tbody>
          <LoadingWeatherCard />
        </tbody>
      </table>
    </div>

    {/* NAS Destination Section */}
    <div className="nas-details">
      <h3></h3>
      <SkeletonLoader width="100%" height="1.5em" />
    </div>
  </div>
);

const Details = () => {
  const [airportWx, setAirportWx] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [gateData, setGateData] = useState(null);
  const [weatherResponse, setWeatherResponse] = useState(null);
  const [nasResponse, setNasResponse] = useState(null);
  const [loadingFlightData, setLoadingFlightData] = useState(true);
  const [NASResponse, setNASResponse] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingNAS, setLoadingNAS] = useState(true);

  const location = useLocation();
  let searchValue = location?.state?.searchValue;

  useEffect(() => {
    async function fetchData() {
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === 'true') {   // This triggers the TEST DATA returns
            console.log("RETURNING TEST DATA");
            const res = await axios.get(`${apiUrl}/testDataReturns`);           // Raw query request
            setFlightData(res.data);
            setWeatherResponse(res.data);
            setNASResponse(res.data);
            console.log("res.data", res.data);
            return;
        } else if (searchValue?.type === "airport") {
          const res = await axios.get(`${apiUrl}/airport/${searchValue.id}`);
          setAirportWx(res.data);
          setLoadingWeather(false);
        } else if (searchValue?.type === "gate") {
          const res = await axios.get(`${apiUrl}/gates`);
          setGateData(res.data);
          setLoadingWeather(false);
        } else if (searchValue?.type === "flightNumber" || searchValue) {
          const flightNumberQuery = searchValue?.flightNumber || searchValue;

          const [depDesRes, flightStatsTZRes, flightAwareRes] = await Promise.all([
            axios.get(`${apiUrl}/DepartureDestination/${flightNumberQuery}`),
            axios.get(`${apiUrl}/DepartureDestinationTZ/${flightNumberQuery}`),
            axios.get(`${apiUrl}/flightAware/UA/${flightNumberQuery}`)
          ]);

          setFlightData({
            ...depDesRes.data,
            ...flightStatsTZRes.data,
            ...flightAwareRes.data
          });
          setLoadingFlightData(false);

          const [nasRes, depWeather, destWeather] = await Promise.all([
            axios.get(`${apiUrl}/NAS/${depDesRes.data.departure_ID}/${depDesRes.data.destination_ID}`),
            axios.get(`${apiUrl}/Weather/${depDesRes.data.departure_ID}`),
            axios.get(`${apiUrl}/Weather/${depDesRes.data.destination_ID}`)
          ]);

          setWeatherResponse({
            dep_weather: depWeather.data,
            dest_weather: destWeather.data
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

  const renderContent = () => {
    if (loadingFlightData && searchValue?.type === "flightNumber") {
      return <LoadingFlightCard />;
    }

    return (
      <>
        {airportWx && <WeatherCard title="Airport Weather" weatherDetails={airportWx} />}
        {gateData && <GateCard gateData={searchValue} />}
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
