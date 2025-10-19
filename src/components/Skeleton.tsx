import React, { useEffect } from "react";

// LoadingAirportCard: Displays a skeleton loader for weather-related information
export const LoadingAirportCard: React.FC = () => (
  <div className="skeleton-section shimmer-container">
    {/* D-ATIS Section Skeleton */}
    <div className="skeleton-header">
      <div className="skeleton-title shimmer-element"></div>
      <div className="skeleton-time shimmer-element"></div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-text-short shimmer-element"></div>
    </div>
    {/* METAR Section Skeleton */}
    <div className="skeleton-header">
      <div className="skeleton-title shimmer-element"></div>
      <div className="skeleton-time shimmer-element"></div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-text-medium shimmer-element"></div>
    </div>
    {/* TAF Section Skeleton */}
    <div className="skeleton-header">
      <div className="skeleton-title shimmer-element"></div>
      <div className="skeleton-time shimmer-element"></div>
    </div>
    <div className="skeleton-content skeleton-taf">
      {[1, 2, 3, 4, 5].map((line: number) => (
        <div key={line} className="skeleton-text-line shimmer-element"></div>
      ))}
    </div>
  </div>
);

// LoadingFlightCard: Displays a skeleton loader for flight-related details
export const LoadingFlightCard: React.FC = () => {
  // Initialize shimmer effect when component mounts
  useEffect(() => {
    initShimmerEffect();
  }, []);

  return (
    <div className="details shimmer-container">
      {/* Flight Info Card Skeleton */}
      <div className="skeleton-flight-card">
        <div className="skeleton-flight-header">
          <div className="skeleton-flight-id shimmer-element"></div>
          <div className="skeleton-flight-number shimmer-element"></div>
        </div>
        <div className="skeleton-flight-body">
          {/* Left Gate Skeleton */}
          <div className="skeleton-gate-container">
            <div className="skeleton-gate-label shimmer-element"></div>
            <div className="skeleton-gate-value shimmer-element"></div>
            <div className="skeleton-gate-schedule shimmer-element"></div>
            <div className="skeleton-gate-status shimmer-element"></div>
          </div>
          {/* Right Gate Skeleton */}
          <div className="skeleton-gate-container">
            <div className="skeleton-gate-label shimmer-element"></div>
            <div className="skeleton-gate-value shimmer-element"></div>
            <div className="skeleton-gate-schedule shimmer-element"></div>
            <div className="skeleton-gate-status shimmer-element"></div>
          </div>
        </div>
      </div>
      {/* Tabs Skeleton */}
      <div className="skeleton-tabs-container">
        {/* Tab Headers */}
        <div className="skeleton-tabs-header">
          <div className="skeleton-tab skeleton-tab-active shimmer-element"></div>
          <div className="skeleton-tab shimmer-element"></div>
          <div className="skeleton-tab shimmer-element"></div>
          <div className="skeleton-tab shimmer-element"></div>
        </div>
        <LoadingAirportCard />
      </div>
    </div>
  );
};

// Function to initialize shimmer effect
const initShimmerEffect = (): void => {
  // Add CSS for shimmer effect
  const shimmerStyle: HTMLStyleElement = document.createElement("style");
  shimmerStyle.textContent = `
    /* Base styles for shimmer containers */
    .shimmer-container {
      position: relative;
      overflow: hidden;
    }

    /* Base styles for elements that will shimmer */
    .shimmer-element {
      position: relative;
      overflow: hidden;
      background: #e0e0e0;
    }

    /* Shimmer animation */
    .shimmer-element::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.2) 20%,
        rgba(255, 255, 255, 0.5) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      100% {
        transform: translateX(2%);
      }
    }
  `;
  document.head.appendChild(shimmerStyle);
};

export default {
  LoadingAirportCard: LoadingAirportCard,
  LoadingFlightCard,
};
