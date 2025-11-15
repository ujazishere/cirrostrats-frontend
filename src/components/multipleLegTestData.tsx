import axios from "axios";
import { FlightDay } from "./FlightData"; // Import the type from flightdata.tsx

// Configuration
const apiUrl = import.meta.env.VITE_API_URL;

// Simulates the Scenario 1 (Multiple legs, single day)
// and Scenario 2 (Single leg, multiple days)
export const MOCK_SCHEDULE_DATA: FlightDay[] = [
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

// This is your *old* mock data, which we reuse to simulate fetching *details* for a leg.
export const getMockLegDetails = async () => {
  const res = await axios.get(`${apiUrl}/testDataReturns`);
  console.log("!!TEST FLIGHT *LEG DETAILS* DATA!!", res.data);
  return {
    data: res.data.flightData || res.data,
    weather: res.data.weather || res.data,
    nas: res.data.NAS || res.data,
    edct: res.data.EDCT || res.data,
  };
};