import { useState, useEffect } from 'react';
import client from '../api/client';
import { getFromCache, setInCache, clearCache } from './useApiCache';

/**
 * useCachedData - Custom hook untuk fetch data dengan automatic caching
 * 
 * @param {string} url - API endpoint URL
 * @param {Array} dependencies - Dependencies untuk re-fetch (default: [url])
 * @param {Object} options - { ttl: ms, skipCache: boolean, forceRefresh: boolean }
 * @returns {Object} - { data, loading, error, refetch, clearCache }
 * 
 * @example
 * const { data, loading, error, refetch } = useCachedData('/api/kelompok');
 */
export const useCachedData = (url, dependencies = [url], options = {}) => {
  const { ttl = 5 * 60 * 1000, skipCache = false, forceRefresh = false } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first (unless forcing refresh or skipping cache)
      if (!force && !skipCache && !forceRefresh) {
        const cachedData = getFromCache(url);
        if (cachedData) {
          console.log(`[useCachedData] Using cached data for ${url}`);
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await client.get(url);
      setData(response.data);
      
      // Cache the response if not skipping
      if (!skipCache) {
        setInCache(url, response.data, ttl);
      }
    } catch (err) {
      console.error(`[useCachedData] Error fetching ${url}:`, err);
      setError(err.response?.data?.message || err.message);
      
      // If network error, try to use cache as fallback
      if (!err.response) {
        const cachedData = getFromCache(url);
        if (cachedData) {
          console.log(`[useCachedData] Using stale cache as fallback for ${url}`);
          setData(cachedData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: () => refetch(true), // Manual refetch always bypasses cache
    clearCache: () => clearCache(url)
  };
};

/**
 * usePaginatedCachedData - Custom hook untuk fetch data dengan pagination dan caching
 * 
 * @param {string} baseUrl - Base API endpoint
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Object} - { data, loading, error, page, setPage, totalPages, refetch }
 */
export const usePaginatedCachedData = (baseUrl, pageSize = 10) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const url = `${baseUrl}?page=${page}&limit=${pageSize}`;
  const { data, loading, error, refetch } = useCachedData(url, [url]);

  useEffect(() => {
    if (data?.pagination) {
      setTotalPages(Math.ceil(data.pagination.total / pageSize));
    }
  }, [data, pageSize]);

  return {
    data: data?.data || [],
    loading,
    error,
    page,
    setPage,
    totalPages,
    refetch,
    pagination: data?.pagination
  };
};

/**
 * useInvalidateCache - Hook untuk invalidate (clear) cache entries
 * Berguna setelah mutation (POST, PUT, DELETE)
 * 
 * @returns {Function} - invalidate(patterns) - pattern bisa string atau array of strings
 * 
 * @example
 * const invalidate = useInvalidateCache();
 * // Setelah create/update/delete
 * invalidate('/api/kelompok'); // Clear specific URL
 * invalidate(['/api/kelompok', '/api/dashboard']); // Clear multiple
 * invalidate('kelompok'); // Clear all URLs containing "kelompok"
 */
export const useInvalidateCache = () => {
  return (patterns) => {
    if (typeof patterns === 'string') {
      patterns = [patterns];
    }
    
    patterns.forEach(pattern => {
      clearCache(pattern);
      console.log(`[useInvalidateCache] Cleared cache for pattern: ${pattern}`);
    });
  };
};
