import axios from 'axios';
import { getFromCache, setInCache } from '../hooks/useApiCache';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include JWT token from localStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rukun_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url} (no token)`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and implement caching
client.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} from ${response.config.url}`);
    
    // Cache GET requests for 5 minutes
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}`;
      setInCache(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes TTL
      console.log(`[Cache] Stored response for ${cacheKey}`);
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - token expired or invalid');
      
      // Check if user had a token (meaning it expired)
      const hadToken = !!localStorage.getItem('rukun_token');
      
      // Clear auth tokens
      localStorage.removeItem('rukun_token');
      localStorage.removeItem('rukun_user');
      delete client.defaults.headers.common['Authorization'];
      
      // Only redirect to login if:
      // 1. User had a token (meaning they were previously logged in)
      // 2. AND not already on login page
      if (hadToken && !window.location.pathname.includes('/login')) {
        console.log('[API] Token expired, redirecting to login from', window.location.pathname);
        window.location.href = '/login?expired=true';
      }
      // If no token was present, 401 is expected for public endpoints - don't redirect
      else if (!hadToken) {
        console.log('[API] 401 on public route (no token present) - allowing page to handle gracefully');
      }
    } else if (error.response?.status === 403) {
      console.error('[API] 403 Forbidden - access denied');
      // Don't auto-redirect on 403, let the page handle it
    } else {
      console.error(`[API] Error ${error.response?.status}:`, error.message);
    }
    return Promise.reject(error);
  }
);

export default client;
