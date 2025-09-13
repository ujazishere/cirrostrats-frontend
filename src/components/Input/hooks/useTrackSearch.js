// Imports the axios library for making HTTP requests.
import axios from "axios";
  // Track search keystroke
// Defines and exports an asynchronous function to track user search activity.
export const trackSearch = async (userEmail,submitTerm) => {
  // Retrieves the base URL for the API from the application's environment variables.
  const apiUrl = import.meta.env.VITE_API_URL;
  // enable search tracking in .env
  // Checks if the search tracking feature is enabled via an environment variable.
  if (import.meta.env.VITE_TRACK_SEARCH === "true") {
    // Generate a timestamp
    // Creates a new timestamp in ISO 8601 format (e.g., "2025-09-13T14:49:00.000Z").
    const timestamp = new Date().toISOString();
    // Logs a message to the console indicating that search tracking is active.
    console.log("Search tracking enabled through VITE_TRACK_SEARCH -- saving search to backend-->");
    // Logs the specific details of the search being tracked for debugging purposes.
    console.log("Timestamp:", timestamp, "userEmail", userEmail, "submitTerm", submitTerm);
    // A try-catch block is used to handle potential errors during the API call.
    try {
      // Send the search track to the backend
      
      // Performs an asynchronous POST request to the backend's tracking endpoint.
      await axios.post(`${apiUrl}/searches/track`, {
        // The user's email is included in the request payload.
        email: userEmail,
        // Safely accesses the stId from the submitTerm object; defaults to null if not present.
        stId: submitTerm?.stId || null,
        // Determine the value to send for submitTerm
        // This logic handles two cases for submitTerm:
        // 1. If it's a raw string, it's sent as is.
        // 2. If it's an object, it attempts to extract the 'value' property, defaulting to null.
        submitTerm: typeof submitTerm === 'string' ? submitTerm : (submitTerm?.value || null),
        // The generated timestamp is included in the payload.
        timestamp,
      });
    } catch (error) {
      // If the API request fails, this block catches the error.
      // Logs a detailed error message to the console, including response data if available.
      console.error("Error sending search track to backend:", error.response?.data, error.message);
    }

  } else {
    // This block is intentionally empty. No action is taken if VITE_TRACK_SEARCH is not 'true'.
  }
};