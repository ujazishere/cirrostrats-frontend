import React from "react";

// LoadingWeatherCard: Displays a skeleton loader for weather-related information
export const LoadingWeatherCard = () => (
  <div className="skeleton-section">
    {/* D-ATIS Section Skeleton */}
    <div className="skeleton-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-time"></div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-text-short"></div>
    </div>
    
    {/* METAR Section Skeleton */}
    <div className="skeleton-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-time"></div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-text-medium"></div>
    </div>
    
    {/* TAF Section Skeleton */}
    <div className="skeleton-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-time"></div>
    </div>
    <div className="skeleton-content skeleton-taf">
      {[1, 2, 3, 4, 5].map((line) => (
        <div key={line} className="skeleton-text-line"></div>
      ))}
    </div>
  </div>
);

// LoadingFlightCard: Displays a skeleton loader for flight-related details
export const LoadingFlightCard = () => (
  <div className="details">
    {/* Flight Info Card Skeleton */}
    <div className="skeleton-flight-card">
      <div className="skeleton-flight-header">
        <div className="skeleton-flight-id"></div>
        <div className="skeleton-flight-number"></div>
      </div>
      
      <div className="skeleton-flight-body">
        {/* Left Gate Skeleton */}
        <div className="skeleton-gate-container">
          <div className="skeleton-gate-label"></div>
          <div className="skeleton-gate-value"></div>
          <div className="skeleton-gate-schedule"></div>
          <div className="skeleton-gate-status"></div>
        </div>
        
        {/* Right Gate Skeleton */}
        <div className="skeleton-gate-container">
          <div className="skeleton-gate-label"></div>
          <div className="skeleton-gate-value"></div>
          <div className="skeleton-gate-schedule"></div>
          <div className="skeleton-gate-status"></div>
        </div>
      </div>
    </div>
    
    {/* Tabs Skeleton */}
    <div className="skeleton-tabs-container">
      {/* Tab Headers */}
      <div className="skeleton-tabs-header">
        <div className="skeleton-tab skeleton-tab-active"></div>
        <div className="skeleton-tab"></div>
        <div className="skeleton-tab"></div>
        <div className="skeleton-tab"></div>
      </div>
      
      <LoadingWeatherCard />
    </div>
  </div>
);

export default {
  LoadingWeatherCard,
  LoadingFlightCard
};