/* Service worker: app shell + emergency data offline.
 *
 * Written by hand rather than generated. What is cached here matters — the
 * helpline numbers have to survive with no network — and a generated worker
 * hides that decision behind configuration.
 *
 * Two caches, two strategies:
 *   shell   cache-first. The app must open with no network at all.
 *   data    network-first with a cache fallback, for /api/important_numbers.
 *           Fresh numbers when online, last known numbers when not.
 *
 * /api/chat and /api/chat/stream are never cached: an answer depends on the
 * corpus version, and a stale legal answer is worse than an honest "you are
 * offline". A streamed response must not be cached for a second reason — the
 * body is consumed once as it arrives, and caching it would mean buffering the
 * whole answer before the reader sees any of it.
 */
const VERSION = 'kyr-v2';
const SHELL_CACHE = `${VERSION}-shell`;
const DATA_CACHE = `${VERSION}-data`;

const SHELL = [
  '/',
  // The emergency numbers page is the one screen that has to open with no
  // network at all, so it is precached rather than merely cached on first visit.
  '/emergency',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon-180x180.png',
  '/aion-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // addAll fails the whole install if any single URL 404s, which would leave
      // the app with no worker at all. Add individually and tolerate misses.
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => !name.startsWith(VERSION)).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Emergency data: fresh if possible, last known otherwise.
  if (url.pathname === '/api/important_numbers') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Never serve a cached answer or a cached corpus fingerprint. This covers
  // /api/chat and /api/chat/stream; both are POST and would already have been
  // skipped above, but the rule is written out so it survives a future GET.
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: try the network, then the cached copy of the page that was
  // actually requested, and only then the shell. Falling straight back to '/'
  // would answer an offline request for /emergency with the home page — the
  // one screen someone opens offline is the one they would not get.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () =>
          (await caches.match(request, { ignoreSearch: true }))
          || (await caches.match(url.pathname))
          || (await caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
