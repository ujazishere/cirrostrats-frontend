/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TEST_FLIGHT_DATA?: string;
  readonly VITE_APP_AVOID_FLIGHT_AWARE?: string;
  readonly VITE_ENV?: string;
  readonly VITE_EDCT_FETCH?: string;
  readonly VITE_TRACK_SEARCH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
