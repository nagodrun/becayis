import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Check for admin token first, then regular token
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('token');
  const token = adminToken || userToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect for login endpoints - let the component handle the error
    const isLoginEndpoint = error.config?.url?.includes('/login') || 
                           error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/admin/login');
    
    if (error.response?.status === 401 && !isLoginEndpoint) {
      const isAdmin = localStorage.getItem('is_admin');
      if (isAdmin) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('is_admin');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;