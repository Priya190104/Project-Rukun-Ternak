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

// Add response interceptor to handle 401 errors (expired/invalid token)
client.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - clearing auth');
      // Token expired or invalid, clear auth
      localStorage.removeItem('rukun_token');
      localStorage.removeItem('rukun_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default client;
