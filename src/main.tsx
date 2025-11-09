import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

// NEW: Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('[App] Service Worker registered successfully with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('[App] Service Worker registration failed: ', error);
      });
  });
}
// END NEW

const isProd: boolean = process.env.NODE_ENV === "production";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  isProd ? (
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  ) : (
    <Router>
      <App />
    </Router>
  ),
);
