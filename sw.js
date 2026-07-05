// Spark Homes Repair Estimator — Service Worker
// Cache-first strategy for all static assets

const CACHE_NAME = 'spark-estimator-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets reliably; CDN assets best-effort
      const localAssets = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/logo.png'];
      const cdnAssets = ASSETS.filter(a => a.startsWith('http'));
      return Promise.all([
        cache.addAll(localAssets).catch(() => {}),
        ...cdnAssets.map(url => cache.add(url).catch(() => {})),
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Skip non-GET and cross-origin requests that aren't CDN assets
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
