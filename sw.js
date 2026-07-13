// Spark Homes Repair Estimator — Service Worker
// Cache-first strategy for all static assets

const CACHE_NAME = 'spark-estimator-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets reliably; CDN assets best-effort.
      // Tesseract's worker/core-wasm/lang-data files are not listed here since
      // they're fetched dynamically at runtime — the fetch handler below caches
      // them opportunistically the first time OCR runs successfully online, so
      // OCR keeps working offline afterward.
      const localAssets = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './logo.png'];
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
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses (covers CDN + runtime-fetched assets like
        // Tesseract's worker/wasm/lang-data, enabling offline OCR after first use)
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
