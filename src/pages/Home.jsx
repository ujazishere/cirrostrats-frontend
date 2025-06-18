import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import axios from 'axios';
import Input from "../components/Input/Index"; // Ensure this path is correct

// Import your CSS file here
// import './HomePage.css';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState("Anonymous");
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserInfo && storedUserEmail) {
      setUserInfo(JSON.parse(storedUserInfo));
      setUserEmail(storedUserEmail);
      setIsLoggedIn(true);
    }

    // Add mobile styles to document head if needed
    // const styleElement = document.createElement('style');
    // styleElement.textContent = mobileStyles;
    // document.head.appendChild(styleElement);

    // return () => {
    //   if (document.head.contains(styleElement)) {
    //     document.head.removeChild(styleElement);
    //   }
    // };
  }, []);

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

  const handleLinkHover = (linkType) => {
    setHoveredLink(linkType);
  };

  const handleLinkLeave = () => {
    setHoveredLink(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* FontAwesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      
      {/* Hero section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Cirrostrats
          </h1>
          <h2 className="hero-title-2">
            Unified Aviation Information Platform.
          </h2>

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
      
      {/* Login/Logout section - visible on all devices */}
      <div className="login-section">
        <div className="login-container">
          {isLoggedIn ? (
            <div className="user-profile">
              <span className="user-email">{userEmail}</span>
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
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

      {/* Footer - Single footer with email support link */}
      <footer className="footer-support">
        <div className="footer-support-container">
          <a 
            href="mailto:publicuj@gmail.com"
            className={`footer-support-link ${hoveredLink === 'email' ? 'hovered' : ''}`}
            onMouseEnter={() => handleLinkHover('email')}
            onMouseLeave={handleLinkLeave}
          >
            <i className={`fas fa-envelope footer-support-icon ${hoveredLink === 'email' ? 'hovered' : ''}`}></i>
            Email for Support
          </a>
        </div>
      </footer> 
    </div>
  );
};

export default HomePage;