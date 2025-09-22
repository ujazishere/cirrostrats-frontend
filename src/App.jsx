import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Story from "./pages/Story";
import Contact from "./pages/Contact";
import Source from "./pages/Source";
import Details from "./pages/Details";
import SearchesPage from "./pages/Searches";
import SearchesTimeline from "./pages/SearchesTimeline";
import Table from "./components/Table";
import UTCTime from "./components/UTCTime";
import "./WeatherInfo.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import LiveMap from "./pages/LiveMap";
// import Input from './components/Input'; // Adjusted import path
import SearchAnalyticsDashboard from "./components/SearchAnalyticsDashboard";


function App() {
  return (
    <GoogleOAuthProvider clientId="678901205467-g2hk1dmj5krq4ua0n3uc4r2s1d98mtq5.apps.googleusercontent.com">
      <div className="App">
        <Navbar />
        <UTCTime />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/homepage" element={<Home />} />
          <Route path="/story" element={<Story />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/source" element={<Source />} />
          <Route path="/details" element={<Details />} />
          <Route path="/table" element={<Table />} />
          <Route path="/searches" element={<SearchesPage />} />
          <Route path="/st" element={<SearchesTimeline />} />
          <Route path="/livemap" element={<LiveMap />} />
          <Route path="/analytics" element={<SearchAnalyticsDashboard />} />

        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
