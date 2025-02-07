import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "react-google-button";
import axios from "axios";
import Input from "../components/Input";
import UTCTime from "../components/UTCTime";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    const storedUserEmail = localStorage.getItem("userEmail");

    if (storedUserInfo && storedUserEmail) {
      setUserInfo(JSON.parse(storedUserInfo));
      setUserEmail(storedUserEmail);
      setIsLoggedIn(true);
      console.log("User is already logged in:", storedUserEmail);
    }
  }, []);

  const googleLogin = useGoogleLogin({
    scope: "openid profile email", // Ensure correct scope
    onSuccess: async (tokenResponse) => {
      console.log("Google Login Successful, Token Received:", tokenResponse);

      try {
        const { access_token } = tokenResponse;
        console.log("Access Token:", access_token);

        // Fetch user info from Google
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const userData = userInfoResponse.data;
        console.log("User Info from Google:", userData);

        const email = userData.email;
        setUserInfo(userData);
        setUserEmail(email);
        setIsLoggedIn(true);

        // Save user info in localStorage
        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("userEmail", email);

        // Send user email to the backend
        await axios.post("http://localhost:8000/save-user", { email });

        // Log email in console
        console.log("Logged in user's email:", email);

      } catch (error) {
        console.error("Error fetching user info:", error.response?.data || error.message);
      }
    },
    onError: (errorResponse) => console.error("Google Login Error:", errorResponse),
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setUserEmail(null);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userEmail");
    console.log("User logged out.");
  };

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
      bottom: "150px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99,
    },
  };

  return (
    <div className="home">
      <h2 className="home__title">Check Weather, Gate, and Flight Information.</h2>

      {/* Display UTC Time */}
      <UTCTime />

      {/* Input Component */}
      <Input />

      {isLoggedIn ? (
        <div>
          <p>Logged in as: {userInfo?.name} ({userEmail})</p>
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

      <div className="home__content"></div>
    </div>
  );
};

export default Home;
