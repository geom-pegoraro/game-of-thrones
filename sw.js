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
      fetch(event.request)
        .then(r => { caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone())); return r; })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  const url = event.request.url;
  const isCore = url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html') || url.endsWith('/');
  if (isCore) {
    event.respondWith(
      fetch(event.request)
        .then(r => {
          if (r && r.status === 200) caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(r => {
        if (r && r.status === 200 && r.type !== 'opaque') caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone()));
        return r;
      }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : undefined);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
