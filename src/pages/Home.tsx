// src/pages/HomePage.js

// By using Suspense and lazy, we can split our code into smaller chunks.
// This is a key strategy for improving initial page load speed.
import { useState, useEffect, Suspense, lazy } from "react";

// --- GOOGLE LOGIN DISABLED ---
// The following imports are commented out to disable Google Login.
// import { useGoogleLogin } from '@react-oauth/google';
// import GoogleButton from 'react-google-button';
// import axios from 'axios';
// --- END ---

import Input from "../components/Input/Index"; // Ensure this path is correct
import { db } from "../firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import flightService from "../components/utility/flightService.js";

// ✨ LAZY LOADING FOR PERFORMANCE
// We are lazily importing the FeedbackPopup component.
const FeedbackPopup = lazy(() => import("./FeedbackPopup"));

const HomePage = () => {
  // State for login and user information
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [_userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState("Anonymous");

  // State for the animated footer text
  const [_footerTextIndex, setFooterTextIndex] = useState(0);
  const [_isFading, setIsFading] = useState(false);
  const footerTexts = [
    "Request a feature",
    "Click here for support",
    "Give us feedback",
  ];

  // State for feedback popup functionality
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button on submit

  // Effect for checking stored login information on initial load
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserInfo && storedUserEmail) {
      setUserInfo(JSON.parse(storedUserInfo));
      setUserEmail(storedUserEmail);
      setIsLoggedIn(true);
    }
  }, []);

  // Effect for the animated footer text cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setFooterTextIndex(prevIndex => (prevIndex + 1) % footerTexts.length);
        setIsFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [footerTexts.length]);

  // --- GOOGLE LOGIN DISABLED ---
  // The 'googleLogin' function and its related logic remain commented out.
  /*
  const googleLogin = useGoogleLogin({
    scope: "openid profile email",
    onSuccess: async (tokenResponse) => {
      try {
        const { access_token } = tokenResponse;
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const userData = userInfoResponse.data;
        setUserInfo(userData);
        setUserEmail(`${userData.given_name} ${userData.family_name}`);
        setIsLoggedIn(true);
        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("userEmail", `${userData.given_name} ${userData.family_name}`);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: (errorResponse) => console.error("Google Login Error:", errorResponse),
  });
  */
  // --- END ---

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setUserEmail("Anonymous");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userEmail");
  };

  // @ts-expect-error - unused
  const _handleFeedbackClick = (e: any) => {
    e.preventDefault();
    setShowFeedbackPopup(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackPopup(false);
    setFeedbackMessage("");
    setFeedbackType("General Feedback");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) return;

    setIsSubmitting(true);

    try {
      // Step 1: Add the feedback to Firebase (existing functionality)
      await addDoc(collection(db, "feedback"), {
        user: userEmail,
        type: feedbackType,
        message: feedbackMessage,
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      // --- MODIFICATION STARTS HERE ---

      // Step 2: Create a formatted message for the Telegram bot
      const telegramMessage = `
New Feedback Received! 📬
------------------------
👤 User: ${userEmail}
📝 Type: ${feedbackType}
💬 Message: ${feedbackMessage}
    `;

      // --- MODIFICATION IS HERE ---
      // We call the notification service and add a .catch() to log any
      // potential errors silently, without affecting the user.
      try {
        await flightService.postNotifications(telegramMessage);
      } catch (error) {
        console.error("Telegram notification failed:", error);
      }

      alert("Thank you! Your feedback has been submitted successfully.");
      handleCloseFeedback();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert(
        "Sorry, there was an error submitting your feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🚀 PERFORMANCE OPTIMIZATION NOTE:
          Consider using a library like '@fortawesome/react-fontawesome' 
          to import only the icons you need, rather than loading the entire library.
      */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      {/* Hero section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">Cirrostrats</h1>
          <h2 className="hero-title-2">
            Unified Aviation Information Platform.
          </h2>

          {/* Search input */}
          <Input userEmail={userEmail} isLoggedIn={isLoggedIn} />

          {/* Navigation links moved directly below search bar */}
          <div className="nav-links-container">
            <div className="nav-links">
              <span className="nav-link">Weather</span>
              <span className="nav-separator">•</span>
              <span className="nav-link">Flight Details</span>
              <span className="nav-separator">•</span>
              <span className="nav-link">NAS</span>
              <span className="nav-separator">•</span>
              <span className="nav-link">Gate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login/Logout section
      <div className="login-section">
        <div className="login-container">
          {isLoggedIn ? (
            <div className="user-profile">
              <span className="user-email">{userEmail}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            // --- BUTTON UPDATED HERE ---
            // Added target="_blank" to open the link in a new tab.
            // Added rel="noopener noreferrer" for security.
            <a
              href="https://legacy.cirrostrats.us/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "10px 16px",
                backgroundColor: "#24292f",
                color: "white",
                textDecoration: "none",
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "12px",
              }}
            >
              Revert Back To Legacy
            </a>
            // --- END OF BUTTON ---
          )}
        </div>
      </div> */}

      {/* Features section */}
      <div className="features-section">
        <div className="container">{/* Content area */}</div>
      </div>

      <footer className="simple-footer">
        <div className="simple-footer-container">
          <p>© 2025 Cirrostrats. All rights reserved.</p>
        </div>
      </footer>

      {/* --- FOOTER COMMENTED OUT --- */}
      {/*
      <footer className="footer-support">
        <div className="footer-support-container">
          <a href="#" onClick={handleFeedbackClick} className="footer-support-link">
            <i className="fas fa-envelope footer-support-icon"></i>
            <span className={`footer-text ${isFading ? 'fade-out' : 'fade-in'}`}>
              {footerTexts[footerTextIndex]}
            </span>
          </a>
        </div>
      </footer>
      */}
      {/* --- END OF FOOTER --- */}

      {/* Suspense for Lazy Loaded Component */}
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

export default HomePage;
