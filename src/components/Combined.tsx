/**
 * This file contains React components for displaying flight and weather information:
 * - FlightCard: Main component displaying comprehensive flight details including departure/arrival info
 * * Key features:
 * - Responsive design with mobile-specific scroll behavior
 * - Date-based tab navigation (Today, Tomorrow, etc.) - Temporarily disabled.
 * - Real-time flight status display
 * - Integration with NAS (National Airspace System) data
 * - Route visualization support via SkyVector
 * - Nested tabbed interface for departure and destination weather
 */

import {} from "react";
import Input from "../components/Input/Index";
import RoutePanel from "./RoutePanel";
import SummaryTable from "./SummaryTable";
import TabFormat from "./TabFormat";
import GateCard from "./GateCard";
import { FlightData, NASData } from "../types";
import { LoadingAirportCard } from "./Skeleton";

interface FlightCardProps {
  flightData: FlightData;
  weather: any;
  NAS: NASData;
  EDCT: any;
  isLoadingEdct: boolean;
  isLoadingWeatherNas: boolean;
  possibleMatches: any[]; // Fixed array type
}

/**
 * Main component for displaying comprehensive flight information
 * This component now features a top-level date-based tab navigation.
 */
const FlightCard = ({ flightData, weather, NAS, EDCT, isLoadingEdct, isLoadingWeatherNas, possibleMatches: possibleSimilarMatches }: FlightCardProps ) => {
  // TODO ismial. see if you can get this to show up right above the summaryCard as `similar:` options and replicate the same for gate and airport.
  // if (possibleSimilarMatches) {
  //   console.log('possible matches', possibleSimilarMatches);
  // }

  // TODO VHP Ismail: User feature request - cache flightdata into localstorage so it doesn't reset every few mins or when they go airplane mode

  // --- Start: Tab logic ---

  // COMMENTED OUT: Date tab functionality - uncomment to re-enable
  /*
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  // REMOVED: isSticky state is no longer needed.
  const [isAnimating, setIsAnimating] = useState(false);

  const tabsNavRef = useRef(null);
  const contentRef = useRef(null);
  // REMOVED: tabPositionRef is no longer needed.

  // Effect to generate date-based tabs on component mount
  useEffect(() => {
    const generatedTabs = [];
    const today = new Date(); // Using current date for dynamic generation

    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const tabId = date.toISOString().split('T')[0]; // e.g., '2025-07-19'
      
      // MODIFIED: Removed 'weekday' option to display only month and day.
      const tabLabel = new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }).format(date); // e.g., 'Jul 19'

      generatedTabs.push({ id: tabId, label: tabLabel });
    }
    
    setTabs(generatedTabs);
    // Set the first tab as the default active tab
    if (generatedTabs.length > 0) {
      setActiveTab(generatedTabs[0].id);
    }
  }, []);

  // REMOVED: The useSwipeable hook and its handlers have been removed to disable swiping on date tabs.

  // REMOVED: The useEffect for handling the sticky tab navigation bar has been removed.

  // Core function to change tabs with animation
  const changeTab = (tabId, direction) => {
    if (isAnimating || tabId === activeTab) return;
    
    setIsAnimating(true);
    
    const animationClass = direction === 'left' ? 'slide-left' : 'slide-right';
    
    if (contentRef.current) {
      contentRef.current.className = `flight-card-content ${animationClass}-exit`;
    }
    
    setTimeout(() => {
      setActiveTab(tabId);
      
      // We need a nested timeout to allow React to re-render with the new activeTab
      // before we apply the enter animation.
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.className = `flight-card-content ${animationClass}-enter`;
          
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.className = 'flight-card-content';
            }
            setIsAnimating(false);
          }, 300); // Animation duration
        } else {
          setIsAnimating(false);
        }
      }, 50);
    }, 250); // Exit animation duration
  };

  // Click handler for tab buttons
  const handleTabChange = (tabId) => {
    if (isAnimating || tabId === activeTab) return;
    
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    const newIndex = tabs.findIndex(t => t.id === tabId);
    const direction = newIndex > currentIndex ? 'left' : 'right';
    
    changeTab(tabId, direction);
    
    // REMOVED: Logic to maintain scroll position for sticky header is no longer needed.
  };
  */

  // --- End: Tab logic ---

  // COMMENTED OUT: Loading check for tabs - uncomment when re-enabling tabs
  /*
  if (tabs.length === 0) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  */

  return (
    <div className="details">
      {/* CSS for animations and search container styling */}
      <style>
        {`
          .flight-card-content.slide-left-exit { animation: slideLeftExit 0.25s forwards; }
          .flight-card-content.slide-left-enter { animation: slideLeftEnter 0.3s forwards; }
          .flight-card-content.slide-right-exit { animation: slideRightExit 0.25s forwards; }
          .flight-card-content.slide-right-enter { animation: slideRightEnter 0.3s forwards; }
          
          @keyframes slideLeftExit {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-15%); opacity: 0; }
          }
          @keyframes slideLeftEnter {
            from { transform: translateX(15%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideRightExit {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(15%); opacity: 0; }
          }
          @keyframes slideRightEnter {
            from { transform: translateX(-15%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          .no-data-panel {
            padding: 40px 20px;
            text-align: center;
            color: #6c757d;
            min-height: 50vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
          }
          
          /* Fixed search container styling - applied immediately */
          .combined-search {
            margin-top: -70px !important;
            margin-bottom: -40px !important;
          }
          
          /* Remove padding from parent details element when it contains the search */
          .details {
            padding-top: 0 !important;
          }

          /* Ensure TabFormat component itself has rounded corners */
          .flight-card-content [class*="tab"] {
            border-radius: 5px;
          }
        `}
      </style>

      {/* Search Input remains at the top with fixed styling */}
      <div className="combined-search">
        <Input userEmail="user@example.com" isLoggedIn={true} />
      </div>

      {/* COMMENTED OUT: Date tabs container - uncomment to re-enable */}
      {/* <div className="date-tabs-container">
        <div 
          ref={tabsNavRef}
          className="weather-tabs-navigation"
        >
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`weather-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              disabled={isAnimating}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div 
          ref={contentRef}
          className="flight-card-content"
        >
          {activeTab === tabs[0].id && (
            <div>
              <SummaryTable flightData={flightData} EDCT={EDCT} />
              
              <TabFormat 
                flightData={flightData} 
                weather={weather}
                NAS={NAS}
                hideChildSearchBars={true}
              />
            </div>
          )}

          {activeTab !== tabs[0].id && (
            <div className="no-data-panel">
              <p>Flight data is not available for this date.</p>
            </div>
          )}
        </div>
      </div>
      */}

      {/* TEMPORARY: Direct content display while date tabs are disabled */}
      <div className="flight-card-content">
        {/* Summary Table for today's flight */}
        <SummaryTable flightData={flightData} EDCT={EDCT} isLoadingEdct={isLoadingEdct} />
        
        <div>
        </div>
        {isLoadingWeatherNas ? (
          <div style={{ marginTop: '20px' }}>
            <LoadingAirportCard />
          </div>
        ) : (
          // Weather & NAS Tabs for Departure/Destination
          <TabFormat 
            flightData={flightData} 
            weather={weather}
            NAS={NAS}
            hideChildSearchBars={true} // Prop to hide search bars in the nested component
          />
        )}
      </div>
    </div>
  );
};

export { FlightCard, GateCard, RoutePanel };
