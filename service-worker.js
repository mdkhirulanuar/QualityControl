const CACHE_NAME = 'inspectwisego-cache-v2';

const urlsToCache = [
  './',
  './InspectWiseGo.html',
  './style.css',
  './manifest.json',
  './offline.html',

  // JS modules
  './main.js',
  './partsList.js',
  './aql.js',
  './validation.js',
  './photoHandler.js',
  './reportGenerator.js',
  './formHandler.js',
  './verdictHandler.js',

  // Icons
  './icons/icon-192.png',
  './icons/icon-512.png',

  // CDN libraries
  'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install and cache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
