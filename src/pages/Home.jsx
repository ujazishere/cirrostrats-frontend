import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import axios from 'axios';
import Input from "../components/Input/Index"; // Ensure this path is correct
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState("Anonymous");
  
  // State for the animated footer
  const [footerTextIndex, setFooterTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const footerTexts = [
    "Request a feature",
    "Click here for support",
    "Give us feedback",
  ];

  // State for feedback popup
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button on submit

  // Effect for checking stored login information
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

  // ✨ --- UPDATED SUBMIT FUNCTION --- ✨
  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) return; // Don't submit empty feedback
    
    setIsSubmitting(true);

    try {
      // Create a new document in the "feedback" collection
      await addDoc(collection(db, "feedback"), {
        user: userEmail,
        type: feedbackType,
        message: feedbackMessage,
        submittedAt: serverTimestamp(), // Adds a server-side timestamp
        userAgent: navigator.userAgent, // Optional: useful for debugging
      });

      alert("Thank you! Your feedback has been submitted successfully.");
      handleCloseFeedback(); // Close the popup

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Sorry, there was an error submitting your feedback. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* FontAwesome CDN */}
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

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <div className="feedback-overlay">
          <div className="feedback-popup">
            <div className="feedback-header">
              <h2 className="feedback-title">Send us your feedback</h2>
              <button onClick={handleCloseFeedback} className="feedback-close">
                ✕
              </button>
            </div>
            
            <div className="feedback-content">
              <div className="feedback-field">
                <label className="feedback-label">Type of feedback</label>
                <select 
                  value={feedbackType} 
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="feedback-select"
                >
                  <option value="General Feedback">General Feedback</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div className="feedback-field">
                <label className="feedback-label">Your message</label>
                <textarea 
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Please describe your feedback, feature request, or issue in detail..."
                  className="feedback-textarea"
                />
              </div>
            </div>

            <div className="feedback-actions">
              <button onClick={handleCloseFeedback} className="feedback-cancel">
                Cancel
              </button>
              <button 
                onClick={handleSubmitFeedback} 
                className="feedback-submit"
                disabled={!feedbackMessage.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;