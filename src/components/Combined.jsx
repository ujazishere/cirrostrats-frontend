import React from "react";
import { NavLink } from "react-router-dom";
import NASDetails from "./NASDetails";

// Styles with enhanced responsiveness
const styles = {
  container: {
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto"
  },
  flightDetailsCard: {
    backgroundColor: "#1c1c1e",
    borderRadius: "12px",
    padding: "24px",
    color: "#ffffff",
    marginBottom: "20px",
    width: "100%",
    overflowX: "auto",
    '@media (max-width: 600px)': {
      padding: "16px",
      marginBottom: "12px"
    }
  },
  flightNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "24px",
    '@media (max-width: 600px)': {
      marginBottom: "16px",
      gap: "8px"
    }
  },
  flightNumberText: {
    fontSize: "24px",
    fontWeight: "500",
    color: "#ffffff",
    margin: 0,
    '@media (max-width: 600px)': {
      fontSize: "18px"
    }
  },
  aircraftNumber: {
    color: "#8e8e93",
    fontSize: "16px",
    '@media (max-width: 600px)': {
      fontSize: "14px"
    }
  },
  flightInfoContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    position: "relative",
    width: "100%",
    overflowX: "auto",
    '@media (max-width: 600px)': {
      flexDirection: "column",
      marginBottom: "16px"
    }
  },
  airportSection: {
    flex: 1,
    minWidth: "250px",
    maxWidth: "320px",
    '@media (max-width: 600px)': {
      maxWidth: "100%",
      width: "100%",
      minWidth: "100%"
    }
  },
  airportCode: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "8px",
    '@media (max-width: 600px)': {
      fontSize: "24px",
      marginBottom: "4px"
    }
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    '@media (max-width: 600px)': {
      gap: "12px"
    }
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "100%",
    '@media (max-width: 600px)': {
      gap: "2px"
    }
  },
  infoLabel: {
    color: "#8e8e93",
    fontSize: "14px",
    '@media (max-width: 600px)': {
      fontSize: "12px"
    }
  },
  infoValue: {
    color: "#ffffff", 
    fontSize: "20px",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    '@media (max-width: 600px)': {
      fontSize: "16px"
    }
  },
  timeValue: {
    color: "#34c759",
    fontSize: "20px",
    '@media (max-width: 600px)': {
      fontSize: "16px"
    }
  },
  flightPath: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 32px",
    position: "relative",
    marginTop: "48px",
    '@media (max-width: 600px)': {
      padding: "0 16px",
      marginTop: "32px"
    }
  },
  duration: {
    color: "#8e8e93",
    fontSize: "14px",
    marginBottom: "12px",
    position: "absolute",
    top: "-24px",
    whiteSpace: "nowrap",
    '@media (max-width: 600px)': {
      fontSize: "12px",
      top: "-16px"
    }
  },
  pathLine: {
    width: "200px",
    height: "2px",
    backgroundColor: "#3a3a3c",
    margin: "12px 0",
    '@media (max-width: 600px)': {
      width: "150px",
      margin: "8px 0"
    }
  },
  airplaneIcon: {
    color: "#34c759",
    fontSize: "24px",
    transform: "rotate(90deg)",
    marginTop: "8px",
    '@media (max-width: 600px)': {
      fontSize: "20px",
      marginTop: "4px"
    }
  },
  statusBanner: {
    display: "inline-block",
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    color: "#34c759",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    '@media (max-width: 600px)': {
      padding: "6px 12px",
      fontSize: "12px"
    }
  },
  routeTable: {
    width: "100%",
    tableLayout: "fixed",
    overflowX: "auto"
  },
  routeCell: {
    wordWrap: "break-word",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
};

// Weather highlighting function (existing implementation)
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

// WeatherCard Component
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

// GateCard Component
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

// Main FlightCard Component
const FlightCard = ({ 
  flightDetails, 
  dep_weather, 
  dest_weather, 
  nasDepartureResponse, 
  nasDestinationResponse 
}) => {
  return (
    <div className="details" style={styles.container}>
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

      {/* Departure Weather Section */}
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

      {/* Route Section */}
      {flightDetails.route && flightDetails.sv && (
        <div style={{width: "100%", overflowX: "auto"}}>
          <table style={styles.routeTable}>
            <tbody>
              <tr>
                <th>
                  ROUTE
                  <a 
                    href={flightDetails.sv} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{marginLeft: "10px"}}
                  >
                    Show on - SkyVector Map
                  </a>
                </th>
              </tr>
              <tr>
                <td style={styles.routeCell}>
                  {flightDetails.route}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* NAS Departure Details */}
      <NASDetails nasResponse={nasDepartureResponse} title="Airport Closure - Departure" />

      {/* Destination Weather Section */}
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

      {/* NAS Destination Details */}
      <NASDetails nasResponse={nasDestinationResponse} title="Airport Closure - Destination" />
    </div>
  );
};

export { FlightCard, WeatherCard, GateCard };