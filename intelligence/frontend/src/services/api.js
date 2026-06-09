import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: '/api', // Proxied by Vite to port 8000 in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vidyamitra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch auth errors (401) and wipe token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect loops on login pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('vidyamitra_token');
        localStorage.removeItem('vidyamitra_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
