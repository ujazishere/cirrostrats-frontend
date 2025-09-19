import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

const isProd = process.env.NODE_ENV === "production";

ReactDOM.createRoot(document.getElementById("root")).render(
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
  )
);
