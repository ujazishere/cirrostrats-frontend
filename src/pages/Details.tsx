// ✅ ADD: Import useState, useEffect, Suspense, and lazy for the feedback popup functionality.
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom"; // Hook to access the current URL's location object, used here to get state passed during navigation.
import UTCTime from "../components/UTCTime"; // Displays the current time in UTC.
import { AirportToFetch } from "../types/index";
import AirportCard from "../components/AirportCard"; // A card component to display airport details.
import { FlightCard, GateCard } from "../components/Combined"; // Cards for displaying flight and gate information.
import { LoadingFlightCard } from "../components/Skeleton"; // A placeholder/skeleton UI shown while data is loading.
import useAirportData from "../components/utility/airportService.ts"; // Custom hook to fetch airport weather and NAS data.
import useGateData from "../components/GateData"; // Our newly separated custom hook for fetching gate-specific data.
import flightService from '../components/utility/flightService'; // A service module with helper functions for flight data retrieval.

// ✅ CHANGE: Import the newly created custom hook for fetching flight-specific data from its own file.
import useFlightData from "../components/FlightData.tsx"; // Our newly separated custom hook for fetching flight data.

// type FlightService = typeof flightService;

// ✅ ADD: Import Firebase and Firestore functions for submitting feedback.
import { db } from "../firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
  // Safely access the `searchValue` from the location's state. It might be undefined if the page is loaded directly.
  const searchValue = location?.state?.searchValue;

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
  const airportsToFetch: AirportToFetch = 
    searchValue?.type === "airport" && (searchValue?.referenceId || searchValue?.metadata.ICAO)

  // Hook for airport-specific searches.
  const {
    airportWx, // Weather data for the airport.
    nasResponseAirport, // NAS data for the airport.
    loadingWeather, // Loading state for the airport hook.
    airportError, // Error state for the airport hook.
  } = useAirportData(airportsToFetch, apiUrl);

  // Hook for flight-specific searches.
  // ✅ NOTE: This now calls the imported hook from `/components/flightData.jsx`.
  const {
    loadingFlight, // This is now the main loader for the initial skeleton
    loadingEdct,
    loadingWeatherNas,
    flightData: flightData,
    weather: weatherResponseFlight,
    nas: nasResponseFlight,
    edct: EDCT,
    error: flightError,
  } = useFlightData(searchValue);
  // Hook for gate-specific searches.
  const {
    loading: loadingGateData, // Loading state from the gate hook.
    data: gateData, // Gate data object.
    error: gateError, // Error state from the gate hook.
  } = useGateData(searchValue);

  // --- FEEDBACK POPUP LOGIC START ---
  // ✅ ADD: State and handlers for the feedback popup, mirrored from HomePage.js.
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  // ✅ ADD: Default feedback type to a more relevant option for this page.
  const [feedbackType, setFeedbackType] = useState("Data Discrepancy");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("Anonymous"); // State to hold the user's email.

  // ✅ ADD: An effect to get the user's email from local storage when the component mounts.
  useEffect(() => {
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }
  }, []); // The empty dependency array ensures this runs only once.

  // ✅ ADD: Handler function to open the feedback popup.
  const handleFeedbackClick = (e: any) => {
    e.preventDefault();
    setShowFeedbackPopup(true);
  };

  // ✅ ADD: Handler function to close the feedback popup and reset its state.
  const handleCloseFeedback = () => {
    setShowFeedbackPopup(false);
    setFeedbackMessage("");
    setFeedbackType("Data Discrepancy"); // Reset to the default type.
  };

  // ✅ ADD: Handler function for submitting the feedback form.
  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) return; // Prevent empty submissions.
    setIsSubmitting(true);

    try {
      // Add feedback document to the Firestore 'feedback' collection.
      await addDoc(collection(db, "feedback"), {
        user: userEmail,
        type: feedbackType,
        message: feedbackMessage,
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        // ✅ ADD: Include the current search context in the feedback for better debugging.
        context: JSON.stringify(searchValue || "No search value"),
      });

      // Format a detailed message for the Telegram notification.
      const telegramMessage = `
        New Feedback from Details Page! 📬
        ------------------------
        👤 User: ${userEmail}
        📝 Type: ${feedbackType}
        💬 Message: ${feedbackMessage}
        🔍 Context: ${JSON.stringify(searchValue || "No search value")}
      `;

      // Send the notification via our centralized flightService.
      try {
        await flightService.postNotifications(telegramMessage);
      } catch (error) {
        console.error("Telegram notification failed:", error); // Log silently without alerting the user.
      }

      alert("Thank you! Your feedback has been submitted successfully.");
      handleCloseFeedback();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Sorry, there was an an error submitting your feedback. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the submit button regardless of outcome.
    }
  };
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
  const showFeedbackSection = searchValue && !isContentLoading && !hasError;

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
    if (
      (isAirportSearch && (hasSearchChanged || loadingWeather)) ||
      (isGateSearch && (hasSearchChanged || loadingGateData))
    ) {
      return null;
    }

    // --- DATA, ERROR, and NO-DATA LOGIC ---
    // If we get here, it means all loading is complete and we are ready to display the final result.

    if (searchValue) {
      // A `switch` statement is a clean way to handle rendering for different search types.
      switch (searchValue.type) {
        // These two cases both result in showing the FlightCard.
        case "flight":
        case "N-Number":
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
              nasResponseAirport={nasResponseAirport}
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
          return <p>Select a search type to begin.</p>;
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

      {/* --- FEEDBACK LINK START (NOW WITH CORRECT VISIBILITY LOGIC) --- */}
      {/* ✅ BUG FIX: The entire feedback container is now conditionally rendered
          using the `showFeedbackSection` variable. This variable is only true
          when data has finished loading and no errors have occurred, preventing the flash. */}
      {showFeedbackSection && (
        <div className="feedback-trigger-container">
          <span onClick={handleFeedbackClick} className="feedback-trigger-link">
            Found an issue or data discrepancy? Report it.
          </span>
        </div>
      )}
      {/* --- FEEDBACK LINK END --- */}

      {/* --- FEEDBACK POPUP START --- */}
      {/* ✅ ADD: Suspense for the lazy-loaded FeedbackPopup component.
          It's conditionally rendered based on the 'showFeedbackPopup' state. */}
      <Suspense fallback={null}>
        {showFeedbackPopup && (
          <FeedbackPopup
            onClose={handleCloseFeedback}
            onSubmit={handleSubmitFeedback}
            feedbackType={feedbackType}
            setFeedbackType={setFeedbackType}
            feedbackMessage={feedbackMessage}
            setFeedbackMessage={setFeedbackMessage}
            isSubmitting={isSubmitting}
          />
        )}
      </Suspense>
      {/* --- FEEDBACK POPUP END --- */}
    </div>
  );
};

// Export the component to make it available for use in other parts of the application, like the router.
export default Details;
