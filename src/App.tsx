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
import { GoogleOAuthProvider } from "@react-oauth/google";
import LiveMap from "./pages/LiveMap";
import SearchAnalyticsDashboard from "./components/SearchAnalyticsDashboard";
// NEW: Import the online status hook and banner
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { GlobalOfflineBanner } from "./components/OfflineBanner";

function App(): JSX.Element {
  // NEW: Get the current network status
  const isOnline = useOnlineStatus();

  return (
    <GoogleOAuthProvider clientId="678901205467-g2hk1dmj5krq4ua0n3uc4r2s1d98mtq5.apps.googleusercontent.com">
      <div className="App">
        {/* NEW: Conditionally render the global offline banner */}
        {!isOnline && <GlobalOfflineBanner />}
        
        {/* Your existing Navbar. We add a style to push it down if the banner is visible. */}
        <Navbar />
        <UTCTime />
        <Routes>
          {/* ... all your existing routes ... */}
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