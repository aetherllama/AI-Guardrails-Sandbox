// Service Worker for AI Guardrails Sandbox
const CACHE_NAME = 'ai-guardrails-sandbox-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/data.js',
    '/js/app.js',
    '/js/services/contentFilter.js',
    '/js/services/inputValidator.js',
    '/js/services/outputSanitizer.js',
    '/js/services/financialGuardrails.js',
    '/js/services/singaporeFinancialGuardrails.js',
    '/js/services/guardrailService.js',
    '/icons/icon.svg',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // Clone and cache the response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseToCache));
                    return response;
                });
            })
    );
});
