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

import React from 'react';

const NASDetails = ({ nasResponse }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Check if nasResponse exists and has data */}
      {nasResponse && Object.keys(nasResponse).length > 0 ? (
        // Map through top-level categories
        Object.entries(nasResponse).map(([key, value], index) => (
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
        ))
      ) : (
        // Return empty paragraph if no data
        <p></p>
      )}
    </div>
  );
};

export default NASDetails;