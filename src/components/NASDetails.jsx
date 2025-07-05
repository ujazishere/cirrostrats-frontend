/**
 * NASDetails Component
 * 
 * A React component that displays National Airspace System (NAS) information in a tabular format.
 * Handles nested data structures and provides a clean display of airport/airspace information.
 * 
 * Features:
 * - Displays multiple categories of NAS data
 * - Handles nested objects with automatic JSON stringification
 * - Responsive table layout
 * - Graceful handling of empty data
 * 
 * @param {Object} props
 * @param {Object} props.nasResponse - Response object containing NAS data categories
 */

import React, { useState, useEffect } from "react";

const NASDetails = ({ nasResponse, title = "NAS Status" }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // TODO TEST: NAS response can be shady: build integration tests, any new data available should be tested here. for formatteing error and integration issues.

  // Helper function to check if NAS data is available
  const hasNasData = (nasResponse) => {
    if (!nasResponse) return false;
    // Prioritize checking nasResponse.data if it's an array
    // Check if nasResponse has meaningful data
    if (Array.isArray(nasResponse)) {
      return nasResponse.length > 0;
    }
    
    if (typeof nasResponse === 'object') {
      // Check if object has any meaningful properties with data
      const keys = Object.keys(nasResponse);
      if (keys.length === 0) return false;
      
      // Check for common empty states
      if (nasResponse.data && Array.isArray(nasResponse.data)) {
        return nasResponse.data.length > 0;
      }
      
      if (nasResponse.items && Array.isArray(nasResponse.items)) {
        return nasResponse.items.length > 0;
      }
      
      // Check if all values are null, undefined, or empty
      const hasValidData = keys.some(key => {
        const value = nasResponse[key];
        return value !== null && value !== undefined && value !== '' && 
               (Array.isArray(value) ? value.length > 0 : true);
      });
      
      return hasValidData;
    }
    
    return true; // If it's a string or other truthy value
  };

  // Don't render anything if there's no data
  if (!hasNasData(nasResponse)) {
    return null;
  }

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
            {/* Map through top-level categories */}
            {Object.entries(nasResponse).map(([key, value], index) => (
              <table key={index} className="another-table">
                {/* Category header */}
                <thead>
                  <tr>
                    <th colSpan="2">{key}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map through subcategories and their values */}
                  {Object.entries(value).map(([subKey, subValue], subIndex) => (
                    <tr key={subIndex}>
                      {/* Subcategory name */}
                      <td>{subKey}</td>
                      {/* Value - stringify if it's an object, otherwise display directly */}
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