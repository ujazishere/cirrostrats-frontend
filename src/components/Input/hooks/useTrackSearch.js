
import React, { useState, useEffect } from "react";

// hooks/useTrackSearch.js
const useTrackSearch = () => {
  // Track search keystroke
  const trackSearch = async (searchTerm, submitTerm = null) => {
    // if dev mode is enabled, don't track search
    if (import.meta.env.VITE_ENV === "dev") return;
    // Generate a timestamp
    const timestamp = new Date().toISOString();
    console.log("Timestamp:", timestamp);

    // Determine which email to use: logged‑in user's email(if logged in) or "Anonymous"(if not logged in)
    const emailToTrack = isLoggedIn && userEmail ? userEmail : "Anonymous";
    
    try {
      // Send the search track to the backend
      await axios.post(`${apiUrl}/searches/track`, {
        email: emailToTrack,
        searchTerm,
        submitTerm: submitTerm || null,
        timestamp,
      });
    } catch (error) {
      console.error("Error sending search track to backend:", error);
    }
  };
  
  return { trackSearch };
};

export default useTrackSearch;