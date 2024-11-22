import React from "react";
import { NavLink } from "react-router-dom";
import NASDetails from "./NASDetails";

const styles = {
  flightDetailsCard: {
    backgroundColor: "#1c1c1e",
    borderRadius: "12px",
    padding: "24px",
    color: "#ffffff",
    marginBottom: "20px",
    width: "100%",
    overflow: "auto" 
  },
  flightNumber: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    justifyContent: "center"
  },
  flightNumberText: {
    fontSize: "24px",
    fontWeight: "500",
    color: "#ffffff",
    margin: 0,
    whiteSpace: "nowrap"
  },
  aircraftNumber: {
    color: "#8e8e93",
    fontSize: "16px",
    whiteSpace: "nowrap"
  },
  flightInfoContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    position: "relative",
    minWidth: "min-content",
    gap: "8px"
  },
  airportSection: {
    flex: "0 0 auto", 
    width: "150px", 
    minWidth: "150px" 
  },
  airportCode: {
    fontSize: "28px", 
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "8px",
    whiteSpace: "nowrap"
  },
  airportName: {
    color: "#8e8e93",
    fontSize: "14px", 
    marginBottom: "24px",
    whiteSpace: "nowrap"
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  infoLabel: {
    color: "#8e8e93",
    fontSize: "12px", 
    whiteSpace: "nowrap"
  },
  infoValue: {
    color: "#ffffff",
    fontSize: "16px", 
    whiteSpace: "nowrap"
  },
  timeValue: {
    color: "#34c759",
    fontSize: "16px", 
    whiteSpace: "nowrap"
  },
  flightPath: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 8px",
    position: "relative",
    marginTop: "48px",
    flex: "0 0 auto",
    width: "80px", 
    minWidth: "80px"
  },
  duration: {
    color: "#8e8e93",
    fontSize: "12px",
    marginBottom: "12px",
    position: "absolute",
    top: "-24px",
    whiteSpace: "nowrap"
  },
  pathLine: {
    width: "100%",
    height: "2px",
    backgroundColor: "#3a3a3c",
    margin: "12px 0"
  },
  airplaneIcon: {
    color: "#34c759",
    fontSize: "20px",
    transform: "rotate(90deg)",
    marginTop: "8px"
  },
  statusBanner: {
    display: "inline-block",
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    color: "#34c759",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
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
  return (
    <div className="details">
      <div style={styles.flightDetailsCard}>
        {/* Flight Number Row */}
        <div style={styles.flightNumber}>
          <h2 style={styles.flightNumberText}>{flightDetails.flight_number}</h2>
          <span style={styles.aircraftNumber}>N37502</span>
        </div>

        {/* Main Flight Info Container */}
        <div style={styles.flightInfoContainer}>
          {/* Departure Section */}
          <div style={styles.airportSection}>
            <div style={styles.airportCode}>{flightDetails.departure_ID}</div>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Terminal</div>
                <div style={styles.infoValue}>-</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Gate</div>
                <div style={styles.infoValue}>-</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Scheduled Local</div>
                <div style={styles.timeValue}>12:30 PM</div>
              </div>
            </div>
          </div>

          {/* Flight Path Indicator */}
          <div style={styles.flightPath}>
            <div style={styles.duration}>1h 14m</div>
            <div style={styles.pathLine}></div>
            <div style={styles.airplaneIcon}>✈</div>
          </div>

          {/* Arrival Section */}
          <div style={styles.airportSection}>
            <div style={styles.airportCode}>{flightDetails.destination_ID}</div>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Terminal</div>
                <div style={styles.infoValue}>C</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Gate</div>
                <div style={styles.infoValue}>105</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Scheduled Local</div>
                <div style={styles.timeValue}>1:44 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div style={styles.statusBanner}>
          DEPARTING ON TIME
        </div>
      </div>

      {/* Rest of the component remains unchanged */}
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

      {flightDetails.route && flightDetails.sv && (
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