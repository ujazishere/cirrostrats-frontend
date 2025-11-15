import axios from "axios";

export type WeatherData = {
  metar?: string;
  // Add other weather properties as needed
};


// Minimal, reusable weather helpers
export const isMeaningfulWeather = (weatherObj: WeatherData): boolean =>
  !!(
    weatherObj &&
    typeof weatherObj === "object" &&
    Object.keys(weatherObj).length > 0 &&
    (weatherObj as any).metar
  );

type ChooseArgs = {
  apiUrl: string;
  mdbAirportReferenceId?: string | null;
  airportCodeICAO?: string | null; // e.g., KJFK
  mdbData?: any | null;
  liveData?: any | null;
};

// Chooses live over mdb when meaningful. If live differs from mdb and we have mdbAirportReferenceId,
// it will notify backend to store fresh live weather. Returns the chosen payload (or null).
export async function chooseAirportWeatherAndMaybeUpdate({
  apiUrl,
  mdbAirportReferenceId,
  airportCodeICAO,
  mdbData,
  liveData,
}: ChooseArgs): Promise<any | null> {
  const hasLive = isMeaningfulWeather(liveData);
  const hasMdb = isMeaningfulWeather(mdbData);

  if (hasLive) {
    if (
      mdbAirportReferenceId &&
      hasMdb &&
      JSON.stringify(liveData) !== JSON.stringify(mdbData)
    ) {
      try {
        await axios.post(
          `${apiUrl}/storeLiveWeather?mdbAirportReferenceId=${mdbAirportReferenceId}&rawCode=${airportCodeICAO || ""}`
        );
      } catch (e) {
        console.error("Error notifying backend to store live weather:", e);
      }
    }
    return liveData;
  }

  if (hasMdb) return mdbData;

  return null;
}

export const airportWeatherAPI = {
  /**
   * Fetch airport weather by reference ID
   */
  getByReferenceId: async (apiUrl: string, referenceId: string): Promise<WeatherData | null> => {
    if (!referenceId) {
      console.error('No reference ID provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/mdbAirportWeatherById/${referenceId}`);
      // console.log("!!MDB AIRPORT DATA received!!", response.data);
      isMeaningfulWeather(response.data)
      return response.data;
    } catch (error) {
      console.error("MDB Airport Weather Error:", error);
      return null;
    }
  },

   /**
   * Fetch live airport weather by ICAO code
   */
  getLiveByAirportCode: async (apiUrl: string, airportCode: string): Promise<WeatherData | null> => {
    if (!airportCode) {
      console.error('No airport code provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/liveAirportWeather/${airportCode}`);
      return response.data;
    } catch (error) {
      console.error(`Live Weather Error for ${airportCode}:`, error);
      return null;
    }
  },


   /**
   * Fetch NAS by ICAO
   */

  getMdbByAirportCode: async (apiUrl: string, airportCode: string): Promise<WeatherData | null> => {
    if (!airportCode) {
      console.error('No airport code provided');
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/liveAirportWeather/${airportCode}`);
      return response.data;
    } catch (error) {
      console.error(`Live Weather Error for ${airportCode}:`, error);
      return null;
    }
  },
}
