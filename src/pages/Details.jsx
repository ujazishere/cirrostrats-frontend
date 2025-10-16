// Details.jsx

import React, { useState, useEffect, useRef, Suspense, lazy } from "react"; 
import { useLocation } from "react-router-dom";
import UTCTime from "../components/UTCTime";
import AirportCard from "../components/AirportCard";
import { FlightCard, GateCard } from "../components/Combined";
import { LoadingFlightCard } from "../components/Skeleton";
import useAirportData from "../components/AirportData";
import useGateData from "../components/GateData";
import useFlightData from "../components/FlightData";
import flightService from '../components/utility/flightService';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FeedbackPopup = lazy(() => import('../pages/FeedbackPopup.jsx'));
const apiUrl = import.meta.env.VITE_API_URL;

const Details = () => {
  const location = useLocation();
  const searchValue = location?.state?.searchValue;
  const previousSearchValueRef = useRef();

  useEffect(() => {
    previousSearchValueRef.current = searchValue;
  });
  const hasSearchChanged = JSON.stringify(previousSearchValueRef.current) !== JSON.stringify(searchValue);

  const {
    airportWx,
    nasResponseAirport,
    loadingWeather,
    airportError,
  } = useAirportData(searchValue, apiUrl);

  // Destructure the new granular loading states from our updated hook
  const {
    loadingFlight, // The primary loader for the main skeleton
    loadingEdct,
    loadingWeatherNas,
    data: flightData,
    weather: weatherResponseFlight,
    nas: nasResponseFlight,
    edct: EDCT,
    error: flightError,
  } = useFlightData(searchValue);

  const {
    loading: loadingGateData,
    data: gateData,
    error: gateError,
  } = useGateData(searchValue);

  // --- Feedback Popup Logic (unchanged) ---
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackType, setFeedbackType] = useState("Data Discrepancy"); 
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("Anonymous");

  useEffect(() => {
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }
  }, []);

  const handleFeedbackClick = (e) => {
    e.preventDefault();
    setShowFeedbackPopup(true);
  };
  
  const handleCloseFeedback = () => {
    setShowFeedbackPopup(false);
    setFeedbackMessage("");
    setFeedbackType("Data Discrepancy");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        user: userEmail,
        type: feedbackType,
        message: feedbackMessage,
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        context: JSON.stringify(searchValue || "No search value"),
      });
      const telegramMessage = `
New Feedback from Details Page! 📬
------------------------
👤 User: ${userEmail}
📝 Type: ${feedbackType}
💬 Message: ${feedbackMessage}
🔍 Context: ${JSON.stringify(searchValue || "No search value")}
      `;
      await flightService.postNotifications(telegramMessage);
      alert("Thank you! Your feedback has been submitted successfully.");
      handleCloseFeedback();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Sorry, there was an an error submitting your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- End Feedback Logic ---

  const isFlightSearch = searchValue?.type === 'flight' || searchValue?.type === 'N-Number';
  const hasError = flightError || airportError || gateError;
  const showFeedbackSection = searchValue && !loadingFlight && !hasError;

  const renderContent = () => {
    // Show the main skeleton UI ONLY while the primary flight data is loading.
    if (isFlightSearch && (hasSearchChanged || loadingFlight)) {
      return <LoadingFlightCard />;
    }

    if (searchValue) {
      switch (searchValue.type) {
        case "flight":
        case "N-Number":
          if (flightError) return <div>Error fetching flight data: {flightError}</div>;
          
          // As soon as `loadingFlight` is false, render the FlightCard
          // and pass down the secondary loading states to it.
          return flightData ? (
            <FlightCard
              flightData={flightData}
              weather={weatherResponseFlight}
              NAS={nasResponseFlight}
              EDCT={EDCT}
              isLoadingEdct={loadingEdct}
              isLoadingWeatherNas={loadingWeatherNas}
            />
          ) : (
            <div className="no-data-message">
              <p>No flight data could be found for this search.</p>
            </div>
          );
        // Other cases for airport/gate search are unchanged
        case "airport":
          if (airportError) return <div>Error fetching airport data: {airportError}</div>;
          return airportWx && Object.keys(airportWx).length > 0 ? (
            <AirportCard weatherDetails={airportWx} nasResponseAirport={nasResponseAirport} />
          ) : (
            <div className="no-data-message"><p>No weather or airport data is available.</p></div>
          );
        case "Terminal/Gate":
          if (gateError) return <div>Error fetching gate data: {gateError}</div>;
          return gateData && gateData.length > 0 ? (
            <GateCard gateData={gateData} currentSearchValue={searchValue} />
          ) : (
            <div className="no-data-message"><p>No departure information is available for this gate.</p></div>
          );
        default:
          return <p>Select a search type to begin.</p>;
      }
    }
    return <div className="no-data-message"><p>No results found. Please try a new search.</p></div>;
  };

  return (
    <div className="details">
      <style>{`.no-data-message { text-align: center; color: #6c757d; padding: 5rem 1rem; font-size: 1.1rem; }`}</style>
      <UTCTime />
      {searchValue ? renderContent() : <p>Please perform a search to see details.</p>}

      {showFeedbackSection && (
        <div className="feedback-trigger-container">
          <span onClick={handleFeedbackClick} className="feedback-trigger-link">
            Found an issue or data discrepancy? Report it.
          </span>
        </div>
      )}
      
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
    </div>
  );
};

export default Details;