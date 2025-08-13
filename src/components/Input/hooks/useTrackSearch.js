import axios from "axios";
  // Track search keystroke
export const trackSearch = async (userEmail,submitTerm) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  // enable search tracking in .env
  if (import.meta.env.VITE_TRACK_SEARCH === "true") {
    // Generate a timestamp
    const timestamp = new Date().toISOString();
    console.log("Search tracking enabled through VITE_TRACK_SEARCH -- saving search to backend-->");
    console.log("Timestamp:", timestamp, "userEmail", userEmail, "submitTerm", submitTerm);
    try {
      // Send the search track to the backend
      
      await axios.post(`${apiUrl}/searches/track`, {
        email: userEmail,
        stId: submitTerm?.stId || null,
        // Determine the value to send for submitTerm
        submitTerm: typeof submitTerm === 'string' ? submitTerm : (submitTerm?.value || null),
        timestamp,
      });
    } catch (error) {
      console.error("Error sending search track to backend:", error.response?.data, error.message);
    }

  } else {
  }
};