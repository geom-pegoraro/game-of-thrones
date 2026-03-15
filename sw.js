/* ============================================================
   IRON & ALLIANCES — sw.js (Service Worker) v1.9.0
   ============================================================ */

const CACHE_NAME = 'iron-alliances-v1.9.0';
const ASSETS_TO_CACHE = [
  '/game-of-thrones/',
  '/game-of-thrones/index.html',
  '/game-of-thrones/style.css',
  '/game-of-thrones/game.js',
  '/game-of-thrones/manifest.json',
  '/game-of-thrones/track-1.mp3',
  '/game-of-thrones/track-2.mp3',
];

// INSTALL: cancella tutto e skipWaiting immediato
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE_NAME))
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// ACTIVATE: prendi controllo subito
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// FETCH: network-first per JS/CSS/HTML, cache-first per il resto
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  if (event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        }).catch(() => new Response('Font loading failed', { status: 404 }));
      })
    );
    return;
  }

  const url = event.request.url;
  const isCore = url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html') || url.endsWith('/');
  if (isCore) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        }).catch(() => new Response('Network error', { status: 500 }));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Resource not found', { status: 404 });
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
