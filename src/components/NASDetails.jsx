import React, { useState } from "react";

// Defines the NASDetails functional component.
// It accepts NAS data (nasResponse) and an optional title as props.
const NASDetails = ({ nasResponse, title = "NAS Status" }) => {
  // Initializes a state variable 'isExpanded' to control the collapsible section, defaulting to 'true' (visible).
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper function to check if NAS data is available
  // This function robustly checks if the provided nasResponse contains any meaningful data to display.
  const hasNasData = (nasResponse) => {
    // Returns false immediately if the response is null or undefined.
    if (!nasResponse) return false;
    // If the response is an array, it's considered to have data if it's not empty.
    if (Array.isArray(nasResponse)) {
      return nasResponse.length > 0;
    }
    // If the response is an object, more complex checks are needed.
    if (typeof nasResponse === 'object') {
      // Gets all the keys of the object.
      const keys = Object.keys(nasResponse);
      // If there are no keys, the object is empty.
      if (keys.length === 0) return false;
      // Checks for specific nested data structures.
      if (nasResponse.data && Array.isArray(nasResponse.data)) {
        return nasResponse.data.length > 0;
      }
      if (nasResponse.items && Array.isArray(nasResponse.items)) {
        return nasResponse.items.length > 0;
      }
      // As a final check, it iterates through the keys to see if at least one has a non-empty value.
      const hasValidData = keys.some(key => {
        const value = nasResponse[key];
        return value !== null && value !== undefined && value !== '' &&
               (Array.isArray(value) ? value.length > 0 : true);
      });
      // Returns true if at least one valid data point was found.
      return hasValidData;
    }
    // If it's not null, an array, or an object (e.g., a string or number), it's considered valid data.
    return true;
  };

  // This is a guard clause. If the helper function determines there's no data, the component renders nothing (null).
  if (!hasNasData(nasResponse)) {
    return null;
  }

  // ✅ FIX: This function now returns a specific CSS class for the target tables.
  // This helper function determines if a specific table should receive a special CSS class for styling.
  const getTableClassName = (key) => {
    // If the table's title (key) matches these specific strings...
    if (key === "Ground Delay" || key === "Arrival/Departure Delay") {
      return "delay-table"; // ...return the 'delay-table' class name.
    }
    return ""; // Otherwise, return an empty string, adding no extra class.
  };

  // The return statement contains the JSX that defines the component's UI.
  return (
    // This is the main container for the NAS details section.
    <div className="nas-section">
      {/* This div acts as the clickable header for the collapsible section. */}
      <div
        className="nas-tab-header"
        // The onClick handler toggles the 'isExpanded' state between true and false.
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <h3 className="nas-tab-title">
          {/* Displays the title passed in via props. */}
          {title}
          {/* This span displays a different arrow icon depending on the 'isExpanded' state. */}
          <span style={{ marginLeft: '8px', fontSize: '0.8em' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </h3>
      </div>
      {/* This is a short-circuit conditional render. The content inside is only rendered if 'isExpanded' is true. */}
      {isExpanded && (
        <div className="nas-tab-content">
          <div className="flex flex-col gap-4">
            {/* Object.entries() converts the nasResponse object into an array of [key, value] pairs, which can be mapped over. */}
            {/* This creates a separate table for each top-level key in the NAS data. */}
            {Object.entries(nasResponse).map(([key, value], index) => (
              <table
                key={index}
                // The base class is 'another-table' and the conditional class is added here.
                // The className is built dynamically using a template literal.
                className={`another-table ${getTableClassName(key)}`}
              >
                <thead>
                  <tr>
                    {/* The table header spans both columns and displays the key (e.g., "Ground Delay"). */}
                    <th colSpan="2">{key}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* This inner map iterates over the key-value pairs *within* each section of data to create the table rows. */}
                  {Object.entries(value).map(([subKey, subValue], subIndex) => (
                    <tr key={subIndex}>
                      {/* The first cell contains the sub-key (the property name). */}
                      <td>{subKey}</td>
                      {/* The second cell contains the sub-value. */}
                      <td>
                        {/* A ternary operator checks if the value is an object. If so, it's stringified; otherwise, it's displayed directly. */}
                        {typeof subValue === 'object'
                          ? JSON.stringify(subValue)
                          : subValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Exports the component to be used in other parts of the application.
export default NASDetails;