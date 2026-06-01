const CACHE_NAME = 'mente-sana-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones del mismo origen para evitar problemas con APIs externas como Clerk o Neon
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch(() => {
          // Si falla la red y no está en caché, simplemente dejamos que falle o mostramos fallback si es HTML
          return caches.match('/');
        });
      })
    );
  }
});
