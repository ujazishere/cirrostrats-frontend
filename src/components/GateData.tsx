import { useState, useEffect } from "react";
import axios from "axios";
import { GateData, SearchValue } from "../types";

// API base URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

interface GateState {
  loading: boolean;
  data: GateData[] | null;
  error: any;
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
  });

  // This effect runs whenever the `searchValue` prop changes.
  useEffect(() => {
    // We first validate if the search is actually for a gate. If not, we do nothing.
    // This prevents unnecessary API calls when the user searches for a flight or airport.
    if (searchValue?.type !== "gate") {
      // Reset the state to its initial values if the search type is not 'gate'.
      setGateState({ loading: false, data: null, error: null });
      return; // Exit the effect early.
    }

    // This async function performs the data fetching.
    const fetchGateData = async () => {
      // Set the loading state to true and clear previous data/errors before starting a new request.
      setGateState({ loading: true, data: null, error: null });
      try {
        // Perform the GET request to the gate-specific API endpoint.
        // The gate identifier from `searchValue` is used to construct the URL.
        const res = await axios.get(`${apiUrl}/gates/${searchValue.metadata?.gate}`);
        // On success, update the state with the fetched data and set loading to false.
        setGateState({ loading: false, data: res.data, error: null });
      } catch (e: any) {
        // If the request fails, we capture the error.
        // We prioritize the error message from the API response, falling back to the generic error message.
        const errorMessage = e.response?.data || e.message;
        // Log the detailed error to the console for debugging purposes.
        console.error("Gate Data Error:", errorMessage);
        // Update the state with the error message and set loading to false.
        setGateState({ loading: false, data: null, error: errorMessage });
      }
    };

    // Call the fetching function.
    fetchGateData();
  }, [searchValue]); // The dependency array ensures this effect re-runs only when `searchValue` changes.

  // The hook returns the entire state object, giving the component access to loading, data, and error status.
  return gateState;
};

export default useGateData;
