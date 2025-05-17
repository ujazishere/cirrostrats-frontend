import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime";
import { FlightCard, WeatherCard, GateCard } from "../components/Combined";
import { LoadingFlightCard } from "../components/Skeleton";
import useAirportData from "../components/AirportData"; // Import the new custom hook

// API base URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

const Details = () => {
  const location = useLocation();
  const searchValue = location?.state?.searchValue;

  // States for flight data
  const [flightData, setFlightData] = useState(null);
  const [loadingFlightData, setLoadingFlightData] = useState(false);
  const [weatherResponseFlight, setWeatherResponseFlight] = useState(null);
  const [nasResponseFlight, setNasResponseFlight] = useState(null);
  const [flightError, setFlightError] = useState(null);


  // States for gate data
  const [gateData, setGateData] = useState(null);
  const [loadingGateData, setLoadingGateData] = useState(false);
  const [gateError, setGateError] = useState(null);

  // Use the custom hook for airport data
  const {
    airportWx,
    nasResponseAirport,
    loadingAirportDetails,
    // airportError // airportError is available from the hook if needed for UI
  } = useAirportData(searchValue, apiUrl);

  // Overall loading state for the component might not be strictly needed
  // if individual loading states are handled in renderContent

  useEffect(() => {
    // Reset states on new search value
    setFlightData(null);
    setWeatherResponseFlight(null);
    setNasResponseFlight(null);
    setFlightError(null);
    setLoadingFlightData(false);

    setGateData(null);
    setGateError(null);
    setLoadingGateData(false);

    // airportWx, nasResponseAirport, loadingAirportDetails are handled by the useAirportData hook

    if (!searchValue) {
      return; // Exit early if no searchValue
    }

    const fetchData = async () => {
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          setLoadingFlightData(true);
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          console.log("!!TEST DATA!!", res.data);
          setFlightData(res.data.flightData || res.data);
          setWeatherResponseFlight(res.data.weatherResponse || res.data);
          setNasResponseFlight(res.data.nasResponse || res.data);
          // If test data needs to provide airportWx or gateData, it should be set here too.
          // e.g., setAirportWx(res.data.airportWx) // This would override the hook for test mode.
          setLoadingFlightData(false);

        } else if (searchValue?.type === "airport") {
          // Airport data fetching is handled by the useAirportData hook.
          // loadingAirportDetails will be true via the hook.
          // setLoadingFlightData(false) and setLoadingGateData(false) are already defaults.
        } else if (searchValue?.type === "Terminal/Gate") {
          setLoadingGateData(true);
          try {
            const res = await axios.get(`${apiUrl}/gates/${searchValue.id}`);
            setGateData(res.data);
          } catch (e) {
            console.error("Gate Data Error:", e.response?.data || e.message);
            setGateError(e.response?.data || e.message);
          } finally {
            setLoadingGateData(false);
          }
        } else if (searchValue?.type === "flight" || (searchValue && typeof searchValue === 'string') || (searchValue && !searchValue.type)) {
          setLoadingFlightData(true);
          setFlightError(null);
          let flightID = null;
          if (searchValue?.flightID) {
            flightID = searchValue.flightID;
          } else if (typeof searchValue === 'string') {
            flightID = searchValue;
          } else if (searchValue?.value) { // From react-select or similar
            flightID = searchValue.value;
          }


          if (!flightID) {
            console.error("Could not determine Flight ID from searchValue:", searchValue);
            setFlightError("Invalid Flight ID provided.");
            setLoadingFlightData(false);
            return;
          }

          try {
            const [ajms, flightViewGateInfo, flightStatsTZRes, flightAwareRes] = await Promise.all([
              axios.get(`${apiUrl}/ajms/${flightID}`).catch(e => { console.error("AJMS Error:", e); return { data: {}, error: true }; }),
              axios.get(`${apiUrl}/flightViewGateInfo/${flightID}`).catch(e => { console.error("FlightViewGateInfo Error:", e); return { data: {}, error: true }; }),
              axios.get(`${apiUrl}/flightStatsTZ/${flightID}`).catch(e => { console.error("FlightStatsTZ Error:", e); return { data: {}, error: true }; }),
              axios.get(`${apiUrl}/flightAware/UA/${flightID}`).catch(e => { console.error("FlightAware Error:", e); return { data: {}, error: true }; }), // TODO: Airline code might need to be dynamic
            ]);

            // Basic check if all primary sources failed
            if (ajms.error && flightViewGateInfo.error && flightStatsTZRes.error && flightAwareRes.error && !Object.keys(ajms.data).length && !Object.keys(flightViewGateInfo.data).length ) {
                setFlightError(`Could not retrieve sufficient data for flight ${flightID}.`);
            }


            let departure, arrival;
            if (ajms.data?.arrival && ajms.data?.departure) {
              departure = ajms.data.departure;
              arrival = ajms.data.arrival;
            } else {
              departure = flightStatsTZRes.data?.flightStatsOrigin || flightViewGateInfo.data?.flightViewDeparture || null;
              arrival = flightStatsTZRes.data?.flightStatsDestination || flightViewGateInfo.data?.flightViewDestination || null;
            }

            const combinedFlightData = {
              flightID: flightID,
              departure: departure,
              arrival: arrival,
              ...ajms.data,
              ...flightViewGateInfo.data,
              ...flightStatsTZRes.data,
              ...flightAwareRes.data,
            };
            setFlightData(combinedFlightData);

            if (departure && arrival) {
              const [nasRes, depWeatherLive, destWeatherLive, depWeatherMdb, destWeatherMdb] = await Promise.all([
                axios.get(`${apiUrl}/NAS/${departure}/${arrival}`).catch(e => { console.error("Flight NAS Error:", e); return { data: {} }; }),
                axios.get(`${apiUrl}/liveAirportWeather/${departure}`).catch(e => { console.warn(`Live Dep Weather Error for ${departure}:`, e.response?.data); return { data: null }; }),
                axios.get(`${apiUrl}/liveAirportWeather/${arrival}`).catch(e => { console.warn(`Live Dest Weather Error for ${arrival}:`, e.response?.data); return { data: null }; }),
                axios.get(`${apiUrl}/mdbAirportWeather/${departure}`).catch(e => { console.warn(`MDB Dep Weather Error for ${departure}:`, e.response?.data); return { data: null }; }),
                axios.get(`${apiUrl}/mdbAirportWeather/${arrival}`).catch(e => { console.warn(`MDB Dest Weather Error for ${arrival}:`, e.response?.data); return { data: null }; }),
              ]);

              setWeatherResponseFlight({
                dep_weather: depWeatherLive.data || depWeatherMdb.data,
                dest_weather: destWeatherLive.data || destWeatherMdb.data,
              });
              setNasResponseFlight(nasRes.data);
            } else if (Object.keys(combinedFlightData).length > 2) { // flightID, departure, arrival are 3 keys minimum if flight is somewhat valid
              console.warn("Departure or arrival airport code missing for flightID", flightID, "Cannot fetch detailed weather/NAS for flight.");
            } else {
                // If no departure/arrival and minimal data, it might indicate a failed flight lookup overall
                if (!flightError) setFlightError(`Limited data for flight ${flightID}. Departure/Arrival info missing.`);
            }
          } catch (e) {
            console.error("Error fetching flight details bundle:", e);
            setFlightError(`Failed to fetch details for flight ${flightID}.`);
          } finally {
            setLoadingFlightData(false);
          }
        } else {
          console.warn("Unknown or unhandled search type:", searchValue?.type);
          // Potentially set a generic error or state here
        }
      } catch (error) { // Catch errors from the outer try block (e.g., test data fetching)
        console.error("Error in fetchData outer block:", error);
        // Ensure loading states are false if a top-level error occurs
        setLoadingFlightData(false);
        setLoadingGateData(false);
        // loadingAirportDetails is handled by its hook
      }
    };

    fetchData();

  }, [searchValue, apiUrl]); // useEffect dependency, apiUrl passed to hook

  const renderContent = () => {
    const isFlightSearch = searchValue?.type === "flight" || (searchValue && typeof searchValue === 'string') || (searchValue && !searchValue.type && (searchValue.flightID || searchValue.value));
    const isAirportSearch = searchValue?.type === "airport";
    const isGateSearch = searchValue?.type === "Terminal/Gate";
    const searchLabel = searchValue?.label || searchValue?.value || (typeof searchValue === 'string' && searchValue) || "";


    if (isFlightSearch && loadingFlightData) {
      return <LoadingFlightCard />;
    }
    if (isAirportSearch && loadingAirportDetails) {
      return <p>Loading airport information for {searchLabel}...</p>;
    }
    if (isGateSearch && loadingGateData) {
      return <p>Loading gate information for {searchLabel}...</p>;
    }

    // Error display
    if (isFlightSearch && flightError && !flightData) { // Show error if flight data fetch failed significantly
        return <p>Error fetching flight data: {typeof flightError === 'string' ? flightError : `Failed to load data for ${searchLabel}`}</p>;
    }
    // airportError can be displayed similarly if needed:
    // if (isAirportSearch && airportError && !airportWx) {
    //   return <p>Error fetching airport data for {searchLabel}.</p>;
    // }
    if (isGateSearch && gateError && !gateData) {
        return <p>Error fetching gate data for {searchLabel}.</p>;
    }


    // Content display
    let contentFound = false;
    return (
      <>
        {airportWx && isAirportSearch && (
          (contentFound = true),
          // For an airport search, NAS data is passed directly to WeatherCard
          // Assuming WeatherCard can handle `nasDetails` for a single airport.
          // The original code had a TODO: "Need to show this component in the weather card."
          <WeatherCard title={`Weather for ${airportWx.name || searchLabel}`} weatherDetails={airportWx} nasDetails={nasResponseAirport} />
        )}

        {gateData && isGateSearch && (
          (contentFound = true),
          <GateCard gateData={gateData} currentSearchValue={searchValue} />
        )}

        {flightData && isFlightSearch && (
          (contentFound = true),
          <FlightCard
            flightData={flightData}
            dep_weather={weatherResponseFlight?.dep_weather}
            dest_weather={weatherResponseFlight?.dest_weather}
            nasDepartureResponse={nasResponseFlight?.nas_departure_affected}
            nasDestinationResponse={nasResponseFlight?.nas_destination_affected}
            flightError={flightError} // Pass partial data error to FlightCard
          />
        )}

        {!loadingFlightData && !loadingAirportDetails && !loadingGateData && !contentFound && searchValue && (
          <p>No information found for your search: {searchLabel}</p>
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