// ✅ ADD: Import useState, useEffect, Suspense, and lazy for the feedback popup functionality.
import {
  // useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  lazy,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Hook to access the current URL's location object, used here to get state passed during navigation.
import UTCTime from "../components/UTCTime"; // Displays the current time in UTC.
import { AirportToFetch } from "../types/index";
import AirportCard from "../components/AirportCard"; // A card component to display airport details.
import { FlightCard, GateCard } from "../components/Combined"; // Cards for displaying flight and gate information.
import { LoadingFlightCard, LoadingAirportCard } from "../components/Skeleton"; // A placeholder/skeleton UI shown while data is loading.
import useAirportData from "../components/utility/airportService.ts"; // Custom hook to fetch airport weather and NAS data.
import useGateData from "../components/GateData"; // Our newly separated custom hook for fetching gate-specific data.
import Input from "../components/Input/Index";

// ✅ CHANGE: Import the newly created custom hook for fetching flight-specific data from its own file.
import useFlightData from "../components/FlightData.tsx"; // Our newly separated custom hook for fetching flight data.
// import searchService from "../components/Input/api/searchservice"; //
// import { formatRawSearchResults } from "../components/Input/utils/searchUtils"; //

// ✅ ADD: Import the custom feedback hook.
import useFeedback from "../hooks/useFeedback";

// ✅ ADD: Lazily import the FeedbackPopup component for better performance.
// This ensures the popup's code is only downloaded when it's first needed.
const FeedbackPopup = lazy(() => import("../pages/FeedbackPopup"));

// =================================================================================
// Configuration
// =================================================================================
// Retrieve the API's base URL from environment variables. This is a best practice for security and configuration management.
const apiUrl = import.meta.env.VITE_API_URL;

// =================================================================================
// Details Component (Refactored)
// This is the main component for this view. Its primary role is to orchestrate the
// data fetching via hooks and render the appropriate UI based on the current state.
// =================================================================================

/**
 * The Details component displays information based on a search value from the URL state.
 * It acts as a controller, delegating data fetching to custom hooks and rendering
 * sub-components based on the search type and data availability.
 *
 * @param {object} location.state - The state passed from react-router during navigation.
 * @param {object} location.state.searchValue - The core search object that drives the component's behavior.
 * @property {string} searchValue.type - The type of search (e.g., "flight", "airport", "Terminal/Gate", "N-Number").
 * @property {string} searchValue.value - The primary value for the search (e.g., flight number, airport code).
 * @property {string} searchValue.label - A user-friendly label for the search term, often used for display.
 * @property {string} [searchValue.referenceId] - A specific reference id to direct the search to the correct database collection.
 */
const Details = () => {
  // Access the location object provided by React Router.
  const location = useLocation();
  const navigate = useNavigate();
  // Safely access the `searchValue` from the location's state. It might be undefined if the page is loaded directly.
  const searchValue = location?.state?.searchValue;
  const submitTermString = location?.state?.submitTermString;

  // const [possibleSimilarMatches, setPossibleSimilarMatches] = useState(
  //   location?.state?.possibleMatches || []
  // );

  // useEffect(() => {
  //   if (submitTermString && submitTermString.length > 0) {
  //     console.log("Loading background matches for:", submitTermString);

  //     const fetchBackgroundMatches = async () => {
  //       try {
  //         // Perform the slow search now, while the user is already looking at the page
  //         const rawReturn = await searchService.fetchRawQuery(
  //           submitTermString.toUpperCase()
  //         );
  //         const formattedResults = formatRawSearchResults(rawReturn);

  //         setPossibleSimilarMatches(formattedResults);
  //       } catch (error) {
  //         console.error("Background fetch failed", error);
  //       }
  //     };

  //     fetchBackgroundMatches();
  //   }
  // }, [submitTermString]);

  // ✅ FIX: Use a ref to track the previous search value. This is essential to detect
  // the very first render after a search has changed, which is when states can be inconsistent.
  const previousSearchValueRef = useRef();
  useEffect(() => {
    previousSearchValueRef.current = searchValue;
  });
  // ✅ FIX: Determine if the search has just changed by comparing the current and previous values.
  const hasSearchChanged =
    JSON.stringify(previousSearchValueRef.current) !==
    JSON.stringify(searchValue);

  // =================================================================================
  // Hook Instantiation
  // Here, we call our custom hooks, passing the `searchValue`.
  // The component subscribes to the state changes from these hooks.
  // =================================================================================

  // Prepare airport data for the hook - abstract searchValue processing here
  const airportsToFetch: AirportToFetch | null = useMemo(() => {
    // if (possibleSimilarMatches) return null;
    if (searchValue?.type !== "airport") return null;
    return {
      ICAOAirportCode:
        searchValue?.metadata?.ICAOAirportCode ||
        searchValue?.metadata?.ICAO ||
        searchValue?.label ||
        null,
      referenceId: searchValue?.referenceId || null,
    };
  }, [searchValue]);

  // Hook for airport-specific searches.
  const {
    airportWxLive,
    airportWxMdb,
    nasResponseAirport,
    loadingWeather,
    airportError,
  } = useAirportData(airportsToFetch, apiUrl);
  const airportWx = airportWxLive || airportWxMdb;

  // Hook for flight-specific searches.
  // ✅ NOTE: This now calls the imported hook from `/components/flightData.jsx`.
  const {
    loadingFlight, // This is now the main loader for the initial skeleton
    loadingEdct,
    loadingWeatherNas,
    flightData: flightData,
    // rawSubmitTerm: rawSubmitTerm,
    possibleSimilarMatches,
    weather: weatherResponseFlight,
    nas: nasResponseFlight,
    edct: EDCT,
    error: flightError,
  } = useFlightData(searchValue, submitTermString);

  // Hook for gate-specific searches.
  const {
    loading: loadingGateData, // Loading state from the gate hook.
    data: gateData, // Gate data object.
    error: gateError, // Error state from the gate hook.
  } = useGateData(possibleSimilarMatches ? null : searchValue);

  // --- FEEDBACK POPUP LOGIC START ---
  // ✅ ADD: Use the custom feedback hook with context for better debugging.
  const {
    showFeedbackPopup,
    feedbackType,
    setFeedbackType,
    feedbackMessage,
    setFeedbackMessage,
    isSubmitting,
    handleFeedbackClick,
    handleCloseFeedback,
    handleSubmitFeedback,
  } = useFeedback({
    defaultFeedbackType: "Data Discrepancy",
    context: searchValue || "No search value",
    customTelegramMessage: (userEmail, feedbackType, feedbackMessage, context) => `
        New Feedback from Details Page! 📬
        ------------------------
        👤 User: ${userEmail}
        📝 Type: ${feedbackType}
        💬 Message: ${feedbackMessage}
        🔍 Context: ${JSON.stringify(context)}
      `,
  });
  // --- FEEDBACK POPUP LOGIC END ---

  // =================================================================================
  // BUG FIX: Logic to sync content and feedback section visibility
  // =================================================================================
  const isFlightSearch =
    searchValue?.type === "flight" || searchValue?.type === "N-Number";
  const isAirportSearch = searchValue?.type === "airport";
  const isGateSearch = searchValue?.type === "gate";

  // Determine if we are in a loading state that should hide the main content.
  // This logic MUST match the loading checks inside `renderContent` to prevent mismatches.
  let isContentLoading = false;
  if (isFlightSearch && (hasSearchChanged || loadingFlight)) {
    isContentLoading = true;
  }
  if (
    (isAirportSearch && (hasSearchChanged || loadingWeather)) ||
    (isGateSearch && (hasSearchChanged || loadingGateData))
  ) {
    isContentLoading = true;
  }

  // Determine if there's any error from the data hooks.
  const hasError = flightError || airportError || gateError;

  // The final condition for showing the feedback section:
  // A search must exist, content should not be loading, and there must be no errors.
  const showFeedbackSection = searchValue && !isContentLoading;

  // TODO ismail: used for ambiguous search to show multiple options on the details page.
  const handleSuggestionClick = useCallback(
    (suggestion: any) => {
      navigate("/details", {
        state: { searchValue: suggestion },
      });
    },
    [navigate]
  ); // Dependency array
  // without useCallback
  // const handleSuggestionClick = (suggestion: any) => {
  //   navigate("/details", {
  //     state: { searchValue: suggestion }
  //   });
  // };

  // =================================================================================
  // Render Logic
  // This function determines what to display on the screen based on the collective
  // state of our data hooks (loading, error, or success).
  // =================================================================================
  const renderContent = () => {
    // ✅ FIX: This entire render block is new. It handles all loading states at the top
    // to ensure the correct UI (skeleton, nothing, or data) is shown without flashing.

    // --- LOADING LOGIC ---
    // Note: The logic here is now mirrored above for the `showFeedbackSection` variable.
    if (isFlightSearch && (hasSearchChanged || loadingFlight)) {
      return <LoadingFlightCard />;
    }

    if (loadingWeather === true) {
      return <LoadingAirportCard />;
    }

    if (
      (isAirportSearch && (hasSearchChanged || loadingWeather)) ||
      (isGateSearch && (hasSearchChanged || loadingGateData))
    ) {
      return null;
    }

    // --- DATA, ERROR, and NO-DATA LOGIC ---
    // If we get here, it means all loading is complete and we are ready to display the final result.

    // // TODO ismail : ismail's code to show multiple options on raw submit: This is a fallback code when nothing is matches for exact match and multiple results are available.
    // if (possibleSimilarMatches && possibleSimilarMatches.length > 0) {
    //   return (
    //     <div className="ambiguous-results-container">
    //       <h2>No exact match found for "{searchValue?.label}"</h2>
    //       <p>Did you mean one of these?</p>

    //       <div className="suggestions-grid">
    //         {possibleSimilarMatches.map((item: any) => (
    //           <div
    //             key={item.id}
    //             className="suggestion-card"
    //             onClick={() => handleSuggestionClick(item)}
    //             style={{ cursor: "pointer", padding: "10px", border: "1px solid #ccc", margin: "5px 0" }} // Inline style just for functionality
    //           >
    //             <strong>{item.label}</strong>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   );
    // }

    if (searchValue) {
      // A `switch` statement is a clean way to handle rendering for different search types.
      switch (searchValue.type) {
        // These two cases both result in showing the FlightCard.
        case "flight":
        case "nNumber":
          if (flightError)
            return <div>Error fetching flight data: {flightError}</div>;
          // Render the FlightCard only if `flightData` is available (truthy and not null).
          return flightData ? (
            <FlightCard
              flightData={flightData}
              weather={weatherResponseFlight}
              NAS={nasResponseFlight ?? {}}
              EDCT={EDCT}
              isLoadingEdct={loadingEdct}
              isLoadingWeatherNas={loadingWeatherNas}
              possibleSimilarMatches={possibleSimilarMatches}
            />
          ) : (
            <div className="no-data-message">
              <p>No flight data could be found for this search.</p>
            </div>
          );

        case "airport":
          if (airportError)
            return <div>Error fetching airport data: {airportError}</div>;
          // FIX: Check if airportWx is a non-empty object. An empty object {} is truthy.
          return airportWx && Object.keys(airportWx).length > 0 ? (
            <AirportCard
              weatherDetails={airportWx}
              nasResponseAirport={nasResponseAirport ?? {}} // TODO ismail: fix this
            />
          ) : (
            <div className="no-data-message">
              <p>No weather or airport data is available.</p>
            </div>
          );

        case "gate":
          if (gateError)
            return <div>Error fetching gate data: {gateError}</div>;
          // FIX: Check if gateData is a non-empty array. An empty array [] is truthy.
          return gateData && gateData.length > 0 ? (
            <GateCard gateData={gateData} />
          ) : (
            <div className="no-data-message">
              <p>No departure information is available for this gate.</p>
            </div>
          );

        // A default case is good practice for unhandled search types.
default:
          return (
            <div className="error-container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "1.5rem" }}>
                Nothing found. Would you like to tell us what you were trying to search? ⁠
              </p>
              {/* Reuse the Input component here. We pass "Anonymous" since we are not in the main auth flow context */}
              <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                <Input userEmail="Anonymous" isLoggedIn={false} />
              </div>

              {/* ✅ ADDED: Inline Feedback Form */}
              <div className="inline-feedback-form" style={{ maxWidth: "480px", margin: "0 auto", textAlign: "left", padding: "24px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                  Report Missing Data
                </h3>
                
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "500", color: "#475569" }}>
                  Issue Type
                </label>
                <select 
                  value={feedbackType} 
                  onChange={(e) => setFeedbackType(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                >
                  <option value="Data Discrepancy">Data Discrepancy</option>
                  <option value="Missing Flight">Missing Flight</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Other">Other</option>
                </select>

                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "500", color: "#475569" }}>
                  Details
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Please tell us what flight or airport you were looking for..."
                  rows={4}
                  style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "6px", border: "1px solid #cbd5e1", resize: "vertical", fontFamily: "inherit" }}
                />

                <button 
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  style={{ 
                    backgroundColor: isSubmitting ? "#94a3b8" : "#2563eb", 
                    color: "white", 
                    padding: "12px 24px", 
                    borderRadius: "8px", 
                    border: "none", 
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    width: "100%",
                    transition: "background-color 0.2s"
                  }}
                >
                  {isSubmitting ? "Sending..." : "Submit Report"}
                </button>
              </div>
            </div>
          );
      }
    }

    // Fallback message if there's no data to display after all checks.
    return (
      <div className="no-data-message">
        <p>No results found. Please try a new search.</p>
      </div>
    );
  };

  // =================================================================================
  // Component Return
  // This is the final JSX structure of the component.
  // =================================================================================
  return (
    // The main container div for the details page.
    <div className="details">
      {/* ++ FIX: ADD THIS STYLE BLOCK ++ */}
      <style>{`
        .no-data-message {
          text-align: center;
          color: #6c757d; /* A muted text color */
          padding: 5rem 1rem;
          font-size: 1.1rem;
        }
      `}</style>

      {/* The UTC time component is always displayed. */}
      <UTCTime />
      {/* Conditionally render the main content.
        If `searchValue` exists, we call `renderContent()` to go through the loading/error/data logic.
        If `searchValue` doesn't exist (e.g., on initial page load), we show a prompt to the user.
      */}
      {searchValue ? (
        renderContent()
      ) : (
        <p>Please perform a search to see details.</p>
      )}
    </div>
  );
};

// Export the component to make it available for use in other parts of the application, like the router.
export default Details;
