// Service Worker Cleanup Script
// This will unregister all service workers and clear caches

self.addEventListener('activate', event => {
  console.log('🧹 Cleaning up old caches...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('install', event => {
  console.log('🛑 Service Worker cleanup installed');
  // Skip waiting - activate immediately
  self.skipWaiting();
});

// Don't cache anything
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
