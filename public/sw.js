/**
 * Gel Chile - Service Worker for PWA
 * Stale-while-revalidate for assets, network-first for HTML
 */

// BUILD_TIMESTAMP is replaced by the build script for cache busting
const CACHE_NAME = 'gelchile-1771093463359';
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

// Helpers
function isAsset(url) {
  return url.pathname.startsWith('/_astro/') ||
         url.pathname.startsWith('/assets/') ||
         url.pathname.match(/\.(webp|png|jpg|svg|woff2|css|js)$/);
}

// Fetch handler with split strategy
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

  const url = new URL(event.request.url);

  if (isAsset(url)) {
    // Stale-while-revalidate for static assets
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
  } else {
    // Network-first for HTML pages
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.headers.get('Accept')?.includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            return new Response('', { status: 503, statusText: 'Offline' });
          });
        })
    );
  }
});
