import React, { useState, useEffect } from "react";

const FlightCard = ({ flightDetails }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [DATIS, setDATIS] = useState('Loading D-ATIS...');
  const [METAR, setMETAR] = useState('Loading METAR...');
  const [TAF, setTAF] = useState('Loading TAF...');
  const [DESDATIS, setDESDATIS] = useState('Loading D-ATIS...');
  const [DESMETAR, setDESMETAR] = useState('Loading METAR...');
  const [DESTAF, setDESTAF] = useState('Loading TAF...');

  useEffect(() => {
    console.log("flightDetails:", flightDetails); 

    if (flightDetails) {
      setIsLoading(false);

      // Departure weather
      if (flightDetails.dep_weather) {
        console.log("Departure weather:", flightDetails.dep_weather); 
        setDATIS(flightDetails.dep_weather['D-ATIS'] || 'D-ATIS not available');
        setMETAR(flightDetails.dep_weather['METAR'] || 'METAR not available');
        setTAF(flightDetails.dep_weather['TAF'] || 'TAF not available');
      } else {
        console.log("Departure weather not found"); 
      }

      // Destination weather
      if (flightDetails.dest_weather) {
        console.log("Destination weather:", flightDetails.des_weather); /
        setDESDATIS(flightDetails.dest_weather['D-ATIS'] || 'D-ATIS not available');
        setDESMETAR(flightDetails.dest_weather['METAR'] || 'METAR not available');
        setDESTAF(flightDetails.dest_weather['TAF'] || 'TAF not available');
      } else {
        console.log("Destination weather not found"); 
      }
    }
  }, [flightDetails]);

  if (!flightDetails) {
    return <div>Loading flight details...</div>;
  }



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
                {isLoading ? 'Loading D-ATIS...' : DATIS}
              </td>
            </tr>
            <tr>
              <td>METAR <span className="small-text">56 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                {isLoading ? 'Loading METAR...' : METAR}
              </td>
            </tr>
            <tr>
              <td>TAF <span className="small-text">139 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                {isLoading ? 'Loading TAF...' : TAF}
              </td>
            </tr>
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
                {isLoading ? 'Loading Destination D-ATIS...' : DESDATIS}
              </td>
            </tr>
            <tr>
              <td>METAR <span className="small-text">16 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                {isLoading ? 'Loading Destination METAR...' : DESMETAR}
              </td>
            </tr>
            <tr>
              <td>TAF <span className="small-text">10 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                {isLoading ? 'Loading Destination TAF...' : DESTAF}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightCard;