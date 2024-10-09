import React, { useState, memo } from "react";
import { NavLink } from "react-router-dom";
import HighlightText from "./utility/HighlighText";
import { weatherData } from "./test";

console.log('this is working');

const WeatherCard = ({ arrow, title, routeCard, text, weatherDetails }) => {
  const [toggleCard, setToggleCard] = useState(false);
  console.log('INSIDE WEATHERCARD', weatherDetails);

  const weatherDataAtis = weatherData["d-atis"];
  const metar = weatherDetails?.metar;
  const taf = weatherDetails?.taf;
  const datis = weatherDetails?.datis;

  const coloredText = HighlightText({
    text: weatherDataAtis.dataString,
    highlightedPhrases: weatherDataAtis.highlight,
  });

  const handleToggleCard = () => {
    setToggleCard(prev => !prev);
  };

  if (routeCard) {
    return (
      <div className="card">
        <h3 className="card__title">
          {arrow ? "▼" : null} {title}
          <NavLink
            to="https://skyvector.com/?fpl=%20KEWR%20LANNA%20J48%20CSN%20FANPO%20Q40%20AEX%20DOOBI2%20KIAH"
            className="card__route__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Show on SkyVector Map
          </NavLink>
        </h3>
        <div className="card__route">
          <div className="card__route__text">{text}</div>
        </div>
      </div>
    );
  }

  if (weatherDetails) {
    return (
      <div className="card">
        <div>
          <div className="card__depature__subtitle card__header--dark">
            <h3 className="card__depature__subtitle__title">D-ATIS </h3>
            <span className="card__depature__time">34 mins ago</span>
          </div>
          <div className="card__depature__details">
            <p>{datis}</p>
          </div>
          <div className="card__depature__subtitle  card__header--dark">
            <h3 className="card__depature__subtitle__title">METAR</h3>
            <span className="card__depature__time">34 mins ago</span>
          </div>
          <div className="card__depature__details">
            <p>{metar}</p>
          </div>
          <div className="card__depature__subtitle  card__header--dark">
            <h3 className="card__depature__subtitle__title">TAF</h3>
            <span className="card__depature__time">166 mins ago</span>
          </div>
          <div className="card__depature__details">
            <p>{taf}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card__title" onClick={handleToggleCard}>
        {arrow ? "▼" : null} {title}
      </h3>

      <div className={toggleCard ? null : "card__body"}>
        <div className="card__depature__subtitle">
          <h3 className="card__depature__subtitle__title">D-ATIS </h3>
          <span className="card__depature__time">34 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p></p>
        </div>
        <div className="card__depature__subtitle">
          <h3 className="card__depature__subtitle__title">METAR</h3>
          <span className="card__depature__time">34 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p></p>
        </div>
        <div className="card__depature__subtitle">
          <h3 className="card__depature__subtitle__title">TAF</h3>
          <span className="card__depature__time">166 mins ago</span>
        </div>
        <div className="card__depature__details">
          <p></p>
        </div>
      </div>
    </div>
  );
};

const FlightCard = ({ flightDetails, dep_weather, dest_weather }) => {
  console.log('flightDetails in FlightCard.jsx', flightDetails);
  return (
    <div className="details">
      <div className="details__card">
        <h3 className="details__card__title">UA492 N37502</h3>

        <div className="detail__body">
          <div className="detail__depature">
            <h3 className="detail__depature__title">{flightDetails.departure_ID}</h3>

            <div className="detail__gate">
              <p className="detail__gate__title">Gate</p>
              <h3>{flightDetails.departure_gate}</h3>
            </div>
            <div className="detail__depature__time">
              <p className="detail__depature__local">Scheduled Local</p>
              <h3>05:40 EST</h3>
            </div>
            <div className="detail__depature__utc__time">
              <p className="detail__depature__utc">UTC</p>
              <h3>{flightDetails.scheduled_departure_time}</h3>
            </div>
          </div>

          <div className="detail__arrival">
            <h3 className="detail__arrival__title ">{flightDetails.destination_ID}</h3>

            <div className="detail__gate">
              <p className="detail__gate__title">Gate</p>
              <h3>{flightDetails.arrival_gate}</h3>
            </div>
            <div className="detail__arrival__time">
              <p className="detail__arrival__local"> Scheduled Local</p>
              <h3>08:49 CST</h3>
            </div>
            <div className="detail__arrival__utc__time">
              <p className="detail__arrival__utc">UTC</p>
              <h3>{flightDetails.scheduled_arrival_time}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Departure Weather */}
      <div className="table-container">
        <table className="flight_card">
          <tbody>
            {dep_weather ? (
              <WeatherCard arrow={false} title="Departure Weather" weatherDetails={dep_weather} />
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Route Link */}
      <table className="route">
        <tbody>
          <tr>
            <th>ROUTE Show on - SkyVector Map</th>
          </tr>
          <tr>
            <td>
              <a href={flightDetails.sv} target="_blank" rel="noopener noreferrer">
                Click here
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Additional Table */}
      <div className="table-wrapper">
        <table className="another-table">
          <thead>
            {/* Add table headers if necessary */}
          </thead>
          <tbody>
            <tr>
              <td colSpan="2"> dummy data </td>
            </tr>
            <tr>
              <td>dummy data</td>
              <td>dummy data</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Destination Weather */}
      <div className="table-container">
        <table className="flight_card">
          <tbody>
            {dest_weather ? (
              <WeatherCard arrow={false} title="Destination Weather" weatherDetails={dest_weather} />
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { FlightCard, WeatherCard };
