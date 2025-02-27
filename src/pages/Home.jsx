import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "react-google-button";
import axios from "axios";
import searchService from "../components/Input/api/searchservice";
// import Input from "../components/Input";
import Input from "../components/Input/Index";
import UTCTime from "../components/UTCTime";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState("Anonymous");
  const [searchSuggestions, setSuggestions] = useState([]);
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

  useEffect(() => {
    const fetchAllData = async () => {
      // console.log("Fetching suggestions for:", debouncedSearchTerm);
        const {searchSuggestions} = await searchService.fetchMostSearched(userEmail);
        setSuggestions(searchSuggestions);
    };
    
    fetchAllData();
  }, [userEmail]);

  const googleLogin = useGoogleLogin({
    scope: "openid profile email",
    onSuccess: async (tokenResponse) => {
      // console.log("Google Login Successful, Token Received:", tokenResponse);
      try {
        const { access_token } = tokenResponse;
        console.log("Access Token:", access_token);

        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const userData = userInfoResponse.data;
        console.log("User Info from Google:", userData);
        const email = userData.email;
        setUserInfo(userData);
  // Determine which email to use: logged‑in user's email(if logged in) or "Anonymous"(if not logged in)
        setUserEmail(email);
        setIsLoggedIn(true);

        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("userEmail", email);

        await axios.post(`${apiUrl}track-search`, { email });
        // console.log("Logged in user's email:", email);
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
      <UTCTime />
      <Input userEmail={userEmail} isLoggedIn={isLoggedIn} />
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
      <div className="home__content"></div>
    </div>
  );
};

export default Home;