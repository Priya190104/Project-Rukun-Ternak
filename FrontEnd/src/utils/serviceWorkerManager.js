/**
 * Service Worker Registration & Management
 * 
 * Handles:
 * - Service Worker registration
 * - Update detection
 * - Cache management
 * - Offline detection
 * - Performance monitoring
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isOnline = navigator.onLine;
    this.listeners = {
      offline: [],
      online: [],
      updated: [],
      installed: []
    };

    this.init();
  }

  /**
   * Initialize Service Worker
   */
  async init() {
    // Check browser support
    if (!('serviceWorker' in navigator)) {
      console.log('[SW Manager] Service Worker not supported');
      return false;
    }

    try {
      // Register Service Worker
      this.registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        {
          scope: '/',
          updateViaCache: 'none' // Always check for SW updates
        }
      );

      console.log('[SW Manager] ✅ Service Worker registered:', this.registration);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Setup online/offline listeners
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });

      // Periodically check for updates (every 30 minutes)
      this.setupUpdateCheck();

      return true;
    } catch (err) {
      console.error('[SW Manager] ❌ Registration failed:', err);
      return false;
    }
  }

  /**
   * Handle Service Worker update found
   */
  handleUpdateFound() {
    const newWorker = this.registration.installing;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New Service Worker is ready
        console.log('[SW Manager] 🔄 Update available');
        
        // Notify listeners
        this.emit('updated', {
          hasUpdate: true,
          waitingWorker: newWorker
        });

        // Auto-update after 1 minute of inactivity
        this.scheduleAutoUpdate(newWorker);
      }
    });
  }

  /**
   * Schedule auto-update when user is idle
   */
  scheduleAutoUpdate(newWorker) {
    let idleTimer = null;
    let isIdle = false;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      isIdle = false;
      
      // 60 seconds of inactivity triggers update
      idleTimer = setTimeout(() => {
        isIdle = true;
        if (isIdle) {
          this.updateServiceWorker(newWorker);
        }
      }, 60000);
    };

    // Setup idle detection
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();
  }

  /**
   * Update Service Worker
   */
  updateServiceWorker(newWorker) {
    console.log('[SW Manager] ⚡ Updating Service Worker...');
    
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload page when new worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[SW Manager] ✅ Service Worker updated, reloading...');
        window.location.reload();
      }
    });
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    console.log('[SW Manager] 🌐 Online');
    this.emit('online');

    // Attempt to sync pending reports if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-reports').catch(() => {
          console.log('[SW Manager] Background sync not available');
        });
      });
    }
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    console.log('[SW Manager] ⚠️ Offline');
    this.emit('offline');
  }

  /**
   * Handle messages from Service Worker
   */
  handleMessage(data) {
    console.log('[SW Manager] Message from SW:', data);
    
    if (data.type === 'CACHE_UPDATED') {
      this.emit('cacheUpdated', data);
    }
  }

  /**
   * Setup periodic update check
   */
  setupUpdateCheck() {
    // Check for updates every 30 minutes
    setInterval(() => {
      if (this.registration) {
        this.registration.update();
      }
    }, 30 * 60 * 1000);
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    if (!this.registration) return false;

    try {
      const controller = navigator.serviceWorker.controller;
      if (controller) {
        controller.postMessage({ type: 'CLEAR_CACHE' });
      }

      // Also clear via caches API
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );

      console.log('[SW Manager] ✅ All caches cleared');
      return true;
    } catch (err) {
      console.error('[SW Manager] ❌ Cache clear failed:', err);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const cacheNames = await caches.keys();
      const stats = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = {
          count: keys.length,
          items: keys.map(k => k.url)
        };
      }

      return stats;
    } catch (err) {
      console.error('[SW Manager] ❌ Failed to get cache stats:', err);
      return {};
    }
  }

  /**
   * Unregister Service Worker (for development)
   */
  async unregister() {
    if (!this.registration) return false;

    try {
      await this.registration.unregister();
      console.log('[SW Manager] ✅ Service Worker unregistered');
      return true;
    } catch (err) {
      console.error('[SW Manager] ❌ Unregister failed:', err);
      return false;
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error('[SW Manager] Callback error:', err);
        }
      });
    }
  }

  /**
   * Get online status
   */
  getOnlineStatus() {
    return this.isOnline;
  }

  /**
   * Get registration status
   */
  getRegistrationStatus() {
    return {
      registered: !!this.registration,
      active: !!this.registration?.active,
      waiting: !!this.registration?.waiting,
      installing: !!this.registration?.installing
    };
  }
}

// Create singleton instance
const swManager = new ServiceWorkerManager();

export default swManager;

/**
 * Hook for React components
 * 
 * Usage:
 * const swStatus = useServiceWorker();
 * console.log(swStatus.isOnline);
 * console.log(swStatus.hasUpdate);
 */
export function useServiceWorkerStatus() {
  const [status, setStatus] = React.useState({
    isOnline: swManager.isOnline,
    hasUpdate: false,
    isRegistered: !!swManager.registration
  });

  React.useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    const handleUpdate = () => {
      setStatus(prev => ({ ...prev, hasUpdate: true }));
    };

    swManager.on('online', handleOnline);
    swManager.on('offline', handleOffline);
    swManager.on('updated', handleUpdate);

    return () => {
      swManager.off('online', handleOnline);
      swManager.off('offline', handleOffline);
      swManager.off('updated', handleUpdate);
    };
  }, []);

  return status;
}
