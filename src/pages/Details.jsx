import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UTCTime from "../components/UTCTime";
import { FlightCard, WeatherCard, GateCard } from "../components/Combined";
import { LoadingFlightCard } from "../components/Skeleton";
import useAirportData from "../components/AirportData"; // Import the new custom hook
import flightService from '../components/utility/flightService';

// API base URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

const Details = () => {
  const location = useLocation();
  // TODO VHP TEST: This searchValue needs a detailed descripton of what this  search value could be, the type and usage
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
  // Airport data fetching is handled by the useAirportData hook.
  const {
    airportWx,
    nasResponseAirport,
    loadingWeather,
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

    // airportWx, nasResponseAirport, loadingWeather are handled by the useAirportData hook

    if (!searchValue) {
      return; // Exit early if no searchValue
    }

    const fetchData = async () => {
      try {
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true" && searchValue?.type === "flight") {
          setLoadingFlightData(true);
          const res = await axios.get(`${apiUrl}/testDataReturns`);
          console.log("!!TEST DATA!!", res.data);
          setFlightData(res.data.flightData || res.data);
          setWeatherResponseFlight(res.data.weatherResponse || res.data);
          setNasResponseFlight(res.data.nasResponse || res.data);
          // If test data needs to provide airportWx or gateData, it should be set here too.
          // e.g., setAirportWx(res.data.airportWx) // This would override the hook for test mode.
          setLoadingFlightData(false);

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
        // TODO VHP: searchValue as string is Redundant since raw query is fed through QC in backend - remove all `string` related items in this section.
        } else if (searchValue?.type === "flight" || (searchValue?.type === "N-Number")) {
          
          setLoadingFlightData(true);
          setFlightError(null);
          let flightID = null;
          
          if (searchValue?.flightID) {
            flightID = searchValue.flightID;
          } else if (searchValue?.nnumber) {
            flightID = searchValue.nnumber;
          } else if (searchValue?.value) {
            flightID = searchValue.value;
          }


          if (!flightID) {
            console.error("Could not determine Flight ID from searchValue:", searchValue);
            setFlightError("Invalid Flight ID provided.");
            setLoadingFlightData(false);
            return;
          }

          try {
            // Getting primary flight data from primary sources
            const {
              ajms, flightAwareRes, flightViewGateInfo, flightStatsTZRes
            } = await flightService.getPrimaryFlightData(flightID);

            // Basic check if all primary sources failed
            if (ajms.error && flightViewGateInfo.error && flightStatsTZRes.error && flightAwareRes.error && !Object.keys(ajms.data).length && !Object.keys(flightViewGateInfo.data).length ) {
                setFlightError(`Could not retrieve sufficient data for flight ${flightID}.`);
            }   

            // assigning airports depending on source.
            const { 
              departure, 
              arrival, 
              departureAlternate, 
              arrivalAlternate 
            } = flightService.getAirports({
              ajms,
              flightAwareRes,
              flightStatsTZRes,
              flightViewGateInfo
            });

            if (departure && arrival) {
            }
            
            // merging flight primary flight data.
            const combinedFlightData = {
              flightID: flightID,
              departure: departure,
              arrival: arrival,
              departureAlternate: departureAlternate,
              arrivalAlternate: arrivalAlternate,
              ...ajms.data,
              ...flightAwareRes.data,
              ...flightStatsTZRes.data,
              ...flightViewGateInfo.data,
            };
            setFlightData(combinedFlightData);

            if (departure && arrival) {

              const departureNASandWeather = await flightService.getWeatherAndNAS(departure)
              const arrivalNASandWeather = await flightService.getWeatherAndNAS(departure)
              if (departureAlternate){
                const departureAlternateNASandWeather = await flightService.getWeatherAndNAS(departure)
              }
              if (arrivalAlternate){
                const arrivalAlternateNASandWeather = await flightService.getWeatherAndNAS(departure)
              }

              setWeatherResponseFlight({
                departureWeatherMdb: departureNASandWeather.weather.mdb,
                departureWeatherLive: departureNASandWeather.weather.live,
                arrivalWeatherMdb: arrivalNASandWeather.weather.mdb,
                arrivalWeatherLive: arrivalNASandWeather.weather.live,
                departureAlternateWeatherMdb: departureAlternateNASandWeather?.weather.mdb || null,
                arrivalAlternateWeatherLive: arrivalAlternateNASandWeather?.weather.live || null,
              });

              setNasResponseFlight({
                departureNAS: departureNASandWeather.NAS,
                arrivalNAS: arrivalNASandWeather.NAS,
                departureAlternateNAS: departureAlternateNASandWeather?.NAS || null,
                arrivalAlternateNAS: arrivalAlternateNASandWeather?.NAS || null,
              }
              );
            
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
        // loadingWeather is handled by its hook
      }
    };

    fetchData();

  }, [searchValue, apiUrl]); // useEffect dependency, apiUrl passed to hook

  const renderContent = () => {
    const isFlightSearch = searchValue?.type === "flight" || searchValue.flightID;
    const isAirportSearch = searchValue?.type === "airport";
    const isGateSearch = searchValue?.type === "Terminal/Gate";
    const searchLabel = searchValue?.label || searchValue?.value || (typeof searchValue === 'string' && searchValue) || "";
    if (
      (isFlightSearch && loadingFlightData) ||
      (isAirportSearch && loadingWeather) ||
      (isGateSearch && loadingGateData)
    ) {
      return (
        <div>
          {isFlightSearch && <LoadingFlightCard />}
          {/* {isAirportSearch && <p>Loading airport information for {searchLabel}...</p>} */}
          {isGateSearch && <p>Loading gate information for {searchLabel}...</p>}
        </div>
      );
    }

    // Content display
    let contentFound = false;
    return (
      <>
        {isAirportSearch && airportWx &&(
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
            depAlternateWeather={weatherResponseFlight?.dep_weather}
            destAlternateWeather={weatherResponseFlight?.dest_weather}

            nasDepartureResponse={nasResponseFlight?.nas_affectred_departure}
            nasDestinationResponse={nasResponseFlight?.nas_affected_destination}
            nasDepartureAlternateResponse={nasResponseFlight?.nas_affectred_departure}
            nasArrivalAlternateResponse={nasResponseFlight?.nas_affected_destination}

            flightError={flightError} // Pass partial data error to FlightCard
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