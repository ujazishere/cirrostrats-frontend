import { useState, useEffect } from "react";
import axios from "axios";
import { GateData, SearchValue } from "../types";
// NEW: Import the DB service and online status hook
import * as db from "../utils/db"; 
import { useOnlineStatus } from "../hooks/useOnlineStatus";

// API base URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

interface GateState {
  loading: boolean;
  data: GateData[] | null;
  error: any;
  // NEW: Add source and timestamp to state
  source?: 'network' | 'cache' | null;
  timestamp?: number | null;
}

// =================================================================================
// CUSTOM HOOK for fetching Gate Data
// This hook encapsulates all logic for fetching and managing gate-specific data.
// By isolating this logic, we make it reusable and keep our main component cleaner.
// =================================================================================
const useGateData = (searchValue: SearchValue | null): GateState => {
  // State is managed as a single object to group related data and prevent multiple setState calls.
  const [gateState, setGateState] = useState<GateState>({
    loading: false,
    data: null,
    error: null,
    source: null, // NEW
    timestamp: null, // NEW
  });
  
  // NEW: Get the current network status
  const isOnline = useOnlineStatus();

  // This effect runs whenever the `searchValue` prop changes.
  // NEW: It also runs when `isOnline` status changes.
  useEffect(() => {
    // We first validate if the search is actually for a gate. If not, we do nothing.
    // This prevents unnecessary API calls when the user searches for a flight or airport.
    if (searchValue?.type !== "Terminal/Gate") {
      // Reset the state to its initial values if the search type is not 'Terminal/Gate'.
      setGateState({ loading: false, data: null, error: null, source: null, timestamp: null });
      return; // Exit the effect early.
    }

    // This async function performs the data fetching.
    const fetchGateData = async () => {
      // Set the loading state to true and clear previous data/errors before starting a new request.
      // MODIFIED: Keep stale data while loading for a smoother UI
      setGateState((prevState) => ({ ...prevState, loading: true, error: null }));
      
      const gateId = searchValue.gate; // e.g., "EWR-C101"
      const searchTerm = searchValue.label; // e.g., "EWR - C101 Departures"
      
      if (!gateId) {
        setGateState({ loading: false, data: null, error: "Invalid gate ID", source: null, timestamp: null });
        return;
      }

      // --- NEW OFFLINE-FIRST LOGIC ---

      if (isOnline) {
        console.log(`[GateData] Online: Fetching fresh data for ${gateId}`);
        try {
          // --- ONLINE PATH ---
          // 1. Fetch from network
          const res = await axios.get(`${apiUrl}/gates/${searchValue.gate}`);
          
          // 2. Save to IndexedDB
          await db.saveGateData(gateId, searchTerm, res.data);
          
          // 3. Update state
          setGateState({ 
            loading: false, 
            data: res.data, 
            error: null, 
            source: 'network', 
            timestamp: Date.now() 
          });
          
        } catch (e: any) {
          // --- NETWORK FAILED (but we are "online") ---
          console.error("Gate Data Network Error:", e.message);
          
          // 1. Try to fall back to cache
          const cachedData = await db.getGateData(gateId);
          if (cachedData) {
            console.warn(`[GateData] Network failed, falling back to cached data for ${gateId}`);
            setGateState({
              loading: false,
              data: cachedData.data,
              error: "Network failed. Showing cached data.",
              source: 'cache',
              timestamp: cachedData.timestamp
            });
          } else {
            // 2. No cache, show full error
            const errorMessage = e.response?.data || e.message;
            setGateState({ 
              loading: false, 
              data: null, 
              error: errorMessage, 
              source: null, 
              timestamp: null 
            });
          }
        }
      } else {
        console.log(`[GateData] Offline: Fetching cached data for ${gateId}`);
        try {
          // --- OFFLINE PATH ---
          // 1. Fetch from IndexedDB
          const cachedData = await db.getGateData(gateId);
          
          if (cachedData) {
            // 2. Found cached data
            setGateState({
              loading: false,
              data: cachedData.data,
              error: null,
              source: 'cache',
              timestamp: cachedData.timestamp
            });
          } else {
            // 3. No cached data
            setGateState({
              loading: false,
              data: null,
              error: "You are offline. No cached data is available for this gate.",
              source: null,
              timestamp: null
            });
          }
        } catch (e: any) {
          console.error("Gate Data Cache Error:", e.message);
          setGateState({ 
            loading: false, 
            data: null, 
            error: "Error reading from offline cache.", 
            source: null, 
            timestamp: null 
          });
        }
      }
    };

    // Call the fetching function.
    fetchGateData();
  }, [searchValue, isOnline]); // The dependency array ensures this effect re-runs only when `searchValue` or `isOnline` changes.

  // The hook returns the entire state object, giving the component access to loading, data, and error status.
  return gateState;
};

export default useGateData;