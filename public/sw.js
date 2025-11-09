/*
 * SERVICE WORKER (Corrected)
 * This file runs in a separate thread from your web page.
 * Its main job is to intercept network requests and respond with
 * cached assets when the user is offline.
 */

// Increment the version to trigger a new install
const CACHE_NAME = 'cirrostrats-shell-v3'; // <-- Bumping version to v3

// These are the "App Shell" files. They are the minimum files
// needed to run the application's basic frame (the HTML, JS, CSS).
const URLS_TO_CACHE = [
  '/', // <-- We will serve this path
  '/index.html',
  '/logo.png',
  '/favicon.png'
  // Your JS and CSS files will be added to this cache automatically
  // the first time they are fetched (see "Cache First" strategy below).
];

// --- 1. INSTALL Event ---
self.addEventListener('install', (event) => {
  console.log(`[SW] Install event triggered (Version: ${CACHE_NAME}). Caching app shell...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache. Caching URLs:', URLS_TO_CACHE);
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] App shell cached successfully.');
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] App shell caching failed:', err);
      })
  );
});

// --- 2. ACTIVATE Event ---
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activate event triggered (Version: ${CACHE_NAME}). Cleaning up old caches...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache's name is not our current CACHE_NAME, we delete it.
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Now controlling the page.');
      // Take control of any open clients (tabs) immediately.
      return self.clients.claim();
    })
  );
});

// --- 3. FETCH Event (Corrected Logic) ---
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // --- IGNORE ALL NON-GET REQUESTS ---
  if (request.method !== 'GET') {
    return;
  }

  // --- STRATEGY 1: API CALLS (/api/) ---
  if (request.url.includes('/api/')) {
    // Let the request pass through to the network untouched.
    return;
  }
  
  // --- STRATEGY 2: CROSS-ORIGIN REQUESTS (Google, etc.) ---
  if (!request.url.startsWith(self.origin)) {
    return;
  }

  // --- STRATEGY 3: APP NAVIGATION (HTML) ---
  // Strategy: Network First, falling back to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse; // Always try to get the freshest HTML
        })
        .catch(() => {
          // If offline, serve the cached root HTML page.
          console.log('[SW] Network failed for navigation. Serving cached root /');
          
          // ✅ === THE FIX IS HERE === ✅
          // Instead of matching /index.html, we match the root '/'.
          // This is the correct way to serve a Single Page App.
          return caches.match('/');
          // ✅ ======================= ✅

        })
    );
    return;
  }

  // --- STRATEGY 4: STATIC ASSETS (JS, CSS, local images) ---
  // Strategy: Cache First, falling back to Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // 1. If we have it in the cache, return it immediately.
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. If not in cache, fetch it from the network.
        return fetch(request).then((networkResponse) => {
          // 3. Cache the new asset for next time.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          // 4. Return the network response to the browser.
          return networkResponse;
        });
      })
      .catch(error => {
        console.error('[SW] Error fetching static asset:', request.url, error);
        return new Response("Asset not found.", { status: 404 });
      })
  );
});