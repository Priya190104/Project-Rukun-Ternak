import React, { useState, useEffect } from 'react';
import { AlertCircle, WifiOff, Wifi } from 'lucide-react';
import { useOfflineDetection } from '../hooks/useServiceWorker';

/**
 * OfflineIndicator - Shows when user is offline
 * 
 * Usage:
 * <OfflineIndicator />
 */
export default function OfflineIndicator() {
  const isOffline = useOfflineDetection();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShowBanner(true);
      // Auto-hide after 5 seconds when coming back online
      const timer = setTimeout(() => {
        if (!isOffline) {
          setShowBanner(false);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!showBanner) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isOffline 
        ? 'bg-danger-50 border-b-2 border-danger' 
        : 'bg-success-50 border-b-2 border-success'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOffline ? (
            <>
              <WifiOff className="w-5 h-5 text-danger animate-pulse" />
              <div>
                <p className="font-semibold text-danger">You are offline</p>
                <p className="text-xs text-danger opacity-75">Some features may be limited. Cached data is available.</p>
              </div>
            </>
          ) : (
            <>
              <Wifi className="w-5 h-5 text-success animate-bounce" />
              <p className="font-semibold text-success">Back online!</p>
            </>
          )}
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * OfflineWarning - Show warning when critical action attempted offline
 * 
 * Usage:
 * <OfflineWarning show={isOffline && isSubmitting} />
 */
export function OfflineWarning({ show = false, action = 'action' }) {
  if (!show) return null;

  return (
    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
      <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-danger">Cannot perform {action}</p>
        <p className="text-sm text-danger opacity-80">
          You are currently offline. Please reconnect to complete this action.
        </p>
      </div>
    </div>
  );
}

/**
 * CacheStatusPanel - Shows cache statistics and management
 * 
 * Usage:
 * <CacheStatusPanel />
 */
export function CacheStatusPanel() {
  const [cacheStats, setCacheStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      setIsLoading(true);
      const cacheNames = await caches.keys();
      const stats = {};
      let totalItems = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = {
          count: keys.length,
          items: keys.slice(0, 5) // Show first 5 items
        };
        totalItems += keys.length;
      }

      setCacheStats(stats);
      setTotalSize(totalItems);
    } catch (err) {
      console.error('Failed to load cache stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllCaches = async () => {
    if (confirm('Clear all cached data? This will remove offline support until data is re-cached.')) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setCacheStats({});
        setTotalSize(0);
        alert('Cache cleared successfully');
      } catch (err) {
        alert('Failed to clear cache: ' + err.message);
      }
    }
  };

  const clearSpecificCache = async (cacheName) => {
    if (confirm(`Clear ${cacheName}?`)) {
      try {
        await caches.delete(cacheName);
        await loadCacheStats();
        alert(`${cacheName} cleared successfully`);
      } catch (err) {
        alert('Failed to clear cache: ' + err.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Offline Data Cache</h3>
        <button
          onClick={loadCacheStats}
          className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-6">
          <div className="inline-block animate-spin text-primary-600">⟳</div>
          <p className="text-gray-500 text-sm mt-2">Loading...</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-primary-700 font-semibold mb-1">Total Cached Items</p>
                <p className="text-2xl font-bold text-primary-900">{totalSize}</p>
              </div>
              <div>
                <p className="text-xs text-primary-700 font-semibold mb-1">Cache Stores</p>
                <p className="text-2xl font-bold text-primary-900">{Object.keys(cacheStats).length}</p>
              </div>
            </div>
          </div>

          {/* Cache Details */}
          <div className="space-y-4 mb-6">
            {Object.keys(cacheStats).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No cached data yet</p>
            ) : (
              Object.entries(cacheStats).map(([cacheName, details]) => (
                <div key={cacheName} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{cacheName}</p>
                      <p className="text-xs text-gray-600">{details.count} items cached</p>
                    </div>
                    <button
                      onClick={() => clearSpecificCache(cacheName)}
                      className="text-danger-600 hover:text-danger-700 text-xs font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                  
                  {details.items && details.items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {details.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-600 truncate" title={item.url}>
                          • {item.url.split('/').pop() || item.url}
                        </div>
                      ))}
                      {details.count > 5 && (
                        <div className="text-xs text-gray-500 italic">
                          +{details.count - 5} more items...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <button
            onClick={clearAllCaches}
            disabled={totalSize === 0}
            className="w-full py-2 px-4 bg-danger-50 hover:bg-danger-100 disabled:bg-gray-100 text-danger disabled:text-gray-500 font-semibold rounded-lg transition"
          >
            Clear All Cached Data
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Cached data helps the app work offline and load faster.
          </p>
        </>
      )}
    </div>
  );
}
