// sw.js
// Service Worker for Offline Capabilities

const CACHE_NAME = 'rick-morty-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/register.html',
    '/recover.html',
    '/characters.html',
    '/episodes.html',
    '/style.css',
    '/app.js',
    '/auth.js',
    '/characters.js',
    '/episodes.js'
];

// Install Event - Cache Static Assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Stale-While-Revalidate for API, Cache-First for static assets
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // If it's an API request, try network first, then fallback to cache
    if (requestUrl.hostname === 'rickandmortyapi.com') {
        event.respondWith(
            fetch(event.request)
            .then(response => {
                // Clone the response and save it to the cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // If network fails, try to serve from cache
                return caches.match(event.request);
            })
        );
        return;
    }

    // For static assets, Cache-First strategy
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response; // Return from cache
            }
            // If not in cache, fetch from network
            return fetch(event.request).then(networkResponse => {
                // Cache the newly fetched asset
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            });
        })
    );
});
