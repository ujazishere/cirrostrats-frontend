// ✅ MODIFIED FILE: src/components/FlightData.tsx
// This hook is now refactored to handle a new data flow:
// 1. Fetch a "schedule" of all available days and flight legs for a given search value.
// 2. Manage the state for the user's *selected date* and *selected leg*.
// 3. Fetch the *detailed* data (weather, NAS, EDCT) for *only* the selected leg.

import { useState, useEffect } from "react";
import axios from "axios";
import flightService from "./utility/flightService";
type FlightService = typeof flightService;
import { EDCTData, NASData, SearchValue, WeatherData, FlightData } from "../types"; // Assuming FlightData is in types

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// ✅ NEW TYPES: Define the new data structures for schedules and legs.
//_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

/**
 * Represents a single flight leg.
 * This contains the *minimal* data needed for the selection UI.
 * The full `FlightData` type will be fetched on selection.
 */
export interface FlightLeg {
  legIndex: number; // e.g., 0, 1, 2
  flightID: string; // e.g., "GJS4433"
  origin: string; // e.g., "KEWR"
  destination: string; // e.g., "KSFO"
  departureTime: string; // e.g., "14:30 EST"
  arrivalTime: string; // e.g., "15:46 PST"
}

/**
 * Represents all flight legs available for a single date.
 */
export interface FlightDay {
  date: string; // ISO date string, e.g., "2025-11-15"
  dateLabel: string; // e.g., "Sat, Nov 15"
  legs: FlightLeg[];
}

// Configuration
const apiUrl = import.meta.env.VITE_API_URL;

// Helper Function (Unchanged)
function normalizeAjms(ajms: any): { data: any; error?: any } {
  // ... (your existing normalizeAjms function)
  const result: any = {};
  for (const [key, val] of Object.entries(ajms)) {
    if (val && typeof val === "object" && "value" in val) {
      result[key] = (val as any).value;
    } else if (typeof val === "string") {
      result[key] = val;
    } else {
      result[key] = null;
    }
  }
  return { data: result };
}

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// ✅ MODIFIED STATE: The hook's state is updated for the new data flow.
//_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

type FlightState = {
  // --- New Schedule State ---
  scheduleData: FlightDay[] | null; // Holds the list of days and legs
  loadingSchedule: boolean; // Loading flag for the *initial schedule* fetch
  selectedDate: string | null; // The ISO date string of the selected day
  selectedLegIndex: number | null; // The index of the selected leg
  
  // --- Existing Detailed Data State ---
  // These now represent the details for *only* the selected leg
  loadingFlight: boolean; // For the selected leg's primary data
  loadingEdct: boolean; // For the selected leg's EDCT data
  loadingWeatherNas: boolean; // For the selected leg's Weather/NAS data
  data: FlightData | null; // The full FlightData for the selected leg
  weather: WeatherData | null;
  nas: NASData | null;
  edct: EDCTData | null;
  error: string | null;
};

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// ✅ MOCK DATA: Simulates the new API responses
//_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

// Simulates the Scenario 1 you described (Multiple legs, single day)
// and Scenario 2 (Single leg, multiple days)
const MOCK_SCHEDULE_DATA: FlightDay[] = [
  {
    date: "2025-11-15",
    dateLabel: "Sat, Nov 15",
    legs: [
      { legIndex: 0, flightID: "GJS4433", origin: "KEWR", destination: "KSFO", departureTime: "14:30 EST", arrivalTime: "17:46 PST" },
      { legIndex: 1, flightID: "GJS4433", origin: "KSFO", destination: "KDEN", departureTime: "19:00 PST", arrivalTime: "22:30 MST" },
    ],
  },
  {
    date: "2025-11-16",
    dateLabel: "Sun, Nov 16",
    legs: [
      { legIndex: 0, flightID: "GJS4433", origin: "KEWR", destination: "KDEN", departureTime: "09:15 EST", arrivalTime: "11:45 MST" },
    ],
  },
  {
    date: "2025-11-17",
    dateLabel: "Mon, Nov 17",
    legs: [
      { legIndex: 0, flightID: "GJS4433", origin: "KEWR", destination: "KSFO", departureTime: "14:30 EST", arrivalTime: "17:46 PST" },
      { legIndex: 1, flightID: "GJS4433", origin: "KSFO", destination: "KDEN", departureTime: "19:00 PST", arrivalTime: "22:30 MST" },
      { legIndex: 2, flightID: "GJS4433", origin: "KDEN", destination: "KJFK", departureTime: "23:55 MST", arrivalTime: "05:15 EST" },
    ],
  },
  {
    date: "2025-11-18",
    dateLabel: "Tue, Nov 18",
    legs: [
      { legIndex: 0, flightID: "GJS4433", origin: "KEWR", destination: "KDEN", departureTime: "09:15 EST", arrivalTime: "11:45 MST" },
    ],
  },
];

