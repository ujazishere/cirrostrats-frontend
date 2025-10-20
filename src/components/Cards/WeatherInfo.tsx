import React, { useState } from "react";
import "./WeatherInfo.css"; // Import your CSS file

// Note: These variables are referenced but not defined in the original code
// They should be passed as props or defined elsewhere
declare const D_ATIS: string | undefined;
declare const METAR: string | undefined;
declare const TAF: string | undefined;
declare const datis_zt: string | undefined;

const WeatherInfo: React.FC = () => {
  const [query, setQuery] = useState<string>("");

  const handleSearch = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // Simulate search logic with a timeout
    console.log("Searching for:", query);
    setTimeout(() => {
      console.log("Search submitted");
      // Perform any action after search completes
    }, 500);
  };

  return (
    <div>
      <h3>Weather for Airport</h3>
      <table className="comparison-table">
        <tbody>
          {/* Render D-ATIS, METAR, TAF based on conditions */}
          {/* Example: */}
          {D_ATIS && (
            <>
              <tr>
                <th>
                  D-ATIS <span className="small-text">{datis_zt}</span>
                </th>
              </tr>
              <tr>
                <td
                  style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}
                >
                  {D_ATIS}
                </td>
              </tr>
            </>
          )}
          {/* Similarly render METAR and TAF */}
        </tbody>
      </table>

      {!D_ATIS && !METAR && !TAF && (
        <p>No weather information found for Airport. Try 'w kewr'.</p>
      )}

      <form onSubmit={handleSearch} className="search-form">
        <label htmlFor="query"></label>
        <input
          type="text"
          id="query"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          style={{
            padding: "10px",
            width: "300px",
            border: "1px solid black",
            borderRadius: "5px",
            marginRight: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            border: "1px solid black",
            borderRadius: "5px",
            backgroundColor: "#2D333B",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Search
        </button>
        <div
          className="loading-spinner"
          style={{
            display: "none",
            width: "30px",
            height: "30px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #24292e",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            position: "relative",
            left: "10px",
          }}
        ></div>
      </form>
    </div>
  );
};

export default WeatherInfo;
