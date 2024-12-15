import React, { useEffect } from 'react';
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
      <h3 className="card__depature__subtitle card__header--dark">{gateData.gate} Departures</h3>
      <div className="card__depature__subtitle card__header--dark">
        {gateData && gateData.flightStatus ? (
          <table>
            <thead>
              <tr>
                <th>Flight Number</th>
                <th>Scheduled</th>
                <th>Actual </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gateData.flightStatus).map(([flightNumber, details]) => (
                <tr key={flightNumber}>
                  <td>{flightNumber}</td>
                  <td>{details.scheduledDeparture || 'None'}</td>
                  <td>{details.actualDeparture || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No flight status data available</p>
        )}
      </div>
    </div>
  );
};

const FlightCard = ({ flightDetails, dep_weather, dest_weather, nasDepartureResponse, nasDestinationResponse }) => {
  useEffect(() => {
    const handleScroll = () => {
      // Only run on mobile devices
      if (window.innerWidth > 768) return;

      const departureHeader = document.getElementById('departure-header');
      const destinationHeader = document.getElementById('destination-header');
      
      if (!departureHeader || !destinationHeader) return;

      const departureSection = document.getElementById('departure-section');
      const destinationSection = document.getElementById('destination-section');
      
      const departureRect = departureSection.getBoundingClientRect();
      const destinationRect = destinationSection.getBoundingClientRect();
      
      // Add or remove sticky classes based on scroll position
      if (destinationRect.top <= 60) {
        departureHeader.classList.remove('sticky');
        destinationHeader.classList.add('sticky');
      } else if (departureRect.top <= 60) {
        departureHeader.classList.add('sticky');
        destinationHeader.classList.remove('sticky');
      } else {
        departureHeader.classList.remove('sticky');
        destinationHeader.classList.remove('sticky');
      }
    };

    // Add resize listener to handle orientation changes
    const handleResize = () => {
      if (window.innerWidth > 768) {
        const departureHeader = document.getElementById('departure-header');
        const destinationHeader = document.getElementById('destination-header');
        if (departureHeader) departureHeader.classList.remove('sticky');
        if (destinationHeader) destinationHeader.classList.remove('sticky');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
            <br />
            <div className="info-item">
              <div className="info-label">Gate</div>
              <div className="info-value">{flightDetails?.departure_gate}</div>
            </div>
            <br />
            <div className="info-item">
              <div className="info-label">Scheduled Local</div>
              <div className="time-value">{flightDetails?.scheduled_departure_time}</div>
            </div>
            <br />
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Scheduled In</div>
                <div className="info-value">{flightDetails?.scheduled_in}</div>
              </div>
            </div>
          </div>

          <div className="flight-path">
            <div className="airplane-icon"></div>
          </div>

          <div className="airport-section">
            <div className="airport-code">{flightDetails?.destination_ID}</div>
            <br />
            <div className="info-item">
              <div className="info-label">Gate</div>
              <div className="info-value">{flightDetails?.arrival_gate}</div>
            </div>
            <br />
            <div className="info-item">
              <div className="info-label">Scheduled Local</div>
              <div className="time-value">{flightDetails?.scheduled_arrival_time}</div>
            </div>
            <br />
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Scheduled Out</div>
                <div className="info-value">{flightDetails?.scheduled_out}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="departure-section" className="table-container">
        <div id="departure-header" className="section-header">
          <div className="card__depature__subtitle card__header--dark">
          <h3 className="card__depature__subtitle__title">
            Departure - {flightDetails?.departure_ID}
          </h3>
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

      <div id="destination-section" className="table-container">
        <div id="destination-header" className="section-header">
          <div className="card__destination__subtitle card__header--dark">
          <h3 className="card__destination__subtitle__title">
            Destination - {flightDetails?.destination_ID}
          </h3>
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