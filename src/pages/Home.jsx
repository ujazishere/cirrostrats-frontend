// src/pages/HomePage.js

// By using Suspense and lazy, we can split our code into smaller chunks.
// This is a key strategy for improving initial page load speed.
import React, { useState, useEffect, Suspense, lazy } from 'react';

import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import axios from 'axios';
import Input from "../components/Input/Index"; // Ensure this path is correct
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ✨ LAZY LOADING FOR PERFORMANCE
// We are lazily importing the FeedbackPopup component.
// This means the code for the popup is in a separate file ('chunk').
// It will only be downloaded from the server when a user actually clicks the feedback link,
// which reduces the initial JavaScript bundle size and makes the page load faster.
const FeedbackPopup = lazy(() => import('./FeedbackPopup.jsx'));

const HomePage = () => {
  // State for login and user information
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState("Anonymous");
  
  // State for the animated footer text
  const [footerTextIndex, setFooterTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
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
  
  // Effect for the animated footer text cycle. This runs after initial render
  // and does not impact the initial load time.
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setFooterTextIndex((prevIndex) => (prevIndex + 1) % footerTexts.length);
        setIsFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [footerTexts.length]);

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
        const email = userData.email;
        const fullName = `${userData.given_name} ${userData.family_name}`;
        
        setUserInfo(userData);
        setUserEmail(fullName);
        setIsLoggedIn(true);
        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("userEmail", fullName);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: (errorResponse) => console.error("Google Login Error:", errorResponse),
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setUserEmail("Anonymous");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userEmail");
  };

  const handleFeedbackClick = (e) => {
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
      await addDoc(collection(db, "feedback"), {
        user: userEmail,
        type: feedbackType,
        message: feedbackMessage,
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      alert("Thank you! Your feedback has been submitted successfully.");
      handleCloseFeedback();

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Sorry, there was an error submitting your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🚀 PERFORMANCE OPTIMIZATION NOTE:
          This <link> tag loads the entire Font Awesome CSS library. This is a "render-blocking"
          resource, meaning the browser must download and parse it before showing the page.
          
          A better approach is to use a library like '@fortawesome/react-fontawesome'
          to import only the specific icons you need (e.g., the envelope icon).
          This would remove this network request and reduce your bundle size.
      */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      
      {/* Hero section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">Cirrostrats</h1>
          <h2 className="hero-title-2">Unified Aviation Information Platform.</h2>

          {/* Search input */}
          <Input userEmail={userEmail} isLoggedIn={isLoggedIn} />
          
          {/* Navigation links moved directly below search bar */}
          <div className="nav-links-container">
            <div className="nav-links">
              <span className="nav-link">Weather Reports</span>
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
      
      {/* Login/Logout section */}
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
            <GoogleButton onClick={() => googleLogin()} />
          )}
        </div>
      </div>

      {/* Features section */}
      <div className="features-section">
        <div className="container">
          {/* Content area */}
        </div>
      </div> 

      {/* Footer - Animated */}
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

      {/* ✨ RENDERING THE LAZY COMPONENT
          The <Suspense> component is required by React to handle lazy loading.
          It will show the 'fallback' UI (in this case, nothing) while it waits for
          the FeedbackPopup component's code to be downloaded and ready.
      */}
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