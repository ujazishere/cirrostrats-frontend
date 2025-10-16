// combined.jsx

import React from 'react';
import Input from "../components/Input/Index";
import SummaryTable from "./SummaryTable";
import TabFormat from "./TabFormat";
import GateCard from "./GateCard"; // Keep for export
import RoutePanel from "./RoutePanel"; // Keep for export
import { LoadingAirportCard } from "./Skeleton"; // Import skeleton for tabs

// Accept the new loading props: isLoadingEdct and isLoadingWeatherNas
const FlightCard = ({ flightData, weather, NAS, EDCT, isLoadingEdct, isLoadingWeatherNas }) => {
  return (
    <div className="details">
      <style>{`
          /* Styles are unchanged */
          .flight-card-content.slide-left-exit { animation: slideLeftExit 0.25s forwards; }
          .flight-card-content.slide-left-enter { animation: slideLeftEnter 0.3s forwards; }
          @keyframes slideLeftExit { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-15%); opacity: 0; } }
          @keyframes slideLeftEnter { from { transform: translateX(15%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .combined-search { margin-top: -70px !important; margin-bottom: -40px !important; }
          .details { padding-top: 0 !important; }
      `}</style>

      <div className="combined-search">
        <Input userEmail="user@example.com" isLoggedIn={true} />
      </div>

      <div className="flight-card-content">
        {/* SummaryTable renders immediately and handles its own EDCT loading state internally */}
        <SummaryTable flightData={flightData} EDCT={EDCT} isLoadingEdct={isLoadingEdct} />
        
        {/* Conditionally render a skeleton or the real component for weather/NAS */}
        {isLoadingWeatherNas ? (
          <div style={{ marginTop: '20px' }}>
            <LoadingAirportCard />
          </div>
        ) : (
          <TabFormat 
            flightData={flightData} 
            weather={weather}
            NAS={NAS}
            hideChildSearchBars={true}
          />
        )}
      </div>
    </div>
  );
};

export { FlightCard, GateCard, RoutePanel };