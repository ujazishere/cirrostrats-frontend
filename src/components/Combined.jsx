import React from "react";
import { NavLink } from "react-router-dom";
import NASDetails from "./NASDetails";

const styles = {
  flightDetailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    color: "#2d333b",
    marginBottom: "20px",
    width: "100%",
    overflow: "auto",
    border: "1px solid #000000"
  },
  flightNumber: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
    justifyContent: "center"
  },
  flightNumberText: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#2d333b",
    margin: 0,
    whiteSpace: "nowrap"
  },
  aircraftNumber: {
    color: "#8e8e93",
    fontSize: "14px",
    whiteSpace: "nowrap"
  },
  flightInfoContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    position: "relative",
    gap: "4px"
  },
  airportSection: {
    flex: "1",
    minWidth: "100px",
    maxWidth: "120px"
  },
  airportCode: {
    fontSize: "24px",
    fontWeight: "700",
    color: "##2d333b",
    marginBottom: "4px",
    whiteSpace: "nowrap"
  },
  airportName: {
    color: "#8e8e93",
    fontSize: "12px",
    marginBottom: "16px",
    whiteSpace: "nowrap"
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  infoLabel: {
    color: "##2d333b",
    fontSize: "11px",
    whiteSpace: "nowrap"
  },
  infoValue: {
    color: "#2d333b",
    fontSize: "14px",
    whiteSpace: "nowrap"
  },
  timeValue: {
    color: "#34c759",
    fontSize: "14px",
    whiteSpace: "nowrap"
  },
  flightPath: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 4px",
    position: "relative",
    marginTop: "48px",
    flex: "0 0 auto",
    width: "60px",
    minWidth: "60px"
  },
  duration: {
    color: "#8e8e93",
    fontSize: "11px",
    marginBottom: "8px",
    position: "absolute",
    top: "-24px",
    whiteSpace: "nowrap"
  },
  pathLine: {
    width: "100%",
    height: "2px",
    backgroundColor: "#3a3a3c",
    margin: "8px 0"
  },
  airplaneIcon: {
    color: "#34c759",
    fontSize: "16px",
    transform: "rotate(90deg)",
    marginTop: "6px"
  },
  statusBanner: {
    display: "inline-block",
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    color: "#34c759",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap"
  }
};

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

const GateCard = ({gateData}) => {
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
  console.log('FlightDetails received:', flightDetails);  // Debug log
  
  return (
    <div className="details">
      <div style={styles.flightDetailsCard}>
        <div style={styles.flightNumber}>
          <h2 style={styles.flightNumberText}>{flightDetails?.flight_number}</h2>
          <span style={styles.aircraftNumber}>N37502</span>
        </div>

        <div style={styles.flightInfoContainer}>
          <div style={styles.airportSection}>
            <div style={styles.airportCode}>{flightDetails?.departure_ID}</div>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Terminal</div>
                <div style={styles.infoValue}></div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Gate</div>
                <div style={styles.infoValue}>{flightDetails?.departure_gate}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Scheduled Local</div>
                <div style={styles.timeValue}>{flightDetails?.scheduled_departure_time}</div>
              </div>
            </div>
          </div>

          <div style={styles.flightPath}>
            <div style={styles.airplaneIcon}></div>
          </div>

          <div style={styles.airportSection}>
            <div style={styles.airportCode}>{flightDetails?.destination_ID}</div>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Terminal</div>
                <div style={styles.infoValue}></div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Gate</div>
                <div style={styles.infoValue}>{flightDetails?.arrival_gate}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Scheduled Local</div>
                <div style={styles.timeValue}>{flightDetails?.scheduled_arrival_time}</div>
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