import React, { useEffect, useRef, useState } from "react"; // Import useState
import Input from "./Input/Index"; // Ensure this path is correct
import NASDetails from "./NASDetails";

/**
 * Component to display weather and NAS information. Includes D-ATIS, METAR, TAF and NAS Status.
 * @param {Object} props
 * @param {Object} props.weatherDetails - Weather data object
 * @param {Object} props.nasResponseAirport - NAS data for the airport
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default: true)
 */
const AirportCard = ({
  weatherDetails,
  nasResponseAirport,
  showSearchBar = true,
}) => {
  // State to manage which button is visually active: 'DEP' or 'ARR'
  const [selectedDatisType, setSelectedDatisType] = useState("DEP");

  // 'datis' is sourced directly from props. The buttons do not change this data.
  const datis = weatherDetails?.datis;
  const metar = weatherDetails?.metar;
  const taf = weatherDetails?.taf;
  const searchContainerRef = useRef(null);

  /**
   * Parse HHMMZ format (4 digits) and calculate minutes ago
   * @param {string} timeString - Time in HHMMZ format (e.g., "1953Z")
   * @returns {number} - Minutes ago from current UTC time
   */
  const calculateMinutesAgoHHMMZ = (timeString) => {
    if (!timeString || typeof timeString !== "string") return null;

    const cleanTime = timeString.replace("Z", "").trim();
    if (cleanTime.length !== 4 || !/^\d{4}$/.test(cleanTime)) return null;

    const hours = parseInt(cleanTime.substring(0, 2), 10);
    const minutes = parseInt(cleanTime.substring(2, 4), 10);

    if (hours > 23 || minutes > 59) return null;

    const now = new Date();
    const currentUTCHours = now.getUTCHours();
    const currentUTCMinutes = now.getUTCMinutes();

    const currentTotalMinutes = currentUTCHours * 60 + currentUTCMinutes;
    const dataTotalMinutes = hours * 60 + minutes;

    let diffMinutes = currentTotalMinutes - dataTotalMinutes;

    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    if (diffMinutes > 12 * 60) {
      diffMinutes = Math.abs(dataTotalMinutes - currentTotalMinutes);
    }

    return diffMinutes;
  };

  /**
   * Parse DDHHMMZ format (6 digits) and calculate minutes ago
   * @param {string} timeString - Time in DDHHMMZ format (e.g., "012054Z")
   * @returns {number} - Minutes ago from current UTC time
   */
  const calculateMinutesAgoDDHHMMZ = (timeString) => {
    if (!timeString || typeof timeString !== "string") return null;

    const cleanTime = timeString.replace("Z", "").trim();
    if (cleanTime.length !== 6 || !/^\d{6}$/.test(cleanTime)) return null;

    const day = parseInt(cleanTime.substring(0, 2), 10);
    const hours = parseInt(cleanTime.substring(2, 4), 10);
    const minutes = parseInt(cleanTime.substring(4, 6), 10);

    if (day < 1 || day > 31 || hours > 23 || minutes > 59) return null;

    const now = new Date();
    const currentUTCDay = now.getUTCDate();
    const currentUTCHours = now.getUTCHours();
    const currentUTCMinutes = now.getUTCMinutes();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();

    let dataTime = new Date(
      Date.UTC(currentYear, currentMonth, day, hours, minutes, 0, 0)
    );
    let currentTime = new Date(
      Date.UTC(
        currentYear,
        currentMonth,
        currentUTCDay,
        currentUTCHours,
        currentUTCMinutes,
        0,
        0
      )
    );

    let diffMs = currentTime.getTime() - dataTime.getTime();

    if (diffMs < 0) {
      dataTime = new Date(
        Date.UTC(currentYear, currentMonth - 1, day, hours, minutes, 0, 0)
      );
      diffMs = currentTime.getTime() - dataTime.getTime();
    }

    if (diffMs < 0 || diffMs > 35 * 24 * 60 * 60 * 1000) {
      dataTime = new Date(
        Date.UTC(currentYear, currentMonth + 1, day, hours, minutes, 0, 0)
      );
      diffMs = currentTime.getTime() - dataTime.getTime();

      if (diffMs < 0) {
        diffMs = Math.abs(diffMs);
      }
    }

    const diffMinutes = Math.round(diffMs / (1000 * 60));

    return diffMinutes;
  };

  /**
   * Format minutes as "X mins ago"
   * @param {number} minutes - Minutes difference
   * @returns {string} - Formatted string
   */
  const formatMinutesAgo = (minutes) => {
    if (minutes === null || minutes === undefined) return "N/A";
    return `${minutes} mins ago`;
  };

  /**
   * Get color based on minutes ago and data type
   * @param {number} minutesAgo - Minutes since data was issued
   * @param {string} dataType - Data type ('datis', 'metar', or 'taf')
   * @returns {string} - Color value
   */
  const getTimestampColor = (minutesAgo, dataType) => {
    if (minutesAgo === null || minutesAgo === undefined) return "#6b7280";

    if (dataType === "datis" || dataType === "metar") {
      if (minutesAgo < 10) return "#22c55e";
      else if (minutesAgo > 55) return "#ef4444";
      else return "#6b7280";
    } else if (dataType === "taf") {
      if (minutesAgo < 10) return "#22c55e";
      else if (minutesAgo > 350) return "#ef4444";
      else return "#6b7280";
    }

    return "#6b7280";
  };

  // Helper function to get NAS title
  // THIS IS THE FIX: This function now always returns "NAS Status".
  // TODO Ismail: Is this necessary to have this tiny function just for title? Can we pass the title text as a prop instead?
  // Ismail: I tried with the prop like suggested but not sure why it breaks the entire page

  const getNASTitle = () => {
    return "NAS Status";
  };

//   Old code
//   // Calculate minutes ago for each section
//   const datisMinutesAgo = weatherDetails?.datis_ts
//     ? calculateMinutesAgoHHMMZ(weatherDetails.datis_ts)
//     : null;
  const metarMinutesAgo = weatherDetails?.metar_ts
    ? calculateMinutesAgoDDHHMMZ(weatherDetails.metar_ts)
    : null;
  const tafMinutesAgo = weatherDetails?.taf_ts
    ? calculateMinutesAgoDDHHMMZ(weatherDetails.taf_ts)
    : null;
    // For D-ATIS, you now have multiple types (arr, dep, combined)
  const datisMinutesAgo = {
    arr: weatherDetails?.datis?.arr?.datis_ts && weatherDetails.datis.arr.datis_ts !== "N/A"
        ? calculateMinutesAgoHHMMZ(weatherDetails.datis.arr.datis_ts)
        : null,
    dep: weatherDetails?.datis?.dep?.datis_ts && weatherDetails.datis.dep.datis_ts !== "N/A"
        ? calculateMinutesAgoHHMMZ(weatherDetails.datis.dep.datis_ts)
        : null,
    combined: weatherDetails?.datis?.combined?.datis_ts && weatherDetails.datis.combined.datis_ts !== "N/A"
        ? calculateMinutesAgoHHMMZ(weatherDetails.datis.combined.datis_ts)
        : null
    };

  useEffect(() => {
    if (showSearchBar && searchContainerRef.current) {
      searchContainerRef.current.style.cssText =
        "margin-top: -70px !important; margin-bottom: -40px;";
      const parentElement = searchContainerRef.current.parentElement;
      if (
        parentElement &&
        parentElement.classList.contains("weather-container")
      ) {
        parentElement.style.paddingTop = "0";
      }
    }
  }, [showSearchBar]);

  // --- Helper to determine if combined D-ATIS exists ---
  const hasCombinedDatis =
    datis?.combined?.datis &&
    datis?.combined?.datis.trim() !== "" &&
    datis?.combined?.datis.trim().toUpperCase() !== "N/A";

    // OLD CODE
//   const hasCombinedDatis =
//     datis?.combined &&
//     datis.combined.trim() !== "" &&
//     datis.combined.trim().toUpperCase() !== "N/A";
  

  // Get the timestamp for the selected D-ATIS type
  const getSelectedDatisTimestamp = () => {
    if (hasCombinedDatis) {
        return datis.combined.datis_ts;
    }
    return datis?.[selectedDatisType.toLowerCase()]?.datis_ts || "";
  };

  // Calculate minutes ago for the selected D-ATIS type
  const getSelectedDatisMinutesAgo = () => {
    const timestamp = getSelectedDatisTimestamp();
    return timestamp && timestamp !== "N/A" 
        ? calculateMinutesAgoHHMMZ(timestamp)
        : null;
  };


  return (
    <div className="weather-container">
      {/* Search Input Component at the top with the same styling as combined.jsx | DO NOT DELETE THIS CODE */}
      {showSearchBar && (
        <div className="combined-search" ref={searchContainerRef}>
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}

      <NASDetails
        nasResponse={nasResponseAirport}
        title={getNASTitle(nasResponseAirport)}
      />

      <div className="weather-cards">
        {/* D-ATIS Card */}
        <div className="weather-card">
          <div className="card-header">
            <h2 className="header-title">D-ATIS</h2>

            {/* Show toggle only if combined is NOT available */}
            {!hasCombinedDatis && (
              <div className="datis-toggle">
                {datis?.dep?.datis && datis.dep.datis.trim() !== "" && datis.dep.datis.trim().toUpperCase() !== "N/A" && (
                // {datis?.dep?.datis && (
                  <button
                    className={`toggle-btn ${
                      selectedDatisType === "DEP" ? "active" : ""
                    }`}
                    onClick={() => setSelectedDatisType("DEP")}
                  >
                    DEP
                  </button>
                )}
                {datis?.arr?.datis && datis.arr.datis.trim() !== "" && datis.arr.datis.trim().toUpperCase() !== "N/A" && (
                // {datis?.arr && (
                  <button
                    className={`toggle-btn ${
                      selectedDatisType === "ARR" ? "active" : ""
                    }`}
                    onClick={() => setSelectedDatisType("ARR")}
                  >
                    ARR
                  </button>
                )}
              </div>
            )}

            <span
                className="timestamp"
                style={{
                color: getTimestampColor(getSelectedDatisMinutesAgo(), "datis"),
                fontWeight: "normal",
                }}
            >
                {formatMinutesAgo(getSelectedDatisMinutesAgo())}
            </span>
            {/* <span
              className="timestamp"
              style={{
                color: getTimestampColor(datisMinutesAgo, "datis"),
                fontWeight: "normal",
              }}
            >
              {formatMinutesAgo(datisMinutesAgo)}
            </span> */}
          </div>

          <div className="card-body">
            <div className="data-content">
              <p
                style={{ lineHeight: "1.87083" }}
                dangerouslySetInnerHTML={{
                  __html: hasCombinedDatis
                    ? datis?.combined?.datis // Show combined if exists
                    : selectedDatisType === "DEP"
                    ? datis?.dep?.datis || "N/A" // Show dep or fallback
                    : datis?.arr?.datis || "N/A", // Show arr or fallback
                }}
              ></p>
            </div>
          </div>
        </div>

        {/* METAR Card */}
        <div className="weather-card">
          <div className="card-header">
            <h2 className="header-title">METAR</h2>
            <span
              className="timestamp"
              style={{
                color: getTimestampColor(metarMinutesAgo, "metar"),
                fontWeight: "normal",
              }}
            >
              {formatMinutesAgo(metarMinutesAgo)}
            </span>
          </div>
          <div className="card-body">
            <div className="data-content">
              <p
                style={{ lineHeight: "1.87083" }}
                dangerouslySetInnerHTML={{ __html: metar }}
              ></p>
            </div>
          </div>
        </div>

        {/* TAF Card */}
        <div className="weather-card">
          <div className="card-header">
            <h2 className="header-title">TAF</h2>
            <span
              className="timestamp"
              style={{
                color: getTimestampColor(tafMinutesAgo, "taf"),
                fontWeight: "normal",
              }}
            >
              {formatMinutesAgo(tafMinutesAgo)}
            </span>
          </div>
          <div className="card-body">
            <div className="data-content">
              <p
                style={{ lineHeight: "1.87083" }}
                dangerouslySetInnerHTML={{ __html: taf }}
              ></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirportCard;
