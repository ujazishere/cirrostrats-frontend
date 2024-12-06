import React from "react";
import { NavLink } from "react-router-dom";
import NASDetails from "./NASDetails";

const highlightWeatherText = (text) => {
  if (!text) return "";
  const pinkPattern = /((M)?\d\/(\d)?\dSM)/g;
  const redPattern = /(BKN|OVC)(00[0-4])/g;
  const yellowPattern = /(BKN|OVC)(00[5-9])/g;
  const altimeterPattern = /(A\d{4})/g;
  
  return text
    .replace(pinkPattern, '<span class="pink_text_color">$1</span>')
    .replace(redPattern, '<span class="red_text_color">$1$2</span>')
    .replace(yellowPattern, '<span class="yellow_highlight">$1$2</span>')
    .replace(altimeterPattern, '<span class="box_around_text">$1</span>');
};

const WeatherCard = ({ arrow, title, weatherDetails }) => {
  const datis = weatherDetails?.datis;
  const metar = weatherDetails?.metar;
  const taf = weatherDetails?.taf;

  return (
    <div className="card">
      <div>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">D-ATIS</h3>
          <span className="card__depature__time">34 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(datis) }}></p>
        </div>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">METAR</h3>
          <span className="card__depature__time">34 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(metar) }}></p>
        </div>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">TAF</h3>
          <span className="card__depature__time">166 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p dangerouslySetInnerHTML={{ __html: highlightWeatherText(taf) }}></p>
        </div>
      </div>
    </div>
  );
};

const GateCard = ({ gateData }) => {
  return (
    <div className="card">
      <div>
        <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">Gate{gateData}</h3>
        </div>
      </div>
    </div>
  );
};

const FlightCard = ({ flightDetails, dep_weather, dest_weather, nasDepartureResponse, nasDestinationResponse }) => {
  console.log('FlightDetails received:', flightDetails);

  return (
    <div className="details">
      <div className="flight-details-card">
        <div className="flight-number">
          <h2 className="flight-number-text">{flightDetails?.flight_number}</h2>
          <span className="aircraft-number">N37502</span>
        </div>

        <div className="flight-info-container">
          <div className="airport-section">
            <div className="airport-code">{flightDetails?.departure_ID}</div>
            
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Terminal</div>
                <div className="info-value"></div>
              </div>
              
              <div className="info-item">
                <div className="info-label">Gate</div>
                <div className="info-value">{flightDetails?.departure_gate}</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">Scheduled Local</div>
                <div className="time-value">{flightDetails?.scheduled_departure_time}</div>
              </div>
            </div>
          </div>

          <div className="flight-path">
            <div className="airplane-icon"></div>
          </div>

          <div className="airport-section">
            <div className="airport-code">{flightDetails?.destination_ID}</div>
            
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Terminal</div>
                <div className="info-value"></div>
              </div>
              
              <div className="info-item">
                <div className="info-label">Gate</div>
                <div className="info-value">{flightDetails?.arrival_gate}</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">Scheduled Local</div>
                <div className="time-value">{flightDetails?.scheduled_arrival_time}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="sticky-header">
          <div className="card__depature__subtitle card__header--dark">
            <h3 className="card__depature__subtitle__title">Departure</h3>
          </div>
        </div>
        <table className="flight_card">
          <tbody>
            {dep_weather ? (
              <WeatherCard arrow={false} title="Departure Weather" weatherDetails={dep_weather} />
            ) : null}
          </tbody>
        </table>
      </div>

      {flightDetails?.route && flightDetails?.sv && (
        <table className="route">
          <tbody>
            <tr>
              <th>ROUTE<a href={flightDetails.sv} target="_blank" rel="noopener noreferrer">Show on - SkyVector Map</a></th>
            </tr>
            <tr>
              <td>{flightDetails.route}</td>
            </tr>
          </tbody>
        </table>
      )}

      <NASDetails nasResponse={nasDepartureResponse} title="Airport Closure - Departure" />

      <div className="table-container">
        <div className="sticky-header">
          <div className="card__destination__subtitle card__header--dark">
            <h3 className="card__destination__subtitle__title">Destination</h3>
          </div>
        </div>
        <table className="flight_card">
          <tbody>
            {dest_weather ? (
              <WeatherCard arrow={false} title="Destination Weather" weatherDetails={dest_weather} />
            ) : null}
          </tbody>
        </table>
      </div>

      <NASDetails nasResponse={nasDestinationResponse} title="Airport Closure - Destination" />
    </div>
  );
};

export { FlightCard, WeatherCard, GateCard };