// Zentrix IoT — Service Worker
// Cache-first for assets, network-first for API

const CACHE_NAME    = 'zentrix-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/zentrix-logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/logo.svg',
  // Product images
  '/images/forest-alert.svg',
  '/images/animal-repellent.svg',
  '/images/gsm-starter.svg',
  '/images/wifi-starter.svg',
  '/images/lora-starter.svg',
  '/images/farm-valve.svg',
  '/images/car-charger.svg',
  '/images/timer-switch.svg',
  '/images/water-level.svg',
  '/images/temp-monitor.svg',
  '/images/home-automation.svg',
  '/images/data-logger.svg',
  '/images/industrial-iot.svg',
  '/images/custom-iot.svg',
];

// ── INSTALL — cache static assets ────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE — clean old caches ───────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH — smart caching strategy ───────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // API calls — network first, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline — please check your connection' }),
          { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // Static assets — cache first, then network
  if (url.pathname.startsWith('/images/') ||
      url.pathname === '/manifest.json' ||
      url.pathname === '/sw.js') {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // HTML pages — network first, cache fallback
  event.respondWith(
    fetch(request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
  );
});

// ── PUSH NOTIFICATIONS (future use) ──────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Zentrix IoT', {
    body:  data.body  || 'New update from Zentrix IoT',
    icon:  '/images/icon-192.png',
    badge: '/images/icon-96.png',
  });
});
