import React, { useState } from "react";

const NASDetails = ({ nasResponse, title = "NAS Status" }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper function to check if NAS data is available
  const hasNasData = (nasResponse) => {
    if (!nasResponse) return false;
    if (Array.isArray(nasResponse)) {
      return nasResponse.length > 0;
    }
    if (typeof nasResponse === 'object') {
      const keys = Object.keys(nasResponse);
      if (keys.length === 0) return false;
      if (nasResponse.data && Array.isArray(nasResponse.data)) {
        return nasResponse.data.length > 0;
      }
      if (nasResponse.items && Array.isArray(nasResponse.items)) {
        return nasResponse.items.length > 0;
      }
      const hasValidData = keys.some(key => {
        const value = nasResponse[key];
        return value !== null && value !== undefined && value !== '' &&
               (Array.isArray(value) ? value.length > 0 : true);
      });
      return hasValidData;
    }
    return true;
  };

  if (!hasNasData(nasResponse)) {
    return null;
  }

  // ✅ FIX: This function now returns a specific CSS class for the target tables.
  const getTableClassName = (key) => {
    if (key === "Ground Delay" || key === "Arrival/Departure Delay") {
      return "delay-table"; // Return a class name instead of an inline style
    }
    return ""; // Return an empty string for other tables
  };

  return (
    <div className="nas-section">
      <div
        className="nas-tab-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <h3 className="nas-tab-title">
          {title}
          <span style={{ marginLeft: '8px', fontSize: '0.8em' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </h3>
      </div>
      {isExpanded && (
        <div className="nas-tab-content">
          <div className="flex flex-col gap-4">
            {Object.entries(nasResponse).map(([key, value], index) => (
              <table
                key={index}
                // The base class is 'another-table' and the conditional class is added here.
                className={`another-table ${getTableClassName(key)}`}
              >
                <thead>
                  <tr>
                    <th colSpan="2">{key}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(value).map(([subKey, subValue], subIndex) => (
                    <tr key={subIndex}>
                      <td>{subKey}</td>
                      <td>
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

export default NASDetails;