// Simple in-memory cache (in production, use Redis)
class Cache<T = unknown> {
  private store = new Map<string, { value: T; expiry: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.store.set(key, { value, expiry });
  }

  get(key: string): T | null {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve(cached as any);
  }
  return fetcher().then((data) => {
    cache.set(key, data as T, ttl);
    return data as T;
  });
}

// Cache invalidation helpers
export function invalidateCache(pattern: string): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keys = Array.from((cache as any)['store'].keys());
  keys.forEach(key => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((key as any).includes(pattern)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cache.delete(key as any);
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function cached<T>(
  keyGenerator: (...args: unknown[]) => string,
  ttl: number = 5 * 60 * 1000
) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cached as any;
  }
  const response = await fetch(url, options);
  const data = await response.json();
  cache.set(key, data as T, ttl);
  return data as T;
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