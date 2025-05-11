/* Add this CSS style at the top of your CSS file */
const loginStyles = {
  login: {
    position: 'fixed',
    bottom: '1.5rem',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 10,
  },
  container: {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userEmail: {
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import axios from 'axios';
import Input from "../components/Input/Index"; // Ensure this path is correct

const HomePage = () => {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userInfo, setUserInfo] = useState(null);
const [userEmail, setUserEmail] = useState("Anonymous");
const [currentUTC, setCurrentUTC] = useState("");

useEffect(() => {
  const storedUserInfo = localStorage.getItem("userInfo");
  const storedUserEmail = localStorage.getItem("userEmail");
  if (storedUserInfo && storedUserEmail) {
    setUserInfo(JSON.parse(storedUserInfo));
    setUserEmail(storedUserEmail);
    setIsLoggedIn(true);
  }

  // UTC Clock update
  const updateClock = () => {
    const now = new Date();
    const utcString = now.toUTCString().split(' ');
    setCurrentUTC(`${utcString[4]} UTC`);
  };

  updateClock();
  const interval = setInterval(updateClock, 1000);

  return () => clearInterval(interval);
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

return (
  <div className="min-h-screen bg-slate-50">
    {/* Hero section */}
    <div className="hero-section">
      <div className="container">
        <h2 className="hero-title">
          Check Weather, Gate, and Flight Information
        </h2>

        {/* Search input */}
        <Input userEmail={userEmail} isLoggedIn={isLoggedIn} />
      </div>
    </div>

    {/* Login/Logout section - visible on all devices */}
    <div style={loginStyles.login}>
      <div style={loginStyles.container}>
        {isLoggedIn ? (
          <div style={loginStyles.userProfile}>
            <span style={loginStyles.userEmail}>{userEmail}</span>
            <button 
              onClick={handleLogout}
              style={loginStyles.logoutButton}
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
        <h3 className="section-title">Aviation Information at Your Fingertips</h3>

        <div className="features-grid">
          <div className="feature-card">
            <div className="card-header weather-header">
              <h4 className="card-title">Weather Reports</h4>
            </div>
            <div className="card-body">
              <p className="card-text">Access the latest METAR, TAF, and ATIS information.</p>
            </div>
          </div> 

          <div className="feature-card">
            <div className="card-header flight-header">
              <h4 className="card-title">Flight Details</h4>
            </div>
            <div className="card-body">
              <p className="card-text">Track flight status, gate information, and much more.</p>
              <div className="flight-route">
                <div className="airport-info">
                </div>
                <div className="route-line">
                  <div className="route-marker"></div>
                </div>
                <div className="airport-info">
                </div>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <div className="card-header notam-header">
              <h4 className="card-title">NAS</h4>
            </div>
            <div className="card-body">
              <p className="card-text">Stay informed about critical notices, restrictions.</p>
              <div className="notam-alert">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 

    {/* Footer */}
    <footer>
      <div className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-title"></div>
          </div>
        </div>
        <div className="footer-copyright">
          © 2025 Cirrostrats. All rights reserved.
        </div>
      </div>
    </footer> 
  </div>
);
};

export default HomePage;