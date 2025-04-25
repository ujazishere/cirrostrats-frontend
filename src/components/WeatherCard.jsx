import React from 'react';
import { highlightWeatherText } from "../components/utility/highlightWeatherText";
import Input from "../components/Input/Index"; // Ensure this path is correct

/**
 * Component to display weather information including D-ATIS, METAR, and TAF
 * @param {Object} props
 * @param {boolean} props.arrow - Display arrow indicator
 * @param {string} props.title - Card title
 * @param {Object} props.weatherDetails - Weather data object
 */
const WeatherCard = ({ arrow, title, weatherDetails }) => {
  const datis = weatherDetails?.datis;
  const metar = weatherDetails?.metar;
  const taf = weatherDetails?.taf;
  
  return (
    <div className="details">
      {/* Search Input Component at the very top */}
      <div className="combined-search">
        <Input userEmail="user@example.com" isLoggedIn={true} />
      </div>
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
    </div>
  );
};

export default WeatherCard;