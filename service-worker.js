const CACHE_NAME = 'inspectwise-go-v2';
const OFFLINE_URLS = [
    '/',
    '/InspectWiseGo.html',
    '/style.css',
    '/script.js',
    '/formValidation.js',
    '/samplingPlan.js',
    '/photoHandler.js',
    '/reportGenerator.js',
    '/partsList.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

const CDN_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/idb/7.0.0/idb.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => key !== CACHE_NAME && caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Handle CDN resources
    if (CDN_URLS.includes(requestUrl.href)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                // Return cached response if available (for offline use)
                if (cachedResponse) {
                    // Fetch in the background to update cache
                    fetchAndCache(event.request);
                    return cachedResponse;
                }

                // Fetch from network and cache if online
                return fetchAndCache(event.request).catch(() => {
                    // Fallback for offline cache miss
                    return new Response('Feature unavailable offline. Please reconnect.', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
        );
    } else {
        // Handle local assets
        event.respondWith(
            caches.match(event.request).then(cached => {
                const networkFetch = fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
                return cached || networkFetch.catch(() => caches.match('/InspectWiseGo.html'));
            })
        );
    }
});

// Helper function to fetch and cache CDN resources
function fetchAndCache(request) {
    return fetch(request).then(response => {
        if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
    });
}
