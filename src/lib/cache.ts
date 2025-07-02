// Simple in-memory cache (in production, use Redis)
class Cache {
  private store = new Map<string, { value: any; expiry: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.store.set(key, { value, expiry });
  }

  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    const item = this.store.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, item] of this.store.entries()) {
      if (now > item.expiry) {
        expiredEntries++;
        this.store.delete(key);
      } else {
        validEntries++;
      }
    }

    return {
      total: validEntries + expiredEntries,
      valid: validEntries,
      expired: expiredEntries,
    };
  }
}

// Global cache instance
export const cache = new Cache();

// Cache keys generator
export const cacheKeys = {
  posts: (page: number = 1, limit: number = 10) => `posts:${page}:${limit}`,
  post: (id: number) => `post:${id}`,
  categories: () => 'categories',
  tags: () => 'tags',
  comments: (postId: number) => `comments:${postId}`,
  user: (id: string) => `user:${id}`,
  search: (query: string) => `search:${query}`,
  analytics: () => 'analytics',
};

// Cache middleware for API routes
export function withCache<T>(
  key: string,
  ttl: number = 5 * 60 * 1000,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then((data) => {
    cache.set(key, data, ttl);
    return data;
  });
}

// Cache invalidation helpers
export function invalidateCache(pattern: string): void {
  const keys = Array.from(cache['store'].keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}

export function invalidatePostCache(postId?: number): void {
  if (postId) {
    cache.delete(cacheKeys.post(postId));
    cache.delete(cacheKeys.comments(postId));
  }
  invalidateCache('posts');
  invalidateCache('analytics');
}

export function invalidateCategoryCache(): void {
  cache.delete(cacheKeys.categories());
  invalidateCache('posts');
}

export function invalidateTagCache(): void {
  cache.delete(cacheKeys.tags());
  invalidateCache('posts');
}

// Cache decorator for functions
export function cached<T>(
  keyGenerator: (...args: any[]) => string,
  ttl: number = 5 * 60 * 1000
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator(...args);
      const cached = cache.get(key);
      
      if (cached) {
        return cached;
      }

      const result = await method.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };
  };
}

// Cache-aware fetch wrapper
export async function cachedFetch<T>(
  url: string,
  key: string,
  ttl: number = 5 * 60 * 1000,
  options?: RequestInit
): Promise<T> {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  cache.set(key, data, ttl);
  return data;
}

// Cache warming utility
export async function warmCache(): Promise<void> {
  const warmingTasks = [
    // Warm up common data
    () => fetch('/api/public/posts').then(res => res.json()),
    () => fetch('/api/categories').then(res => res.json()),
    () => fetch('/api/tags').then(res => res.json()),
  ];

  await Promise.allSettled(warmingTasks.map(task => task()));
}

// Cache monitoring
export function getCacheStats() {
  return cache.getStats();
}

// Export cache instance for direct access
export default cache; 