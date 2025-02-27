import axios from "axios";
  // Track search keystroke
export const trackSearch = async (searchTerm, submitTerm=null, searchId=null) => {
  // if dev mode is enabled, don't track search
  if (import.meta.env.VITE_ENV === "dev") return;
  // Generate a timestamp
  const timestamp = new Date().toISOString();
  console.log("Timestamp:", timestamp,searchTerm,submitTerm,searchId);

  
  try {
    // Send the search track to the backend
    await axios.post(`${apiUrl}/searches/track`, {
      email: emailToTrack,
      searchTerm,
      submitTerm: submitTerm || null,
      searchId: searchId || null,
      timestamp,
    });
  } catch (error) {
    console.error("Error sending search track to backend:", error);
  }
};

// return { trackSearch };
