'use client';

import { useEffect, useState, useCallback } from 'react';

interface CacheInfo {
  name: string;
  size: number;
  entries: number;
  lastUpdated: Date;
}

interface CacheManagerProps {
  onCacheUpdate?: (caches: CacheInfo[]) => void;
}

export default function CacheManager({ onCacheUpdate }: CacheManagerProps) {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get cache information
  const getCacheInfo = useCallback(async (): Promise<CacheInfo[]> => {
    if (!('caches' in window)) return [];

    try {
      const cacheNames = await window.caches.keys();
      const cacheInfo: CacheInfo[] = [];

      for (const name of cacheNames) {
        const cache = await window.caches.open(name);
        const keys = await cache.keys();
        let totalSize = 0;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }

        cacheInfo.push({
          name,
          size: totalSize,
          entries: keys.length,
          lastUpdated: new Date(),
        });
      }

      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return [];
    }
  }, []);

  // Update cache information
  const updateCacheInfo = useCallback(async () => {
    const cacheInfo = await getCacheInfo();
    setCaches(cacheInfo);
    onCacheUpdate?.(cacheInfo);
  }, [getCacheInfo, onCacheUpdate]);

  // Clear specific cache
  const clearCache = useCallback(async (cacheName: string) => {
    if (!('caches' in window)) return;

    try {
      setIsUpdating(true);
      await window.caches.delete(cacheName);
      await updateCacheInfo();
      
      // Notify service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_CLEARED',
          cacheName,
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [updateCacheInfo]);

  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    if (!('caches' in window)) return;

    try {
      setIsUpdating(true);
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map(name => window.caches.delete(name)));
      await updateCacheInfo();
      
      // Notify service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ALL_CACHES_CLEARED',
        });
      }
    } catch (error) {
      console.error('Error clearing all caches:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [updateCacheInfo]);

  // Preload important resources
  const preloadResources = useCallback(async () => {
    if (!isOnline) return;

    try {
      setIsUpdating(true);
      const resources = [
        '/dashboard',
        '/dashboard/new',
        '/api/public/posts',
        '/api/categories',
        '/api/tags',
      ];

      const cache = await window.caches.open('blog-dynamic-v2');
      await Promise.all(
        resources.map(async (resource) => {
          try {
            const response = await fetch(resource);
            if (response.ok) {
              await cache.put(resource, response);
            }
          } catch (error) {
            console.warn(`Failed to preload ${resource}:`, error);
          }
        })
      );

      await updateCacheInfo();
    } catch (error) {
      console.error('Error preloading resources:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [isOnline, updateCacheInfo]);

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Update cache info on mount and when online status changes
  useEffect(() => {
    updateCacheInfo();
  }, [updateCacheInfo, isOnline]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cache Manager
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Cache Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {caches.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Caches</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatBytes(caches.reduce((sum, cache) => sum + cache.size, 0))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {caches.reduce((sum, cache) => sum + cache.entries, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Entries</div>
          </div>
        </div>

        {/* Cache List */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Cache Details</h4>
          {caches.map((cache) => (
            <div
              key={cache.name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {cache.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {cache.entries} entries • {formatBytes(cache.size)}
                </div>
              </div>
              <button
                onClick={() => clearCache(cache.name)}
                disabled={isUpdating}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={preloadResources}
            disabled={isUpdating || !isOnline}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Preload Resources'}
          </button>
          <button
            onClick={clearAllCaches}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Clearing...' : 'Clear All Caches'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for cache management
export function useCacheManager() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);

  const updateCacheInfo = useCallback(async () => {
    if (!('caches' in window)) return [];

    try {
      const cacheNames = await caches.keys();
      const cacheInfo: CacheInfo[] = [];

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        let totalSize = 0;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }

        cacheInfo.push({
          name,
          size: totalSize,
          entries: keys.length,
          lastUpdated: new Date(),
        });
      }

      setCacheInfo(cacheInfo);
      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return [];
    }
  }, []);

  return { cacheInfo, updateCacheInfo };
} 