// This is your *old* mock data, which we'll reuse to simulate fetching *details* for a leg.
const getMockLegDetails = async () => {
  const res = await axios.get(`${apiUrl}/testDataReturns`);
  console.log("!!TEST FLIGHT *LEG DETAILS* DATA!!", res.data);
  return {
    data: res.data.flightData || res.data,
    weather: res.data.weather || res.data,
    nas: res.data.NAS || res.data,
    edct: res.data.EDCT || res.data,
  };
};

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// ✅ MODIFIED HOOK: `useFlightData`
//_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

const useFlightData = (searchValue: SearchValue | null) => {
  const [flightState, setFlightState] = useState<FlightState>({
    loadingSchedule: true,
    scheduleData: null,
    selectedDate: null,
    selectedLegIndex: null,
    loadingFlight: true,
    loadingEdct: true,
    loadingWeatherNas: true,
    data: null,
    weather: null,
    nas: null,
    edct: null,
    error: null,
  });

  // State setters that components can call
  const setSelectedDate = (date: string) => {
    setFlightState(prevState => {
      // When date changes, reset leg index to the first one
      const newLegIndex = prevState.scheduleData?.find(d => d.date === date)?.legs[0]?.legIndex ?? 0;
      return {
        ...prevState,
        selectedDate: date,
        selectedLegIndex: newLegIndex,
        // Reset detailed data and set loading flags
        data: null,
        weather: null,
        nas: null,
        edct: null,
        loadingFlight: true,
        loadingEdct: true,
        loadingWeatherNas: true,
      };
    });
  };

  const setSelectedLegIndex = (index: number) => {
    setFlightState(prevState => ({
      ...prevState,
      selectedLegIndex: index,
      // Reset detailed data and set loading flags
      data: null,
      weather: null,
      nas: null,
      edct: null,
      loadingFlight: true,
      loadingEdct: true,
      loadingWeatherNas: true,
    }));
  };

  // --- EFFECT 1: Fetch the SCHEDULE when `searchValue` changes ---
  useEffect(() => {
    if (searchValue?.type !== "flight" && searchValue?.type !== "N-Number") {
      setFlightState({
        loadingSchedule: false,
        scheduleData: null,
        selectedDate: null,
        selectedLegIndex: null,
        loadingFlight: false,
        loadingEdct: false,
        loadingWeatherNas: false,
        data: null,
        weather: null,
        nas: null,
        edct: null,
        error: null,
      });
      return;
    }

    const fetchSchedule = async () => {
      // Reset all state on new search
      setFlightState({
        loadingSchedule: true,
        scheduleData: null,
        selectedDate: null,
        selectedLegIndex: null,
        loadingFlight: true,
        loadingEdct: true,
        loadingWeatherNas: true,
        data: null,
        weather: null,
        nas: null,
        edct: null,
        error: null,
      });

      const flightID = searchValue?.flightID || searchValue?.nnumber || searchValue?.value;

      if (!flightID) {
        setFlightState(s => ({ ...s, error: "Invalid Flight ID", loadingSchedule: false }));
        return;
      }

      try {
        let schedule: FlightDay[] | null = null;

        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          // --- Use Mock Schedule Data ---
          console.log("!! USING MOCK SCHEDULE DATA !!");
          schedule = MOCK_SCHEDULE_DATA;
        } else {
          // --- TODO: Your REAL API call for the schedule ---
          // When your backend is ready, replace this.
          // This endpoint should return data in the `FlightDay[]` format.
          // const res = await axios.get(`${apiUrl}/flightSchedule/${flightID}`);
          // schedule = res.data;
          
          // For now, we'll throw an error if not in test mode
          console.warn("Real schedule fetch not implemented. Using mock data as fallback.");
          schedule = MOCK_SCHEDULE_DATA; // Fallback to mock data
          // throw new Error("Backend schedule endpoint not implemented.");
        }

        if (schedule && schedule.length > 0) {
          // Success: Set the schedule and select the first day/leg by default
          setFlightState(prevState => ({
            ...prevState,
            loadingSchedule: false,
            scheduleData: schedule,
            selectedDate: schedule[0].date, // Select first date
            selectedLegIndex: schedule[0].legs[0].legIndex, // Select first leg
            error: null,
            // Keep detail loaders true, as EFFECT 2 will now run
            loadingFlight: true,
            loadingEdct: true,
            loadingWeatherNas: true,
          }));
        } else {
          // No schedule found
          setFlightState(prevState => ({
            ...prevState,
            loadingSchedule: false,
            loadingFlight: false,
            loadingEdct: false,
            loadingWeatherNas: false,
            error: `No flight schedule found for ${flightID}.`,
          }));
        }
      } catch (e) {
        console.error("Error fetching flight schedule:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setFlightState(prevState => ({
          ...prevState,
          loadingSchedule: false,
          loadingFlight: false,
          loadingEdct: false,
          loadingWeatherNas: false,
          error: errorMessage,
        }));
      }
    };

    fetchSchedule();
  }, [searchValue]);

  // --- EFFECT 2: Fetch DETAILED DATA when `selectedDate` or `selectedLegIndex` changes ---
  useEffect(() => {
    // Don't run if the schedule is still loading or if selection is not made
    if (
      flightState.loadingSchedule ||
      !flightState.selectedDate ||
      flightState.selectedLegIndex === null
    ) {
      return;
    }

    // Find the selected leg object
    const selectedDay = flightState.scheduleData?.find(
      day => day.date === flightState.selectedDate
    );
    const selectedLeg = selectedDay?.legs.find(
      leg => leg.legIndex === flightState.selectedLegIndex
    );

    if (!selectedLeg) {
      // This shouldn't happen, but good to check
      setFlightState(prevState => ({
        ...prevState,
        loadingFlight: false,
        loadingEdct: false,
        loadingWeatherNas: false,
      }));
      return;
    }

    // This is your *original* fetchFlightData logic, but now it runs for a *specific leg*.
    const fetchLegDetails = async () => {
      // Ensure all detail loaders are true
      setFlightState(prevState => ({
        ...prevState,
        loadingFlight: true,
        loadingEdct: true,
        loadingWeatherNas: true,
        data: null,
        weather: null,
        nas: null,
        edct: null,
      }));

      try {
        // --- Use Mock Detail Data ---
        if (import.meta.env.VITE_APP_TEST_FLIGHT_DATA === "true") {
          const { data, weather, nas, edct } = await getMockLegDetails();
          
          // We need to *override* mock data with the *selected* leg's info
          // so the UI matches the selection.
          const combinedData = {
            ...data,
            flightID: selectedLeg.flightID,
            departure: selectedLeg.origin,
            arrival: selectedLeg.destination,
            // You can add more overrides here as needed
          };

          setFlightState(prevState => ({
            ...prevState,
            loadingFlight: false,
            loadingEdct: false,
            loadingWeatherNas: false,
            data: combinedData,
            weather: weather,
            nas: nas,
            edct: edct,
            error: null,
          }));
          return;
        }

        // --- TODO: Your REAL API call for leg details ---
        // When your backend is ready, this logic will run.
        // You'll need a way to identify the specific leg (e.g., flightID + date + origin)
        const flightID = selectedLeg.flightID; // Or a more unique identifier

        // --- STEP 1: Fetch PRIMARY flight data ---
        // This logic is from your original hook
        const { rawAJMS, flightAwareRes, flightStatsTZRes } =
          await flightService.getPrimaryFlightData(flightID); // You may need to pass more leg-specific info here
        
        // ... (Your existing validation and normalization logic) ...
        const validatedAJMS = rawAJMS; // Skipping your validation function for brevity
        const ajms = normalizeAjms(validatedAJMS.data || {});
        
        const { departure, arrival, departureAlternate, arrivalAlternate } =
          flightService.getAirports({ ajms, flightAwareRes, flightStatsTZRes });
        
        if ((ajms as any).error && (flightAwareRes as any).error) {
          throw new Error(`Could not retrieve data for flight ${flightID}.`);
        }

        const combinedFlightData = {
          flightID,
          departure,
          arrival,
          departureAlternate,
          arrivalAlternate,
          ...ajms.data,
          ...flightAwareRes.data,
          ...flightStatsTZRes.data,
        };

        // ... (Your existing isDataEffectivelyEmpty check) ...

        // --- STEP 3.5: FIRST RENDER - Update state with PRIMARY flight data ---
        setFlightState(prevState => ({
          ...prevState,
          data: combinedFlightData,
          loadingFlight: false,
        }));

        // --- STEP 4: Fetch SECONDARY data (EDCT) ---
        if (import.meta.env.VITE_EDCT_FETCH === "1" && departure && arrival) {
          flightService.getEDCT({
            flightID,
            origin: departure.slice(1),
            destination: arrival.slice(1),
          })
            .then(({ EDCTRes }) => {
              setFlightState(prevState => ({
                ...prevState,
                edct: EDCTRes?.data,
                loadingEdct: false,
              }));
            })
            .catch((error: Error) => {
              console.error("Failed to fetch EDCT data:", error);
              setFlightState(prevState => ({ ...prevState, loadingEdct: false }));
            });
        } else {
          setFlightState(prevState => ({ ...prevState, loadingEdct: false }));
        }

        // --- STEP 5: Fetch SECONDARY data (Weather/NAS) ---
        // ... (Your existing getWeatherAndNAS logic) ...
        const airportsToFetch = [
          { key: "departure", code: departure },
          { key: "arrival", code: arrival },
          // ... etc
        ].filter(item => item.code);

        if (airportsToFetch.length > 0) {
          Promise.all(
            airportsToFetch.map(airport =>
              flightService.getWeatherAndNAS(airport.code || "")
            )
          )
            .then((results: any[]) => {
              const finalWeather: { [key: string]: any } = {};
              const finalNas: { [key: string]: any } = {};
              // ... (your logic to build finalWeather/finalNas)
              setFlightState(prevState => ({
                ...prevState,
                weather: finalWeather,
                nas: finalNas,
                loadingWeatherNas: false,
              }));
            })
            .catch((error: Error) => {
              console.error("Failed to fetch weather/NAS data:", error);
              setFlightState(prevState => ({ ...prevState, loadingWeatherNas: false }));
            });
        } else {
          setFlightState(prevState => ({ ...prevState, loadingWeatherNas: false }));
        }
      } catch (e) {
        console.error("Error fetching primary flight details:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setFlightState(prevState => ({
          ...prevState,
          loadingFlight: false,
          loadingEdct: false,
          loadingWeatherNas: false,
          data: null,
          error: errorMessage,
        }));
      }
    };

    fetchLegDetails();
  }, [
    flightState.selectedDate,
    flightState.selectedLegIndex,
    flightState.loadingSchedule,
    flightState.scheduleData, // Add scheduleData as dependency
  ]);

  // The hook returns its state object AND the new setters
  return { ...flightState, setSelectedDate, setSelectedLegIndex };
};

export default useFlightData;