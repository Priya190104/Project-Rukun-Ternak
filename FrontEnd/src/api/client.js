import axios from 'axios';

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

// Add response interceptor to handle errors
client.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - token expired or invalid');
      // Token expired or invalid
      localStorage.removeItem('rukun_token');
      localStorage.removeItem('rukun_user');
      delete client.defaults.headers.common['Authorization'];
      // Redirect to login ONLY if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('[API] Redirecting to login from', window.location.pathname);
        window.location.href = '/login?expired=true';
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
