import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime"; 
import { FlightCard, WeatherCard, GateCard } from "../components/Combined";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`apiUrl: ${apiUrl}`);

// Add this CSS to your stylesheet
const styles = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-loader {
  background: linear-gradient(90deg, 
    #e0e0e0 0%, 
    #f5f5f5 50%, 
    #e0e0e0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const SkeletonLoader = ({ height, width }) => (
  <div
    style={{
      height: height || "1em",
      width: width || "100%",
      borderRadius: "4px",
      margin: "4px 0",
      overflow: "hidden" // Ensure shimmer stays within borders
    }}
    className="skeleton-loader"
  ></div>
);

const LoadingWeatherCard = () => (
  <div className="card">
    {['D-ATIS', 'METAR', 'TAF'].map((section) => (
      <div key={section}>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">{section}</h3>
          <SkeletonLoader width="30%" />
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

const LoadingFlightCard = () => (
  <div className="details">
    <div className="details__card">
      <SkeletonLoader height="2em" width="100%" />

      <div className="detail__body">
        <div className="detail__depature">
          <SkeletonLoader height="1.5em" width="70%" />
          <div className="detail__gate">
            <p className="detail__gate__title">Gate</p>
            <SkeletonLoader width="40%" />
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
      <table className="flight_card" style={{ width: '100%' }}>
        <tbody>
          <LoadingWeatherCard />
        </tbody>
      </table>
    </div>

    <table className="route">
      <tbody>
        <tr>
          <th>ROUTE</th>
        </tr>
        <tr>
          <td><SkeletonLoader width="90%" /></td>
        </tr>
      </tbody>
    </table>

    <div className="nas-details">
      <h3>Airport Closure - Departure</h3>
      <SkeletonLoader width="100%" height="1.5em" />
    </div>

    <div className="table-container">
      <table className="flight_card" style={{ width: '100%' }}>
        <tbody>
          <LoadingWeatherCard />
        </tbody>
      </table>
    </div>

    <div className="nas-details">
      <h3>Airport Closure - Destination</h3>
      <SkeletonLoader width="100%" height="1.5em" />
    </div>
  </div>
);

const Details = () => {
  const [airportWx, setAirportWx] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [gateData, setGateData] = useState(null);
  const [UaDepDes, setUaDepDes] = useState(null);
  const [FlightStatsTZ, setFlightStatsTZ] = useState(null);
  const [FlightAwareReturns, setFlightAwareReturns] = useState(null);
  const [NASResponse, setNASResponse] = useState(null);
  const [WeatherResponse, setWeatherResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  let searchValue = location?.state?.searchValue;
  
  const fetchAirportWxData = async (airportSerial) => {
    const res = await axios.get(`${apiUrl}/airport/${airportSerial}`);
    console.log("Returning airportWcData, airportSerial:", airportSerial);
    setAirportWx(res.data);
  }

  const fetchFlightData = async (flightNumberQuery) => {
    console.log("flightNumberQuery", flightNumberQuery);
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

  const fetchGateData = async (gate) => {
    const res = await axios.get(`${apiUrl}/gates`);
    console.log("Returning gateData, gate:", gate);
    setGateData(res.data);
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      console.log('searchValue in Details.jsx', searchValue);
      try {
        let res;
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === 'true') {
          console.log("RETURNING TEST DATA");
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          setFlightData(res.data);
          setWeatherResponse(res.data);
          setNASResponse(res.data);
          console.log("res.data", res.data);
        } else if (searchValue?.type === "airport") {
          fetchAirportWxData(searchValue.id);
        } else if (searchValue?.type === "gate") {
          fetchGateData(searchValue.id);
        } else if (searchValue?.type === "flightNumber") {
          fetchFlightData(searchValue.flightNumber);
        } else {
          const flightNumberQuery = searchValue?.flightNumber ? searchValue.flightNumber : searchValue;
          console.log("Couldn't find airport\\flightNumber\\gate in the suggestion. Need to send to /rawQuery.", flightNumberQuery);
          searchValue = {flightNumber: flightNumberQuery, type: 'flightNumber'};
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
      
      {searchValue?.type === "airport" ? (
        // This is the weather component that shows only DATIS, METAR, and TAF for the airport. Has a loading component
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
      ) : searchValue?.type === "gate" ?  (
        // This renders the gate component still work in progress
        <GateCard gateDetails={searchValue} />
      ) : searchValue?.type === "flightNumber" || searchValue ? (
        // This renders the flight card if its loading it returns the flight loader component and when data is available it will load the flight card
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
      ) : (
        // Fallback for any other type or default case
          <div className="card">
            {['No Results', 'No Results', 'No Results'].map((section) => (
              <div key={section}>
                <div className="card__depature__subtitle card__header--dark">
                  <h3 className="card__depature__subtitle__title">{section}</h3>
                  <SkeletonLoader width="30%" />
                </div>
                <div className="card__depature__details">
                  <SkeletonLoader width="80%" />
                  <SkeletonLoader width="60%" />
                  <SkeletonLoader width="90%" />
                </div>
              </div>
            ))}
          </div>
        )
      } 
    </div>
  );
};

export default Details;