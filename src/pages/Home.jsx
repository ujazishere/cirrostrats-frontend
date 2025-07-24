import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import axios from 'axios';
import Input from "../components/Input/Index"; // Ensure this path is correct


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
      setIsFading(true); // Start fade-out

      // After the fade-out animation (500ms), change the text and fade back in
      setTimeout(() => {
        setFooterTextIndex((prevIndex) => (prevIndex + 1) % footerTexts.length);
        setIsFading(false); // Start fade-in
      }, 500);

    }, 5000); // Cycle every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
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
        setUserEmail(fullName); // Store full name instead of email
        setIsLoggedIn(true);
        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("userEmail", fullName); // Store full name in localStorage
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
          <a href="mailto:publicuj@gmail.com" className="footer-support-link">
            <i className="fas fa-envelope footer-support-icon"></i>
            <span className={`footer-text ${isFading ? 'fade-out' : 'fade-in'}`}>
              {footerTexts[footerTextIndex]}
            </span>
          </a>
        </div>
      </footer> 
    </div>
  );
};

export default HomePage;