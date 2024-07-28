import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Input from "../components/Input";
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import axios from 'axios';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      try {
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        setUserInfo(userInfoResponse.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    },
    onError: errorResponse => console.log(errorResponse),
    redirectUri: 'http://localhost:5173/'
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  const logoutButtonStyle = {
    backgroundColor: '#4285F4',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    margin: '15px'
  };

  return (
    <div className="home">
      <h2 className="home__title">Check Weather, Gate And Flight Information.</h2>
      <Input />
      <NavLink to="/guide" className="home__link">
        Guide
      </NavLink>
      <NavLink to="https://cirrostrats.us/live_map" className="home__link">
        Live Map
      </NavLink>
      
      {isLoggedIn ? (
        <div>
          <p>Logged in as: {userInfo?.name}</p>
          <button 
            onClick={handleLogout} 
            style={logoutButtonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#3367D6'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4285F4'}
          >
            Logout
          </button>
        </div>
      ) : (
        <GoogleButton onClick={() => googleLogin()} />
      )}

      <div className="home__content">
      </div>
    </div>
  );
};

export default Home;