import React, { useState, useEffect } from "react";
import WeatherCard from "../components/WeatherCard";

const FlightCard = ({ flightDetails }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [DATIS, setDATIS] = useState('Loading D-ATIS...');
  const [METAR, setMETAR] = useState('Loading METAR...');
  const [TAF, setTAF] = useState('Loading TAF...');
  const [DESDATIS, setDESDATIS] = useState('Loading D-ATIS...');
  const [DESMETAR, setDESMETAR] = useState('Loading METAR...');
  const [DESTAF, setDESTAF] = useState('Loading TAF...');

  console.log('flightDetails in FlightCard.jsx', flightDetails)
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

      <div className="table-container">
        <table className="flight_card">
          <tbody>
            {flightDetails.dep_weather? (
              <WeatherCard arrow={false} weatherDetails={flightDetails.dep_weather} />
            ) : null}
          </tbody>
        </table>
      </div>

      <table className="route">
        <tbody>
          <tr>
            <th>ROUTE Show on - SkyVector Map </th>
          </tr>
          <tr>
            <td>FL340 AGDOX Q816 HOCKE MONEE BAE HELLO SAUGI PORDR AALLE3</td>
          </tr>
        </tbody>
      </table>

      <div className="table-container">
        <table className="flight_card">
          <tbody>
            {flightDetails.dep_weather? (
              <WeatherCard arrow={false} weatherDetails={flightDetails.dest_weather} />
            ) : null}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default FlightCard;