import React, { useEffect, useState, CSSProperties } from "react";
import Input from "../components/Input/Index"; // This path is assumed to be correct
import { GateData } from "../types";

interface GateCardProps {
  gateData: GateData[];
  showSearchBar?: boolean;
}

const GateCard: React.FC<GateCardProps> = ({
  gateData,
  showSearchBar = true,
}) => {
  // State to hold the current time, updating every minute
  const [_currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Update the current time every 60 seconds to re-evaluate flight status
    const timer: NodeJS.Timeout = setInterval(
      () => setCurrentTime(new Date()),
      60000
    );
    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []);

  // --- JSS-style objects to force styles ---
  // Style for the search bar's container
  const searchContainerStyle: CSSProperties = {
    marginBottom: "-3rem",
    marginTop: "-4rem",
  };

  // Style for the main content container
  const gateContainerStyle: CSSProperties = {
    marginTop: "0",
  };

  // --- NEW: Style object for delayed flights ---
  // This style will be applied to the entire flight row if it's delayed.
  const delayedFlightStyle: CSSProperties = {
    backgroundColor: "#fff3cd", // An "acceptable yellow" background.
    color: "#856404", // A matching dark font color for readability.
  };

  // --- NEW: Style for the date group headers ---
  const dateHeaderStyle: CSSProperties = {
    padding: "0.8rem 1rem",
    backgroundColor: "rgba(240, 240, 240, 0.5)", // A light, semi-transparent background
    color: "#333",
    fontWeight: "600",
    fontSize: "0.9rem",
    textAlign: "center",
    borderBottom: "1px solid #eee",
    borderTop: "1px solid #eee",
  };

  /**
   * Opens a Google search for the given flight ID in a new tab.
   * @param {string} flightId - The flight ID to search for (e.g., "UA4511").
   */
  const handleFlightClick = (flightId: string): void => {
    if (!flightId) return; // Do nothing if flightId is not provided
    const googleFlightsUrl: string = `https://www.google.com/search?q=${flightId}`;
    window.open(googleFlightsUrl, "_blank", "noopener,noreferrer");
  };

  /**
   * Formats a date string into "Month Day HH:MM EST" format.
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted date string.
   */
  // @ts-expect-error - unused but kept for future feature
  const _formatDateTime = (dateString: string): string => {
    if (!dateString || dateString === "None") return "N/A";
    try {
      const date: Date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      const dateOptions: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        timeZone: "America/New_York",
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/New_York",
      };

      const formattedDate: string = date.toLocaleDateString(
        "en-US",
        dateOptions
      );
      const formattedTime: string = date.toLocaleTimeString(
        "en-US",
        timeOptions
      );

      return `${formattedDate} ${formattedTime} EST`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error";
    }
  };

  /**
   * --- NEW: Formats only the time part of a date string. ---
   * This is used for individual flight rows, as the date is now a group header.
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted time string (e.g., "12:30 EST").
   */
  const formatTimeOnly = (dateString: string): string => {
    if (!dateString || dateString === "None") return "N/A";
    try {
      const safeDateString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
      const date: Date = new Date(safeDateString);
      if (isNaN(date.getTime())) return "Invalid Time";

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      };

      return `${date.toLocaleTimeString("en-US", timeOptions)} EST`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Error";
    }
  };

  /**
   * Sorts flights in descending order (latest first).
   * @returns {GateData[]} The sorted array of flight objects.
   */
  const getSortedFlights = (): GateData[] => {
    if (!Array.isArray(gateData) || gateData.length === 0) {
      return [];
    }
    return [...gateData].sort((a: GateData, b: GateData) => {
      const timeA = a.Scheduled ? new Date(a.Scheduled.endsWith("Z") ? a.Scheduled : a.Scheduled + "Z").getTime() : 0;
      const timeB = b.Scheduled ? new Date(b.Scheduled.endsWith("Z") ? b.Scheduled : b.Scheduled + "Z").getTime() : 0;
      if (!timeA) return 1;
      if (!timeB) return -1;
      return timeB - timeA;
    });
  };

  /**
   * --- NEW: Groups sorted flights by date. ---
   * This function transforms the flat sorted array into an object
   * where keys are formatted dates (e.g., "August 5") and
   * values are arrays of flights for that day.
   * @param {GateData[]} flights - The sorted array of flights.
   * @returns {Record<string, GateData[]>} An object with flights grouped by date.
   */
  const getGroupedFlights = (
    flights: GateData[]
  ): Record<string, GateData[]> => {
    return flights.reduce(
      (acc: Record<string, GateData[]>, flight: GateData) => {
        if (!flight.Scheduled) return acc; // Skip flights without a schedule

        try {
          const safeDateString = flight.Scheduled.endsWith("Z") 
            ? flight.Scheduled 
            : `${flight.Scheduled}Z`;
          

          const scheduleDate: Date = new Date(safeDateString);
          if (isNaN(scheduleDate.getTime())) return acc; // Skip invalid dates

          // Create a date key like "August 5". This will be our group header.
          const dateKey: string = scheduleDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          });

          // If this date key is new, create an entry for it.
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }

          // Add the flight to the correct date group.
          acc[dateKey].push(flight);
          return acc;
        } catch (error) {
          console.error("Error creating flight group:", error);
          return acc; // Skip flight if an error occurs
        }
      },
      {}
    ); // The initial value for our accumulator is an empty object.
  };

  const sortedFlights: GateData[] = getSortedFlights();
  // --- NEW: Create the grouped data structure for rendering ---
  const groupedFlights: Record<string, GateData[]> =
    getGroupedFlights(sortedFlights);
  const gateNumber: string =
    sortedFlights.length > 0 ? sortedFlights[0].Gate : "N/A";

  return (
    <div className="gate-card-wrapper">
      {showSearchBar && (
        <div className="combined-search" style={searchContainerStyle}>
          <Input userEmail="user@example.com" isLoggedIn={true} />
        </div>
      )}

      <div className="departure-gate-container" style={gateContainerStyle}>
        <h1 className="gate-heading">Gate {gateNumber}</h1>

        <div className="departure-board">
          <div className="board-header">
            <div className="header-column">Flight</div>
            <div className="header-column">Scheduled</div>
          </div>

          <div className="board-body">
            {Object.keys(groupedFlights).length > 0 ? (
              // --- NEW: Render Logic - Iterate over date groups first ---
              Object.entries(groupedFlights).map(
                ([date, flightsOnDate]: [string, GateData[]]) => (
                  // Use React.Fragment to group elements without adding extra nodes to the DOM
                  <React.Fragment key={date}>
                    <div className="date-group-header" style={dateHeaderStyle}>
                      {date}
                    </div>

                    {/* --- Then, map over the flights within that date group --- */}
                    {flightsOnDate.map((flight: GateData, index: number) => {
                      // --- STRIKE-THROUGH LOGIC ---
                      // The `is-past` class applies a strike-through if the flight has a 'departure' key.
                      const hasDeparted: boolean = "Departed" in flight;
                      const cardClassName: string = `flight-row-card ${
                        hasDeparted ? "is-past" : "is-future"
                      }`;

                      // --- LOGIC TO CHECK FOR FLIGHT DELAY ---
                      let isDelayed: boolean = false;
                      if (
                        flight.Scheduled &&
                        flight.Estimated &&
                        typeof flight.Estimated === "string"
                      ) {
                        try {
                          const scheduledDateTime: Date = new Date(
                            flight.Scheduled
                          );
                          const [estHours, estMinutes]: number[] =
                            flight.Estimated.split(":").map(Number);
                          const estimatedDateTime: Date = new Date(
                            scheduledDateTime.getTime()
                          );
                          estimatedDateTime.setHours(
                            estHours,
                            estMinutes,
                            0,
                            0
                          );
                          const differenceInMs: number =
                            estimatedDateTime.getTime() -
                            scheduledDateTime.getTime();
                          const differenceInMinutes: number =
                            differenceInMs / (1000 * 60);

                          if (differenceInMinutes > 5) {
                            isDelayed = true;
                          }
                        } catch (error) {
                          console.error(
                            "Error parsing flight times for delay calculation:",
                            error
                          );
                          isDelayed = false;
                        }
                      }

                      return (
                        <div
                          key={flight.FlightID || index} // Using FlightID for a more stable key
                          className={cardClassName}
                          onClick={() => handleFlightClick(flight.FlightID)}
                          // --- NEW: CONDITIONAL STYLING ---
                          // The style object combines the default cursor with the delayed styles if isDelayed is true.
                          style={{
                            cursor: "pointer",
                            ...(isDelayed && delayedFlightStyle), // Spread operator adds styles for delayed flights
                          }}
                        >
                          <div className="data-column flight-id">
                            {flight.FlightID || "N/A"}
                          </div>
                          <div className="data-column scheduled-time">
                            {/* --- MODIFIED: Use the new time-only formatter --- */}
                            {formatTimeOnly(flight.Scheduled)}
                            {/* The "(Delayed)" text is kept for clarity, reinforcing the visual style change. */}
                            {isDelayed && (
                              <div className="delayed-text">
                                Now @ {flight.Estimated}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                )
              )
            ) : (
              <div className="no-flights-card">
                <p>No departure information currently available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GateCard;
