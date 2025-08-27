/* InspectWise Go — Service Worker (root-level) */
const CACHE_NAME = 'inspectwisego-cache-v3';

// Precache the core app shell (paths relative to the service worker location at site root)
const PRECACHE_URLS = [
  './',
  './InspectWiseGo.html',
  './offline.html',
  './manifest.json',
  // assets
  './assets/icon-192.png',
  './assets/icon-512.png',
  // css
  './css/style.css',
  // js
  './js/script.js',
  './js/operatorList.js',
  './js/partsList.js',
  './js/samplingPlan.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

// Stale-while-revalidate for static assets; network-first for navigations
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Handle page navigations
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('./InspectWiseGo.html');
        return cached || cache.match('./offline.html');
      })
    );
    return;
  }

  // For others, try cache first, then network, and update the cache in the background
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkResp) => {
          // Only cache GET, same-origin OK responses
          if (
            req.method === 'GET' &&
            networkResp &&
            (networkResp.status === 200 || networkResp.type === 'opaque')
          ) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResp;
        })
        .catch(() => cached); // if network fails, fall back to cache if available

      // return cached immediately if present, else wait on network
      return cached || fetchPromise;
    })
  );
});
