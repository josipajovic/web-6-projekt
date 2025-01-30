// static files to cache
const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  './styles.css',
  './script.js'
];

// cache all files and routes when the Service Worker is installed
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const r = await caches.match(event.request);
      console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(event.request);
      const cache = await caches.open(CACHE_NAME);
      console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })(),
  );
});

// delete any outdated caches when the Service Worker is activated
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-push-notification') {
    event.waitUntil(
      sendPushNotification() // Function to send the push notification
    );
  }
});

// send push notification
function sendPushNotification() {
  return self.registration.showNotification('Background Sync Complete', {
    body: 'Your background sync has been completed successfully!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  });
}
