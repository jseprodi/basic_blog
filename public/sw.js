const CACHE_NAME = 'blog-cache-v3';
const DYNAMIC_CACHE_NAME = 'blog-dynamic-v3';
const STATIC_CACHE_NAME = 'blog-static-v3';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/vercel.svg',
  '/next.svg',
];

// Dynamic routes to cache on first visit
const DYNAMIC_ROUTES = [
  '/dashboard',
  '/dashboard/new',
  '/dashboard/images',
  '/dashboard/pwa',
  '/login',
];

// API routes to cache
const API_ROUTES = [
  '/api/public/posts',
  '/api/categories',
  '/api/tags',
];

// Authentication routes to exclude from caching
const AUTH_ROUTES = [
  '/api/auth',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  STATIC_FIRST: 'static-first',
  // Network first for API calls
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate for dynamic content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Cache only for offline assets
  CACHE_ONLY: 'cache-only',
};

// Background sync queue
let backgroundSyncQueue = [];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Blog Update', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip authentication routes - let them go directly to network
  if (AUTH_ROUTES.some(route => url.pathname.startsWith(route))) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/dashboard/') || url.pathname === '/dashboard') {
    event.respondWith(handleDashboardRequest(request));
  } else if (url.pathname.startsWith('/post/')) {
    event.respondWith(handlePostRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleDefaultRequest(request));
  }
});

// API request handler - Network first with cache fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Don't cache certain API routes
  if (!shouldCacheRoute(url.pathname)) {
    return fetch(request);
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for API request, trying cache:', request.url);
  }

  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  return new Response(JSON.stringify({ error: 'Offline - API unavailable' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Dashboard request handler - Network first for authentication safety
async function handleDashboardRequest(request) {
  const url = new URL(request.url);
  
  // Don't cache dashboard routes that might contain sensitive data
  if (!shouldCacheRoute(url.pathname)) {
    return fetch(request);
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for dashboard request:', request.url);
  }

  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  return caches.match('/offline');
}

// Post request handler - Stale while revalidate
async function handlePostRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Return cached response immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response);
      }
    });
    return cachedResponse;
  }

  // Try network first for new posts
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for post request:', request.url);
  }

  return caches.match('/offline');
}

// Static asset handler - Cache first
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for static request:', request.url);
  }

  return new Response('Not found', { status: 404 });
}

// Default request handler - Network first
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for default request:', request.url);
  }

  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  return caches.match('/offline');
}

// Check if pathname is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || 
         pathname.startsWith('/icons/') || 
         pathname.startsWith('/_next/');
}

// Check if a route should be cached
function shouldCacheRoute(pathname) {
  // Don't cache authentication routes
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }
  
  // Don't cache dynamic API routes that might contain sensitive data
  if (pathname.startsWith('/api/posts/') && pathname.includes('/edit')) {
    return false;
  }
  
  return true;
}

// Background sync function
async function doBackgroundSync() {
  console.log('Performing background sync...');
  
  try {
    // Sync any pending data
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
    
    // Check for new content
    const response = await fetch('/api/public/posts?limit=1');
    if (response.ok) {
      const posts = await response.json();
      if (posts.length > 0) {
        // Show notification for new content
        self.registration.showNotification('New Blog Post', {
          body: `Check out the latest post: ${posts[0].title}`,
                  icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
          data: { url: `/post/${posts[0].id}` }
        });
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get offline data from IndexedDB
async function getOfflineData() {
  // This would be implemented with IndexedDB
  // For now, return empty array
  return [];
}

// Sync offline data to server
async function syncOfflineData(data) {
  // This would sync any offline actions (comments, etc.)
  console.log('Syncing offline data:', data);
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_DYNAMIC_IMPORT') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.add(event.data.url);
      })
    );
  }
}); 