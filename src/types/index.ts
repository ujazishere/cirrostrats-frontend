// Global type definitions for the application

// Environment variables
export interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TEST_FLIGHT_DATA?: string;
  readonly VITE_APP_AVOID_FLIGHT_AWARE?: string;
  readonly VITE_ENV?: string;
  readonly VITE_EDCT_FETCH?: string;
  readonly VITE_TRACK_SEARCH?: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Weather types
export interface WeatherData {
  metar?: string;
  taf?: string;
  metar_ts?: string;
  taf_ts?: string;
  datis?: {
    arr?: {
      datis_ts?: string;
      [key: string]: any;
    };
    dep?: {
      datis_ts?: string;
      [key: string]: any;
    };
    combined?: {
      datis_ts?: string;
      [key: string]: any;
    };
  };
}

// TODO: make this type prescriptive
export type NASResponse =
  | {
      [key: string]: any;
      data?: any[];
      items?: any[];
    }
  | Record<string, any>;

// Flight Data types
export interface FlightData {
  flightID?: string;
  departure?: string;
  arrival?: string;
  departureAlternate?: string;
  arrivalAlternate?: string;
  registration?: string;
  aircraftType?: string;
  fa_route?: string;
  route?: string;
  fa_sv?: string;
  faa_skyvector?: string;
  clearance?: string;
  flightStatsOriginGate?: string;
  flightStatsDestinationGate?: string;
  flightStatsScheduledDepartureTime?: string;
  flightStatsScheduledArrivalTime?: string;
  flightStatsActualDepartureTime?: string;
  flightStatsEstimatedDepartureTime?: string;
  flightAwareScheduledOut?: string;
  flightAwareScheduledIn?: string;
  fa_estimated_out?: string;
  fa_estimated_in?: string;
}

export interface EDCTData {
  edct?: string;
  filedDepartureTime?: string;
  controlElement?: string;
  flightCancelled?: boolean;
}

// Search Value types
export interface SearchValue {
  type: string;
  value?: string;
  label: string;
  id?: string;
  referenceId?: string;
  metadata?: object;
  isRecent?: boolean;
  timestamp?: number;
}

export type AirportToFetch = string;

// Component Props types
export interface AirportCardProps {
  weatherDetails: WeatherData;
  nasResponseAirport: NASResponse;
  showSearchBar?: boolean;
}

export interface CombinedWeatherData {
  departureWeatherMdb?: WeatherData;
  departureWeatherLive?: WeatherData;
  arrivalWeatherMdb?: WeatherData;
  arrivalWeatherLive?: WeatherData;
  departureAlternateWeatherMdb?: WeatherData;
  departureAlternateWeatherLive?: WeatherData;
  arrivalAlternateWeatherMdb?: WeatherData;
  arrivalAlternateWeatherLive?: WeatherData;
}

export interface NASData {
  departureNAS?: NASResponse;
  arrivalNAS?: NASResponse;
  departureAlternateNAS?: NASResponse;
  arrivalAlternateNAS?: NASResponse;
}

export interface FlightCardProps {
  flightData: FlightData;
  weather: CombinedWeatherData;
  NAS: NASData;
  EDCT: EDCTData | null;
}

export interface GateData {
  FlightID: string;
  Gate: string;
  Scheduled: string;
  Estimated?: string;
  Departed?: string;
}

export interface GateCardProps {
  gateData: GateData[];
  currentSearchValue: SearchValue;
}

export interface TabFormatProps {
  flightData: FlightData;
  weather: CombinedWeatherData;
  NAS: NASData;
  hideChildSearchBars?: boolean;
}

export interface RoutePanelProps {
  flightData: FlightData;
  onRefresh: () => void;
}

export interface SummaryTableProps {
  flightData: FlightData;
  EDCT: EDCTData | null;
}

export interface FeedbackPopupProps {
  onClose: () => void;
  feedbackType: string;
  setFeedbackType: (type: string) => void;
  feedbackMessage: string;
  setFeedbackMessage: (message: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export interface SearchGraphProps {
  rawData: any[];
}

export interface SearchTimelineProps {
  rawData: any[];
}

export interface SearchInputProps {
  userEmail: string;
  [key: string]: any;
}
