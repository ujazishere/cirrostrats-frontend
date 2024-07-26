import React from "react";
import { NavLink } from "react-router-dom";
import Input from "../components/Input";

const Home = () => {
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

      <script src="https://apis.google.com/js/platform.js" async defer></script>

      <meta name="google-signin-client_id" content="678901205467-g2hk1dmj5krq4ua0n3uc4r2s1d98mtq5.apps.googleusercontent.com"></meta>

      <div class="g-signin2" data-onsuccess="onSignIn"></div>



      <div className="home__content">

      </div>
    </div>
  );
};

export default Home;
