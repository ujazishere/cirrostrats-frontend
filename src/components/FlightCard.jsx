import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { weatherData } from "./test";






///This all needs to be changed since its copied from weather page i.e Card.jsx and Input.jsx
const FlightCard = ({flightDetails}) => {
  const [isLoading, setIsLoading] = useState(true);
  console.log('flightDetaiils',flightDetails)
  // const location = useLocation();
  // const searchValue = location?.state?.searchValue;



  return (
    <div className="details">
      {/* <h2 className="details__title">United Flight Information</h2> */}

      <div className="detail">
        {/* <h3>▼ {title}</h3> */}
      </div>
      
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
              <h3>{flightDetails.scheduled_arrival_time}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>
                <div className="header-button">Departure</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: "100%", textAlign: "left" }}>
                <span style={{ float: "left", width: "33%" }}>{flightDetails.scheduled_departure_time}</span>
                <span style={{ float: "left", width: "33%", textAlign: "center" }}>{flightDetails.departure_ID}</span>
                <span style={{ float: "right", width: "33%", textAlign: "right" }}>{flightDetails.departure_gate}</span>
              </td>
            </tr>
            <tr>
              <td>D-ATIS <span className="small-text">56 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                {console.log('Here in DATIS')}

                {/* TODO: This isn't working. works after adding the key call and saving the file but throws error when refreshing browser. Investigate */}
                {isLoading ? (
                  'Loading D-ATIS...'
                ) : (
                  flightDetails.dep_weather?.['D-ATIS'] || 'D-ATIS not available'
                )}
                {/* {flightDetails.dep_weather['D-ATIS']} */}
              </td>
            </tr>
            <tr>
              <td>METAR <span className="small-text">56 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                METAR-DUMMY
              </td>
            </tr>
            <tr>
              <td>TAF <span className="small-text">139 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                TAF-DUMMY
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="route">
            <tr>
                <th>ROUTE Show on - SkyVector Map </th>
            </tr>
            <tr>
                <td>FL340 AGDOX Q816 HOCKE MONEE BAE HELLO SAUGI PORDR AALLE3</td>
            </tr>
        </table>

      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>
                <div className="header-button">Destination</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: "100%", textAlign: "left" }}>
                <span style={{ float: "left", width: "33%" }}>{flightDetails.scheduled_arrival_time}</span>
                <span style={{ float: "left", width: "33%", textAlign: "center" }}>{flightDetails.destination_ID}</span>
                <span style={{ float: "right", width: "33%", textAlign: "right" }}>{flightDetails.arrival_gate}</span>
              </td>
            </tr>
            <tr>
              <td>D-ATIS <span className="small-text">16 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                D-ATIS-DUMMY
              </td>
            </tr>
            <tr>
              <td>METAR <span className="small-text">16 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                METAR-DUMMY
              </td>
            </tr>
            <tr>
              <td>TAF <span className="small-text">10 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                TAF-DUMMY
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightCard;
