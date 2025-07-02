const CACHE_NAME = 'blog-cache-v2';
const DYNAMIC_CACHE_NAME = 'blog-dynamic-v2';
const STATIC_CACHE_NAME = 'blog-static-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
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
    })
  );
  self.clients.claim();
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
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

// Dashboard request handler - Cache first for better performance
async function handleDashboardRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(request, response);
        });
      }
    });
    return cachedResponse;
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

// Helper function to check if URL is a static asset
function isStaticAsset(pathname) {
  return pathname.startsWith('/icons/') ||
         pathname.startsWith('/uploads/') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.jpeg') ||
         pathname.endsWith('.gif') ||
         pathname.endsWith('.webp') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending offline actions
    console.log('Performing background sync...');
    
    // Example: Sync offline comments, drafts, etc.
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for offline data management
async function getOfflineData() {
  // Implementation for getting offline data
  return [];
}

async function syncOfflineData(data) {
  // Implementation for syncing offline data
  console.log('Syncing offline data:', data);
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New blog post available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Post',
        icon: '/icons/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Blog Update', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

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