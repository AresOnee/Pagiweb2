/**
 * Gel Chile - Service Worker for PWA
 * Implements network-first strategy with offline fallback
 */

// BUILD_TIMESTAMP is replaced by the build script for cache busting
const CACHE_NAME = 'gelchile-1771047075801';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/productos',
  '/nosotros',
  '/cotizacion',
  '/assets/img/gelchile-logo.webp',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

// Install: precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API requests and form submissions
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('web3forms.com')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        // Clone response to cache
        const responseClone = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // For HTML pages, return offline page
          if (event.request.headers.get('Accept')?.includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }

          // Return empty response for other assets
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
