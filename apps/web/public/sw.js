const CACHE_VERSION = 'v2';
const STATIC_CACHE = `edu-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `edu-dynamic-${CACHE_VERSION}`;

// Only pre-cache assets that are guaranteed to be static files.
// Server-rendered Next.js routes (e.g. /student) cannot be reliably
// pre-cached because they may redirect based on auth state.
const APP_SHELL = [
  '/offline.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from our own origin
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Next.js static chunks — cache-first so the app loads fast offline
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // Next.js data / RSC calls — network only (always fresh)
  if (url.pathname.startsWith('/_next/')) return;

  // App pages — network first, then cache, then offline fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || caches.match('/offline.html')
        )
      )
  );
});

// Allow the page to trigger a SW update without waiting for all tabs to close
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
