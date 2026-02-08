import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * useApiCache - Custom hook untuk caching API responses dengan TTL
 * Mengurangi API calls dan mempercepat loading data
 * 
 * @param {number} ttl - Time to live dalam milidetik (default: 5 menit)
 * @returns {Object} - { get, set, clear, isExpired }
 */
export const useApiCache = (ttl = 5 * 60 * 1000) => {
  const cacheRef = useRef(new Map());
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);

  const get = useCallback((key) => {
    if (!cacheRef.current.has(key)) {
      setCacheMisses(prev => prev + 1);
      return null;
    }

    const item = cacheRef.current.get(key);
    const now = Date.now();

    // Check if expired
    if (now > item.expiresAt) {
      cacheRef.current.delete(key);
      setCacheMisses(prev => prev + 1);
      return null;
    }

    setCacheHits(prev => prev + 1);
    return item.data;
  }, []);

  const set = useCallback((key, data) => {
    const expiresAt = Date.now() + ttl;
    cacheRef.current.set(key, { data, expiresAt });
  }, [ttl]);

  const clear = useCallback((key) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const isExpired = useCallback((key) => {
    if (!cacheRef.current.has(key)) return true;
    const item = cacheRef.current.get(key);
    return Date.now() > item.expiresAt;
  }, []);

  return {
    get,
    set,
    clear,
    isExpired,
    size: cacheRef.current.size,
    stats: { hits: cacheHits, misses: cacheMisses }
  };
};

/**
 * Global cache instance untuk API responses
 */
const globalApiCache = new Map();

/**
 * getFromCache - Ambil data dari global cache
 */
export const getFromCache = (key) => {
  if (!globalApiCache.has(key)) return null;
  
  const item = globalApiCache.get(key);
  const now = Date.now();
  
  if (now > item.expiresAt) {
    globalApiCache.delete(key);
    return null;
  }
  
  return item.data;
};

/**
 * setInCache - Simpan data ke global cache
 * @param {string} key - Cache key
 * @param {any} data - Data yang disimpan
 * @param {number} ttl - Time to live dalam milidetik (default: 5 menit)
 */
export const setInCache = (key, data, ttl = 5 * 60 * 1000) => {
  const expiresAt = Date.now() + ttl;
  globalApiCache.set(key, { data, expiresAt });
};

/**
 * clearCache - Hapus cache
 */
export const clearCache = (key) => {
  if (key) {
    globalApiCache.delete(key);
  } else {
    globalApiCache.clear();
  }
};

/**
 * getCacheStats - Lihat statistik cache
 */
export const getCacheStats = () => {
  let totalSize = 0;
  let expiredCount = 0;
  const now = Date.now();

  for (const [key, item] of globalApiCache.entries()) {
    if (now > item.expiresAt) {
      expiredCount++;
    } else {
      totalSize += JSON.stringify(item.data).length;
    }
  }

  return {
    size: globalApiCache.size,
    dataSize: `${(totalSize / 1024).toFixed(2)} KB`,
    expiredCount
  };
};
