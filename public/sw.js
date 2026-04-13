const CACHE_NAME = "gs-app-shell-v2";

// App Shell files to pre-cache
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

// Install: pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for app shell, network-only for API
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache Supabase API calls, analytics, or external APIs
  if (
    url.hostname.includes("supabase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("googletagmanager") ||
    url.hostname.includes("facebook") ||
    url.hostname.includes("connect.facebook.net") ||
    url.hostname.includes("stripe") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/rest") ||
    url.pathname.startsWith("/storage") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Stale-While-Revalidate for everything else (static assets)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // Return cached version immediately, update in background
        return cachedResponse || fetchPromise;
      })
    )
  );
});
