/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/

// Cache configuration
const APP_PREFIX = 'inspectwise-go';
const VERSION = '2025.05.12'; // Update with major releases
const CACHE_NAME = `${APP_PREFIX}-${VERSION}`;
const MAX_CACHE_SIZE = 50; // Max items to cache

// Core assets to cache
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/partsList.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// External assets (CDNs)
const EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js'
];

// All assets to cache
const CACHE_ASSETS = [...CORE_ASSETS, ...EXTERNAL_ASSETS];

// Helper to limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return limitCacheSize(cacheName, maxItems); // Recursive cleanup
  }
}

// Notify clients of status
function notifyClients(message) {
  self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(client => client.postMessage({ type: 'SERVICE_WORKER_MESSAGE', message }));
  });
}

// Install event: Cache core and external assets
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(CACHE_ASSETS);
        console.log(`ServiceWorker: Cached assets for ${CACHE_NAME}`);
        notifyClients('Service worker installed and assets cached.');
        await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE);
        self.skipWaiting();
      } catch (err) {
        console.error('ServiceWorker: Install failed:', err);
        notifyClients('Service worker installation failed. Offline support may be limited.');
      }
    })()
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        const deletePromises = keys
          .filter(key => key !== CACHE_NAME && key.startsWith(APP_PREFIX))
          .map(key => caches.delete(key));
        await Promise.all(deletePromises);
        console.log(`ServiceWorker: Activated ${CACHE_NAME}, old caches cleared`);
        notifyClients('Service worker activated. Ready for offline use.');
        self.clients.claim();
      } catch (err) {
        console.error('ServiceWorker: Activation failed:', err);
        notifyClients('Service worker activation failed.');
      }
    })()
  );
});

// Fetch event: Handle requests with appropriate strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle partsList.js with network-first strategy
  if (url.pathname.endsWith('partsList.js')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Handle external assets with stale-while-revalidate
  if (EXTERNAL_ASSETS.includes(url.href)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Handle core assets with cache-first
  event.respondWith(cacheFirst(event.request));
});

// Cache-first strategy: Serve from cache, fallback to network
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE);
    return response;
  } catch (err) {
    console.error(`ServiceWorker: Cache-first failed for ${request.url}:`, err);
    const offlinePage = await caches.match('/index.html');
    if (offlinePage) {
      notifyClients('Offline mode: Serving cached content.');
      return offlinePage;
    }
    notifyClients('Offline and no cached content available.');
    throw err;
  }
}

// Network-first strategy: Try network, fallback to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE);
    return response;
  } catch (err) {
    console.warn(`ServiceWorker: Network-first failed for ${request.url}, using cache:`, err);
    const cached = await caches.match(request);
    if (cached) {
      notifyClients('Offline: Using cached parts list.');
      return cached;
    }
    notifyClients('Offline and no cached parts list available.');
    return caches.match('/index.html');
  }
}

// Stale-while-revalidate strategy: Serve cache immediately, update in background
async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await caches.match(request);
    const networkFetch = fetch(request).then(async response => {
      await cache.put(request, response.clone());
      await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE);
      return response;
    }).catch(err => {
      console.warn(`ServiceWorker: Stale-while-revalidate network update failed for ${request.url}:`, err);
    });
    return cached || (await networkFetch);
  } catch (err) {
    console.error(`ServiceWorker: Stale-while-revalidate failed for ${request.url}:`, err);
    notifyClients('Failed to load external resource.');
    return caches.match('/index.html');
  }
}