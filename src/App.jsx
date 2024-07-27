import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import Story from "./pages/Story";
import Contact from "./pages/Contact";
import Source from "./pages/Source";
import Details from "./pages/Details";
import UTCTime from "./components/UTCTime";
import Table from "./components/Table";
import Dummy from "./components/Dummy";
import WeatherInfo from './components/Cards/WeatherInfo';
import "./WeatherInfo.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Input from './components/Input'; // Adjusted import path

function App() {
  return (
    <GoogleOAuthProvider clientId="678901205467-g2hk1dmj5krq4ua0n3uc4r2s1d98mtq5.apps.googleusercontent.com">
      <div className="App">
        <Navbar />
        <UTCTime />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/story" element={<Story />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/source" element={<Source />} />
          <Route path="/details" element={<Details />} />
          <Route path="/table" element={<Table />} />
          <Route path="/dummy" element={<Dummy />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;