import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

interface SearchTermObject {
  id?: string;
  value?: string;
  [key: string]: any;
}

type SearchTerm = string | SearchTermObject;

// Track search keystroke
export const trackSearch = async (
  userEmail: string,
  submitTerm: SearchTerm
): Promise<void> => {
  // enable search tracking in .env
  if (import.meta.env.VITE_TRACK_SEARCH === "true") {
    // Generate a timestamp
    const timestamp = new Date().toISOString();
    console.log(
      "Search tracking enabled through VITE_TRACK_SEARCH -- saving search to backend-->"
    );
    console.log(
      "Timestamp:",
      timestamp,
      "userEmail",
      userEmail,
      "submitTerm",
      submitTerm
    );
    try {
      // Send the search track to the backend

      await axios.post(`${apiUrl}/searches/track`, {
        email: userEmail,
        id: typeof submitTerm === "object" ? submitTerm?.id || null : null,
        // Determine the value to send for submitTerm
        submitTerm:
          // TODO sic: Befor you perform this you may want to address nececity before this priority
            // because this section may be a priority but it relies on the data structure provided by the search interface which needs overhaul which is priority
            // Account for others fields in the trackSearch section here in the object apart from .value see below
            // curate all that is fed into this system - aiports collection, flights collection and make them modular?
            // theres some inconsistency in regard to frontend - backend search interface.
            // it combines sic data with ph; flights, airports and gates, 
            
          
          typeof submitTerm === "string"
            ? submitTerm
            : submitTerm?.value || null,      // .value may not be sufficient.
        timestamp,
      });
    } catch (error: any) {
      console.error(
        "Error sending search track to backend:",
        error.response?.data,
        error.message
      );
    }
  }
};
