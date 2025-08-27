/* InspectWise Go — Service Worker */
const CACHE_NAME = 'inspectwisego-cache-v5';
const PRECACHE_URLS = [
  './',
  './InspectWiseGo.html',
  './offline.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './css/style.css',
  './js/app.js',
  './js/data-loader.js',
  './js/samplingPlan.js',
  './js/sw-register.js',
  './data/operatorList.json',
  './data/partsList.json',
  // External CDNs you rely on (cache on first use)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.map(n => (n !== CACHE_NAME ? caches.delete(n) : 0))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./InspectWiseGo.html')) || cache.match('./offline.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        if (req.method === 'GET' && (res.status === 200 || res.type === 'opaque')) {
          caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
