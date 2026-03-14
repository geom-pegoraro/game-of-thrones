/* ============================================================
   IRON & ALLIANCES — sw.js (Service Worker)
   Offline caching strategy: Cache-first for assets
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

// ── INSTALL: cache all core assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching core assets v1.9.0');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean up old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first, fall back to network ──
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) return;

  // For Google Fonts and external resources: network-first
  if (event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For game assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback: return the main page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ── BACKGROUND SYNC (optional, for future save-to-server) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-data') {
    console.log('[SW] Background sync: game data');
  }
});

// ── PUSH NOTIFICATIONS (optional, for future) ──
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'Iron & Alliances', body: 'Il tuo regno ti chiama!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-72.png',
    })
  );
});
