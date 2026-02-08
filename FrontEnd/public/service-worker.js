/**
 * Service Worker - Rukun Ternak PWA
 * 
 * Cache Strategy:
 * 1. Static Assets (CSS, JS, images) - Cache First with network fallback
 * 2. API Calls - Network First with cache fallback
 * 3. HTML Documents - Network First with cache fallback
 * 4. Images - Stale While Revalidate
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `rukun-ternak-static-${CACHE_VERSION}`;
const API_CACHE = `rukun-ternak-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `rukun-ternak-images-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rukun-ternak-runtime-${CACHE_VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/partner-logo.png'
];

/**
 * INSTALL EVENT
 * Pre-cache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Precaching assets:', PRECACHE_ASSETS.length);
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Some assets failed to precache:', err);
        // Don't fail installation if some assets fail
        return Promise.resolve();
      });
    })
  );
  
  // Skip waiting - activate immediately
  self.skipWaiting();
});

/**
 * ACTIVATE EVENT
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old versions
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  return self.clients.claim();
});

/**
 * FETCH EVENT
 * Implement caching strategies based on request type
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API calls - Network First
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Images - Stale While Revalidate
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidateStrategy(request, IMAGE_CACHE));
    return;
  }

  // HTML pages - Network First
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // Static assets (JS, CSS) - Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Default - Cache First
  event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
});

/**
 * CACHE FIRST STRATEGY
 * Try cache first, fallback to network
 * Best for: Static assets, images, offline content
 */
function cacheFirstStrategy(request, cacheName) {
  return caches.match(request).then((response) => {
    // Return cached response if found
    if (response) {
      console.log('[SW Cache] HIT (Cache First):', request.url);
      return response;
    }

    // Fetch from network if not cached
    return fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone response for caching
        const responseToCache = response.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch((err) => {
        console.error('[SW Error] Fetch failed for:', request.url, err);
        
        // Return offline page if available
        return caches.match('/index.html').catch(() => {
          return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      });
  });
}

/**
 * NETWORK FIRST STRATEGY
 * Try network first, fallback to cache
 * Best for: API calls, HTML pages, dynamic content
 */
function networkFirstStrategy(request, cacheName) {
  return fetch(request)
    .then((response) => {
      // Only cache successful responses
      if (!response || response.status !== 200) {
        return response;
      }

      // Clone response for caching
      const responseToCache = response.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(request, responseToCache);
      });

      console.log('[SW Cache] FETCH & CACHE (Network First):', request.url);
      return response;
    })
    .catch((err) => {
      console.log('[SW Cache] Network failed, trying cache:', request.url);
      
      // Fallback to cache
      return caches.match(request).then((response) => {
        if (response) {
          console.log('[SW Cache] HIT (Fallback):', request.url);
          return response;
        }

        // No cache and no network
        console.warn('[SW Error] No cache or network for:', request.url);
        return new Response('Offline - Data not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    });
}

/**
 * STALE WHILE REVALIDATE STRATEGY
 * Return cache immediately, update in background
 * Best for: Images, non-critical data
 */
function staleWhileRevalidateStrategy(request, cacheName) {
  return caches.match(request).then((cachedResponse) => {
    // Return cached response immediately (stale)
    const fetchPromise = fetch(request).then((response) => {
      // Only cache successful responses
      if (!response || response.status !== 200) {
        return response;
      }

      // Clone response for caching
      const responseToCache = response.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(request, responseToCache);
        console.log('[SW Cache] REVALIDATED (Stale While Revalidate):', request.url);
      });

      return response;
    });

    // Return cached response if available, otherwise wait for network
    return cachedResponse || fetchPromise.catch(() => {
      console.warn('[SW Error] SWR failed for:', request.url);
      return new Response('Offline', { status: 503 });
    });
  });
}

/**
 * MESSAGE EVENT
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[Service Worker] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      Promise.all([
        caches.open(STATIC_CACHE),
        caches.open(API_CACHE),
        caches.open(IMAGE_CACHE)
      ]).then(([staticCache, apiCache, imageCache]) => {
        Promise.all([
          staticCache.keys(),
          apiCache.keys(),
          imageCache.keys()
        ]).then(([staticKeys, apiKeys, imageKeys]) => {
          event.ports[0].postMessage({
            static: staticKeys.length,
            api: apiKeys.length,
            images: imageKeys.length,
            total: staticKeys.length + apiKeys.length + imageKeys.length
          });
        });
      })
    );
  }
});

/**
 * BACKGROUND SYNC (Optional - future enhancement)
 * Sync pending API requests when online
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncPendingReports());
  }
});

async function syncPendingReports() {
  try {
    // Get pending requests from cache
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    
    // Retry failed POST requests
    const failedRequests = requests.filter(req => 
      req.method === 'POST' && !req.url.includes('success')
    );
    
    console.log('[Service Worker] Syncing pending reports:', failedRequests.length);
    
    // Retry each request
    return Promise.all(
      failedRequests.map(req => 
        fetch(req).catch(err => {
          console.warn('[Service Worker] Sync failed for:', req.url, err);
        })
      )
    );
  } catch (err) {
    console.error('[Service Worker] Background sync error:', err);
  }
}

console.log('[Service Worker] Loaded and ready');
