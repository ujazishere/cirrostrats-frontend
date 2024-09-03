import React, { useState, memo } from "react";
import { NavLink } from "react-router-dom";
import HighlightText from "./utility/HighlighText";
import { weatherData } from "./test";

const WeatherCard = memo(({ arrow, title, routeCard, text, flightDetails }) => {
  const [toggleCard, setToggleCard] = useState(false);

  const weatherDataAtis = weatherData["d-atis"];
  const metar = flightDetails.metar;
  const taf = flightDetails.taf;
  const datis = flightDetails.datis;

  const coloredText = HighlightText({
    text: weatherDataAtis.dataString,
    highlightedPhrases: weatherDataAtis.highlight,
  });

  const handleToggleCard = () => {
    setToggleCard((prev) => !prev);
  };

  if (routeCard)
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

  if (weatherData) {
    const { METAR, TAF, D_ATIS, name } = flightDetails || {};
    return (
      <>
        <h3 className="weather__title">
          <span>Weather for </span> {name}
        </h3>

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
      </>
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
});

export default WeatherCard;