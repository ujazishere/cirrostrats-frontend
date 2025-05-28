// UTCTime.jsx
// This React component displays the current UTC time in a formatted string ("UTC: DD HH:MMZ")
// and updates every minute to stay in sync with real time. It uses React hooks to manage
// the time state and lifecycle effects.
import React, { useEffect, useState } from "react";

// Define the UTCTime component
const UTCTime = () => {
  // State to hold the current date in UTC format
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Function to format the current UTC time
    const updateFormattedDate = () => {
      const date = new Date(); // Create a new date object
      const day = String(date.getUTCDate()).padStart(2, "0"); // Get and pad UTC day
      const hour = String(date.getUTCHours()).padStart(2, "0"); // Get and pad UTC hour
      const minute = String(date.getUTCMinutes()).padStart(2, "0"); // Get and pad UTC minute
      
      // Construct the formatted UTC time string
      const currentDate = `UTC: ${day} ${hour}:${minute}Z`;
      setCurrentDate(currentDate); // Update the state
    };

    updateFormattedDate(); // Initial call to set the time immediately

    // Set up an interval to update the time every minute
    const intervalId = setInterval(updateFormattedDate, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    // Render the UTC time inside a container
    <div className="utc__container">
      <div className="utc__time-display">
        <span className="utc__time-text">{currentDate}</span>
      </div>
    </div>
  );
};

export default UTCTime;