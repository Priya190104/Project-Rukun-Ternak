/**
 * useServiceWorker - React Hook untuk Service Worker integration
 * 
 * Fitur:
 * - Online/offline detection
 * - Update notifications
 * - Cache management
 * - Performance monitoring
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to monitor Service Worker status
 * @returns {Object} Service Worker status dan functions
 * 
 * @example
 * const { isOnline, hasUpdate, isRegistered, clearCache, getCacheStats } = useServiceWorker();
 */
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [cacheStats, setCacheStats] = useState({});

  useEffect(() => {
    // Check if Service Worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('[useServiceWorker] Service Worker not supported');
      return;
    }

    // Get registration status
    navigator.serviceWorker.getRegistration().then((reg) => {
      setIsRegistered(!!reg);
    });

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[useServiceWorker] Online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[useServiceWorker] Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for Service Worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[useServiceWorker] Service Worker updated');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Get current cache statistics
   */
  const getCacheStats = useCallback(async () => {
    try {
      const cacheNames = await caches.keys();
      const stats = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
      }

      setCacheStats(stats);
      return stats;
    } catch (err) {
      console.error('[useServiceWorker] Failed to get cache stats:', err);
      return {};
    }
  }, []);

  /**
   * Clear all caches
   */
  const clearCache = useCallback(async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log('[useServiceWorker] Cache cleared');
      setCacheStats({});
      return true;
    } catch (err) {
      console.error('[useServiceWorker] Cache clear failed:', err);
      return false;
    }
  }, []);

  /**
   * Clear specific cache
   */
  const clearSpecificCache = useCallback(async (cacheName) => {
    try {
      await caches.delete(cacheName);
      console.log(`[useServiceWorker] Cache cleared: ${cacheName}`);
      return true;
    } catch (err) {
      console.error('[useServiceWorker] Failed to clear cache:', err);
      return false;
    }
  }, []);

  /**
   * Update Service Worker
   */
  const updateServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('[useServiceWorker] Update check completed');
      }
    } catch (err) {
      console.error('[useServiceWorker] Update check failed:', err);
    }
  }, []);

  /**
   * Unregister Service Worker
   */
  const unregister = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        setIsRegistered(false);
        console.log('[useServiceWorker] Unregistered');
        return true;
      }
    } catch (err) {
      console.error('[useServiceWorker] Unregister failed:', err);
      return false;
    }
  }, []);

  return {
    isOnline,
    hasUpdate,
    isRegistered,
    cacheStats,
    getCacheStats,
    clearCache,
    clearSpecificCache,
    updateServiceWorker,
    unregister
  };
}

/**
 * useOfflineDetection - Simple hook untuk offline detection
 * 
 * @example
 * const isOffline = useOfflineDetection();
 * if (isOffline) return <OfflineMessage />;
 */
export function useOfflineDetection() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

/**
 * useCacheStatus - Monitor cache size and items
 * 
 * @returns {Object} Cache statistics dan management functions
 * 
 * @example
 * const { total, caches, refreshStats, clear } = useCacheStatus();
 */
export function useCacheStatus() {
  const [caches, setCaches] = useState({});
  const [total, setTotal] = useState(0);

  const refreshStats = useCallback(async () => {
    try {
      const cacheNames = await window.caches.keys();
      const stats = {};
      let totalItems = 0;

      for (const cacheName of cacheNames) {
        const cache = await window.caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = {
          count: keys.length,
          items: keys.map((k) => ({
            url: k.url,
            method: k.method || 'GET'
          }))
        };
        totalItems += keys.length;
      }

      setCaches(stats);
      setTotal(totalItems);
    } catch (err) {
      console.error('[useCacheStatus] Failed to refresh stats:', err);
    }
  }, []);

  const clear = useCallback(async (cacheName) => {
    try {
      if (cacheName) {
        await window.caches.delete(cacheName);
      } else {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
      }
      refreshStats();
      return true;
    } catch (err) {
      console.error('[useCacheStatus] Clear failed:', err);
      return false;
    }
  }, [refreshStats]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    caches,
    total,
    refreshStats,
    clear
  };
}
