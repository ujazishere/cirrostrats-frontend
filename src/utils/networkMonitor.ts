/**
 * Monitors the network status and notifies listeners of changes.
 * It validates 'online' events with a quick health check.
 */

let isOnline = navigator.onLine;
const listeners = new Set<(isOnline: boolean) => void>();
const HEALTH_CHECK_URL = '/'; // Use the site's root as a simple health check

/**
 * Notifies all registered listeners of the new status.
 */
function notifyListeners(): void {
  console.log(`[Network] Status changed. Notifying ${listeners.size} listeners. New status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  listeners.forEach((listener) => listener(isOnline));
}

/**
 * Performs a quick fetch request to confirm connectivity.
 */
async function runHealthCheck(): Promise<void> {
  try {
    // We add a cache-busting query to ensure we're not just hitting a service worker cache
    const response = await fetch(`${HEALTH_CHECK_URL}?_healthcheck=${Date.now()}`, {
      method: 'HEAD', // HEAD request is lightweight
      mode: 'no-cors', // Use no-cors for a simple check against our own origin
      cache: 'no-store',
    });
    
    // If we get any response (even an error), the network is technically reachable.
    // We are just checking for network-level failures.
    if (!isOnline) {
      isOnline = true;
      notifyListeners();
    }
  } catch (error) {
    // This fetch will fail with a TypeError if there is a network error
    console.warn('[Network] Health check failed, device is likely offline.', error);
    if (isOnline) {
      isOnline = false;
      notifyListeners();
    }
  }
}

// --- Event Listeners ---

window.addEventListener('online', () => {
  console.log('[Network] Browser reported ONLINE.');
  // Don't just trust the event. Verify with a health check.
  runHealthCheck();
  
  // Start a periodic check in case we're offline again soon
  startPeriodicChecks();
});

window.addEventListener('offline', () => {
  console.log('[Network] Browser reported OFFLINE.');
  if (isOnline) {
    isOnline = false;
    notifyListeners();
  }
  // Stop periodic checks when we know we're offline
  stopPeriodicChecks();
});

// --- Periodic Check for Recovery ---
let periodicCheckInterval: number | null = null;

function startPeriodicChecks(): void {
  if (periodicCheckInterval) return; // Already running
  console.log('[Network] Starting periodic health checks.');
  periodicCheckInterval = window.setInterval(runHealthCheck, 10000); // Check every 10s
}

function stopPeriodicChecks(): void {
  if (periodicCheckInterval) {
    console.log('[Network] Stopping periodic health checks.');
    clearInterval(periodicCheckInterval);
    periodicCheckInterval = null;
  }
}

// Start checking immediately on load
runHealthCheck();
if (isOnline) {
  startPeriodicChecks();
}


// --- Public API ---

/**
 * Gets the current known online status.
 */
export function getOnlineStatus(): boolean {
  return isOnline;
}

/**
 * Registers a callback function to be called when network status changes.
 * @param callback The function to call with the new online status.
 * @returns An `unsubscribe` function to remove the listener.
 */
export function onStatusChange(callback: (isOnline: boolean) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}