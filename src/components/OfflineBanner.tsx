import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // Using existing dependency

interface OfflineBannerProps {
  isStale?: boolean;
  timestamp?: number | null;
}

// This is a simple, fixed banner for the top of the app
export const GlobalOfflineBanner: React.FC = () => {
  return (
    <div style={styles.globalBanner}>
      <span style={styles.icon}>&#9888;</span> {/* Warning sign */}
      You are currently offline. Data may be outdated.
    </div>
  );
};

// This is a more detailed, inline banner for cached data
export const StaleDataBanner: React.FC<OfflineBannerProps> = ({ isStale, timestamp }) => {
  if (!timestamp) return null;

  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  const message = isStale 
    ? `Showing cached data from ${timeAgo}. This may be outdated.`
    : `Showing cached data from ${timeAgo}.`;

  return (
    <div style={{ ...styles.staleBanner, backgroundColor: isStale ? '#fff3cd' : '#e6f7ff' }}>
      <span style={styles.icon}>{isStale ? '⏳' : '💾'}</span>
      {message}
    </div>
  );
};

// Basic JSS for styling to avoid needing a new CSS file
const styles: { [key: string]: React.CSSProperties } = {
  globalBanner: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '12px 20px',
    textAlign: 'center',
    fontWeight: 500,
    fontSize: '14px',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 2000, // High z-index
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staleBanner: {
    padding: '10px 15px',
    borderRadius: '8px',
    margin: '0 1rem 1rem 1rem', // Match your card padding
    color: '#333',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '10px',
    fontSize: '16px',
  },
};
