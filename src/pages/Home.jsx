import React from "react";
import { NavLink } from "react-router-dom";
import Input from "../components/Input";
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import axios from 'axios';  

const Home = () => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        console.log(userInfo.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    },
    onError: errorResponse => console.log(errorResponse),
  });

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
      <GoogleButton onClick={() => googleLogin()} />
      <div className="home__content">
        {/* Any additional content */}
      </div>
    </div>
  );
};

export default Home;
