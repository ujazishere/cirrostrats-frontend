import { useState, useEffect } from 'react';
import { getOnlineStatus, onStatusChange } from '../utils/networkMonitor';

/**
 * A simple React hook that subscribes to the network monitor
 * and returns the current online/offline status.
 *
 * @returns `true` if the network is considered online, `false` otherwise.
 */
export function useOnlineStatus(): boolean {
  // Initialize state with the current status from the monitor
  const [isOnline, setIsOnline] = useState(getOnlineStatus());

  useEffect(() => {
    // onStatusChange returns an 'unsubscribe' function.
    // We call this unsubscribe function when the component unmounts
    // to prevent memory leaks.
    const unsubscribe = onStatusChange(setIsOnline);
    
    // Log initial status check
    console.log(`[useOnlineStatus] Hook mounted. Initial status: ${getOnlineStatus()}`);

    return () => {
      console.log('[useOnlineStatus] Hook unmounting. Unsubscribing from network monitor.');
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return isOnline;
}
