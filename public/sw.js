const CACHE_NAME = "comprahorro-pwa-v2-clean";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo-oficial.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => {
      // Forzar limpieza de caché de logo.png si existe
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.keys().then((requests) => {
          return Promise.all(
            requests
              .filter((request) => request.url.includes('logo.png') || request.url.includes('principal-home.png'))
              .map((request) => cache.delete(request))
          );
        });
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          const shouldCache =
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.url.startsWith(self.location.origin);

          if (shouldCache) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
