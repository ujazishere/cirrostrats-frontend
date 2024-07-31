import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Input from "../components/Input";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "react-google-button";
import axios from "axios";
import "./Home.css"; // Import the CSS file

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      try {
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        setUserInfo(userInfoResponse.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: (errorResponse) => console.log(errorResponse),
    redirectUri: "http://localhost:5173/",
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  return (
    <div className="home">
      <h2 className="home-title">Check Weather, Gate And Flight Information.</h2>
      <div className="search-container">
        <Input />
      </div>
      <NavLink to="/guide" className="home-link">
        Guide
      </NavLink>
      <NavLink to="https://cirrostrats.us/live_map" className="home-link">
        Live Map
      </NavLink>

      {isLoggedIn ? (
        <div>
          <p>Logged in as: {userInfo?.name}</p>
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

      <div className="home-content">
        {/* Your content here */}
      </div>
    </div>
  );
};

export default Home;
