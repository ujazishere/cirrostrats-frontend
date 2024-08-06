import { NavLink } from "react-router-dom";
import Input from "../components/Input";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "react-google-button";
import axios from "axios";
import "./Home.css"; // Import the CSS file
import React, { useState, useEffect } from 'react';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false); // Add this state if it's needed

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) { // Mobile breakpoint
        if (window.scrollY > 50) {
          setIsHeaderHidden(true);
        } else {
          setIsHeaderHidden(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleSubmit = (value) => {
    // Handle the form submission
    console.log('Submitted value:', value);
    // Add your logic here for what should happen when the form is submitted
  };

  return (
    <div className="home">
      <header className={`home__header ${isHeaderHidden ? "home__header--hidden" : ""}`}>
        <h2 className="home-title">Check Weather, Gate And Flight Information.</h2>
      </header>
      <Input onSubmit={handleSubmit} setIsSearchActive={setIsSearchActive} />
      <div className="search-container">
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
      </div>
    </div>
  );
};

export default Home;
