// Service Worker for Blaze Restaurant Website
let CACHE_VERSION = '4.20';
let CACHE_NAME = `blaze-restaurant-cache-v${CACHE_VERSION}`;

// Resources to cache immediately on install
const CORE_ASSETS = [
  './',
  './index.html',
  './styles/main.css',
  './scripts/main.js',
  './version.js',
  './styles.css',
  './script.js',
  './assets/Blaze PNG 3.svg',
  './manifest.json'
];

// Resources to cache when used
const SECONDARY_ASSETS = [
  './pages/menu.html',
  './pages/about.html',
  './pages/contact.html',
  './pages/hours-location.html',
  './menu-transitions.js',
  './dissolve-animation.js',
  './menu-scroll.js',
  './scroller.js',
  './floating-buttons.js',
  './ajax-navigation.js',
  './optimize-images.js'
];

// Menu pages to cache when used
const MENU_PAGES = [
  './pages/gourmet-burgers.html',
  './pages/wraps.html',
  './pages/sides.html',
  './pages/pasta.html',
  './pages/main-course.html',
  './pages/chinese.html',
  './pages/og-momos.html',
  './pages/cold-beverages.html',
  './pages/hot-beverages.html',
  './pages/desserts.html',
  './pages/indian.html'
];

// Assets to cache when used
const ASSET_URLS = [
  './assets/About.svg',
  './assets/Get D.svg',
  './assets/MAIN.svg',
  './assets/menu/GOURMET BURGERS.svg',
  './assets/menu/WRAPS.svg',
  './assets/menu/SIDES.svg',
  './assets/menu/PASTA.svg',
  './assets/menu/MAIN COURSE.svg',
  './assets/menu/CHINESE.svg',
  './assets/menu/momos.svg',
  './assets/menu/COLD BEVERAGES.svg',
  './assets/menu/HOT BEVERAGES.svg',
  './assets/menu/DESSERTS.svg',
  './assets/menu/INDIAN.svg'
];

// Font assets
const FONT_ASSETS = [
  './assets/Beautiful Freak Bold.otf',
  './assets/Teko-VariableFont_wght.ttf'
];

// All assets combined
const ALL_ASSETS = [
  ...CORE_ASSETS,
  ...SECONDARY_ASSETS,
  ...MENU_PAGES,
  ...ASSET_URLS,
  ...FONT_ASSETS
];

// Listen for messages from the main script for version updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'VERSION_UPDATE') {
    const newVersion = event.data.version;
    const oldVersion = event.data.previousVersion;
    
    console.log(`[Service Worker] Version update detected: ${oldVersion} -> ${newVersion}`);
    
    // Update cache version
    CACHE_VERSION = newVersion;
    CACHE_NAME = `blaze-restaurant-cache-v${CACHE_VERSION}`;
    
    // Clear all caches and recache core assets
    clearCachesAndRecache();
  }
});

// Function to clear all caches and recache core assets
async function clearCachesAndRecache() {
  try {
    // Clear all old caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName.startsWith('blaze-restaurant-cache-')) {
          console.log(`[Service Worker] Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        }
      })
    );
    
    // Create new cache with core assets
    const cache = await caches.open(CACHE_NAME);
    console.log('[Service Worker] Recreating cache with new version:', CACHE_VERSION);
    await cache.addAll(CORE_ASSETS);
    
    // Skip waiting to activate the new service worker immediately
    self.skipWaiting();
    
    // Notify all clients about the update
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_UPDATED',
        version: CACHE_VERSION
      });
    });
  } catch (error) {
    console.error('[Service Worker] Cache clearing failed:', error);
  }
}

// Install event - cache core assets
self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .catch(error => {
        console.error('Failed to cache core assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('blaze-restaurant-cache-') && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Claim clients to take control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network with stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  
  // Check if this is a versioned request
  const isVersionedRequest = url.search && url.search.includes('v=');
  
  // Handle page navigations
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, serve the cached index page
          return caches.match('./index.html');
        })
    );
    return;
  }
  
  // For all other requests, use stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // For versioned requests, prioritize network fetch to ensure fresh content
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Cache the new response for next time
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // No network, no cached response - return offline fallback
            if (!cachedResponse) {
              if (event.request.url.includes('.html')) {
                return caches.match('./index.html');
              }
              // For images, return a transparent placeholder
              if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                return new Response('', { 
                  status: 200, 
                  headers: new Headers({
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-store'
                  })
                });
              }
            }
          });
          
        // For versioned requests or first-time fetches, wait for the network
        if (isVersionedRequest || !cachedResponse) {
          return fetchPromise;
        }
        
        // For normal requests with a cached response, return cached immediately and update cache in background
        return cachedResponse;
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

// Function to sync contact form data when back online
async function syncContactForm() {
  try {
    const dataToSync = await localforage.getItem('pendingContactForm');
    if (dataToSync) {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync)
      });
      
      if (response.ok) {
        await localforage.removeItem('pendingContactForm');
        // Notify the user that the form was sent
        self.registration.showNotification('Blaze Restaurant', {
          body: 'Your contact form has been submitted successfully!',
          icon: './assets/icons/icon-192x192.png'
        });
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  const title = 'Blaze Restaurant';
  const options = {
    body: event.data ? event.data.text() : 'New updates from Blaze!',
    icon: './assets/icons/icon-192x192.png',
    badge: './assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});