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

      <div className="home__content">

      </div>
    </div>
  );
};

export default Home;
