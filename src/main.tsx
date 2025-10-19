import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

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
