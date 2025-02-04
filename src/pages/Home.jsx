import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Input from "../components/Input";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "react-google-button";
import axios from "axios";
import UTCTime from "../components/UTCTime"; // Import the UTC time component

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsLoggedIn(true);
    }
  }, []);

  // Styles for dynamic and static elements
  const styles = {
    logoutButton: {
      backgroundColor: "#4285F4",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "4px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      margin: "15px",
    },
    googleButton: {
      position: "fixed",
      bottom: "150px", // Adjust distance from the bottom
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99, // Ensure it appears above other elements
    },
  };

  // Determine redirect URI based on environment
  const redirectUri = window.location.hostname === "localhost"
    ? "http://localhost:5173/"
    : "https://beta.cirrostrats.us/";

  // Google Login Configuration
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        setUserInfo(userInfoResponse.data);
        setIsLoggedIn(true);
        localStorage.setItem("userInfo", JSON.stringify(userInfoResponse.data));
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: (errorResponse) => console.error("Google Login Error:", errorResponse),
    redirectUri,
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  return (
    <div className="home">
      <h2 className="home__title">Check Weather, Gate, and Flight Information.</h2>

      {/* Display UTC Time */}
      <UTCTime />

      {/* Input Component */}
      <Input />

      {/* Google Login or Logout Section */}
      {isLoggedIn ? (
        <div>
          <p>Logged in as: {userInfo?.name}</p>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#3367D6")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#4285F4")}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={styles.googleButton} className="google-button">
          <GoogleButton onClick={googleLogin} />
        </div>
      )}

      {/* Additional Content Placeholder */}
      <div className="home__content"></div>
    </div>
  );
};

export default Home;
