import React from 'react';

const NASDetails = ({ nasResponse }) => {
  return (
    <div className="flex flex-col gap-4">
      {nasResponse && Object.keys(nasResponse).length > 0 ? (
        Object.entries(nasResponse).map(([key, value], index) => (
          <table key={index} className="another-table">
            <thead>
              <tr>
                <th colSpan="2">{key}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(value).map(([subKey, subValue], subIndex) => (
                <tr key={subIndex}>
                  <td>{subKey}</td>
                  <td>{typeof subValue === 'object' ? JSON.stringify(subValue) : subValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))
      ) : (
        <p>No NAS data available.</p>
      )}
    </div>
  );
};

export default NASDetails;