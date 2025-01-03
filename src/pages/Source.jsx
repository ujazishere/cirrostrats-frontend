import React from "react";
import { NavLink } from "react-router-dom";

const Source = () => {
  // List of sources for data
  const sources = [
    { url: "https://www.aviationweather.gov", label: "Aviation Weather" },
    { url: "https://www.flightview.com", label: "Flight View" },
    { url: "https://www.airport-ewr.com", label: "Airport EWR" },
    { url: "https://www.flightstats.com", label: "Flight Stats" },
  ];

  return (
    <div className="source">
      <h2 className="source__title">Source for all the data</h2>

      {/* Dynamic generation of links */}
      <div className="links">
        {sources.map((source, index) => (
          <div key={index} className="source__link">
            <NavLink
              to={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source__link"
            >
              {source.url}
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Source;
