// serviceWorker.js — Caching static assets for offline use

const CACHE_NAME = 'inspectwise-cache-v1';
const OFFLINE_URL = 'offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/offline.html',
  '/js/main.js',
  '/js/eventHandlers.js',
  '/js/reset.js',
  '/js/ui.js',
  '/js/sampling.js',
  '/js/photo.js',
  '/js/report.js',
  '/js/config.js',
  '/js/validator.js',
  '/js/annotation.js',
  '/js/partsList.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL)
      )
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request)
      )
    );
  }
});
