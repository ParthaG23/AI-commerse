const CACHE_NAME = "nuvix-cache-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  "/favicon-96x96.png",
  "/logo.png",
  "/apple-touch-icon.png",
  "/favicon.ico"
];

// Install Event - Pre-cache core offline shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline fallback shell");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing stale cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Intercept requests with custom strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // We only intercept GET requests
  if (request.method !== "GET") return;

  // 1. Navigation request (HTML pages) - Network first, Offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If response is valid, clone it and cache it dynamically for offline browsing
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed (offline). Try serving the cached page first, or fallback to the offline page.
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, Fonts, Images) - Cache-first, Network fallback
  const isStaticAsset = 
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.url.includes(".js") ||
    request.url.includes(".css") ||
    request.url.includes("/fonts/");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch new version in the background to keep cache fresh (stale-while-revalidate style)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {/* Silent catch if offline in background */});
            
          return cachedResponse;
        }

        // Not in cache, fetch and add to cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback for missing images when offline
            if (request.destination === "image") {
              return caches.match("/logo.png");
            }
          });
      })
    );
  }
});
