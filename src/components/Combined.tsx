// ✅ MODIFIED FILE: src/components/Combined.tsx
// This file now contains the new UI components for selecting dates and flight legs.
// `FlightCard` is updated to orchestrate this new UI.

import React, { useRef, useEffect } from "react"; // Added React hooks
import Input from "../components/Input/Index";
import RoutePanel from "./RoutePanel";
import SummaryTable from "./SummaryTable";
import TabFormat from "./TabFormat";
import GateCard from "./GateCard";
import { FlightData, NASData } from "../types";
import { LoadingAirportCard } from "./Skeleton";
// ✅ NEW: Import the new types from flightdata hook
import { FlightDay, FlightLeg } from "./FlightData";

interface FlightCardProps {
  // ✅ NEW PROPS: From the refactored useFlightData hook
  scheduleData: FlightDay[] | null;
  selectedDate: string | null;
  selectedLegIndex: number | null;
  setSelectedDate: (date: string) => void;
  setSelectedLegIndex: (index: number) => void;
  loadingFlight: boolean; // Renamed from isLoadingFlight, passed from hook

  // ✅ EXISTING PROPS: Now for the *selected leg*
  flightData: FlightData | null; // Can be null while loading new leg
  weather: any;
  NAS: NASData;
  EDCT: any;
  isLoadingEdct: boolean;
  isLoadingWeatherNas: boolean;
}

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// ✅ NEW COMPONENT: DateSelector
//_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
interface DateSelectorProps {
  days: FlightDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ days, selectedDate, onSelectDate }) => {
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll the active date into view on mount or change
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const tab = activeTabRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();

      // Calculate scroll position to center the tab
      const scrollLeft = tab.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [selectedDate]);

  return (
    <div className="date-selector-container" ref={containerRef}>
      {days.map(day => (
        <button
          key={day.date}
          ref={day.date === selectedDate ? activeTabRef : null}
          className={`date-selector-tab ${day.date === selectedDate ? 'active' : ''}`}
          onClick={() => onSelectDate(day.date)}
        >
          {/* Format: "Nov 15" */}
          <span className="date-day">{day.dateLabel.split(', ')[0]}</span>
          <span className="date-month-day">{day.dateLabel.split(', ')[1]}</span>
        </button>
      ))}
    </div>
  );
};

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// ✅ NEW COMPONENT: LegSelector
//_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
interface LegSelectorProps {
  legs: FlightLeg[];
  selectedLegIndex: number;
  onSelectLeg: (index: number) => void;
}

const LegSelector: React.FC<LegSelectorProps> = ({ legs, selectedLegIndex, onSelectLeg }) => {
  if (legs.length <= 1) {
    // Don't show the selector if there's only one flight for the day
    return null;
  }

  return (
    <div className="leg-selector-container">
      <h3 className="leg-selector-title">
        SELECT FLIGHT ({legs.length} AVAILABLE)
      </h3>
      <div className="leg-selector-options">
        {legs.map((leg, index) => (
          <div
            key={leg.legIndex}
            className={`leg-option-card ${leg.legIndex === selectedLegIndex ? 'active' : ''}`}
            onClick={() => onSelectLeg(leg.legIndex)}
          >
            <div className="leg-radio-button">
              <div className="leg-radio-dot"></div>
            </div>
            <div className="leg-info">
              <span className="leg-number">FLIGHT {index + 1} OF {legs.length}</span>
              <div className="leg-route">
                <span className="leg-airport">{leg.origin}</span>
                <span className="leg-arrow">→</span>
                <span className="leg-airport">{leg.destination}</span>
              </div>
              <span className="leg-time">{leg.departureTime} – {leg.arrivalTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// ✅ MODIFIED COMPONENT: FlightCard
//_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

const FlightCard: React.FC<FlightCardProps> = ({
  scheduleData,
  selectedDate,
  selectedLegIndex,
  setSelectedDate,
  setSelectedLegIndex,
  flightData,
  weather,
  NAS,
  EDCT,
  loadingFlight,
  isLoadingEdct,
  isLoadingWeatherNas
}) => {
  // Find the currently selected day's data
  const selectedDay = scheduleData?.find(day => day.date === selectedDate);

  return (
    <div className="details">
      {/* Search Input remains at the top */}
      <div className="combined-search">
        <Input userEmail="user@example.com" isLoggedIn={true} />
      </div>

      {/* --- NEW UI --- */}
      {scheduleData && selectedDate && (
        <DateSelector
          days={scheduleData}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      {selectedDay && selectedLegIndex !== null && (
        <LegSelector
          legs={selectedDay.legs}
          selectedLegIndex={selectedLegIndex}
          onSelectLeg={setSelectedLegIndex}
        />
      )}
      {/* --- END NEW UI --- */}


      {/* --- EXISTING UI (now fed by selected leg) --- */}
      <div className="flight-card-content">
        {/* Only render the details (Summary, Weather, etc.) if:
          1. We have the schedule (`selectedDay`)
          2. We have a selected leg (`selectedLegIndex !== null`)
          3. We either have the flightData OR we are currently loading it.
        */}
        {selectedDay && selectedLegIndex !== null && (loadingFlight || flightData) ? (
          <>
            {/* Summary Table for the *selected* flight leg */}
            <SummaryTable
              flightData={flightData!} // This is OK, SummaryTable has its own internal skeleton
              EDCT={EDCT!}
              isLoadingEdct={isLoadingEdct}
              isLoadingFlight={loadingFlight} // ✅ PASS THE LOADING FLAG
            />

            {/* Weather & NAS Tabs for Departure/Destination */}
            {isLoadingWeatherNas ? (
              <div style={{ marginTop: '20px' }}>
                <LoadingAirportCard />
              </div>
            ) : flightData ? ( // ✅ FIX: Added this check to prevent passing null
              <TabFormat
                flightData={flightData} // ✅ FIX: Removed the `!` assertion
                weather={weather}
                NAS={NAS}
                hideChildSearchBars={true} // Prop to hide search bars in the nested component
              />
            ) : (
              // If weather is not loading, but flightData is null, render nothing
              null
            )}
          </>
        ) : (
          // This case handles when flightData is null and we are *not* loading it
          // (e.g., an error occurred for the leg, or initial state)
          // We don't show anything here, as the main `Details` page will show a "no data" message
          // if the *schedule* fails to load.
          null
        )}
      </div>
    </div>
  );
};

export { FlightCard, GateCard, RoutePanel };