import axios from "axios";
  // Track search keystroke
export const trackSearch = async (userEmail,searchTerm=null, submitTerm=null, submitId=null) => {
  // if dev mode is enabled, don't track search
  const apiUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_TRACK_SEARCH === "true") {
    // Generate a timestamp
    const timestamp = new Date().toISOString();
    console.log("Search tracking enabled through VITE_TRACK_SEARCH -- saving search to backend-->");
    console.log("Timestamp:", timestamp, "userEmail", userEmail, "searchTerm", searchTerm, "submitTerm", submitTerm, "submitId", submitId);

    try {
      // Send the search track to the backend
      await axios.post(`${apiUrl}/searches/track`, {
        email: userEmail,
        searchTerm,
        submitTerm: submitTerm || null,
        submitId: submitId || null,
        timestamp,
      });
    } catch (error) {
      console.error("Error sending search track to backend:", error);
    }

  } else {
  }
};

// return { trackSearch };
