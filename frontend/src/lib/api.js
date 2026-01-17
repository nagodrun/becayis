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
  
  // Use admin token for admin endpoints, user token for user endpoints
  const isAdminEndpoint = config.url?.includes('/admin');
  const token = isAdminEndpoint ? (adminToken || userToken) : (adminToken || userToken);
  
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
    
    // Don't redirect if we're on admin pages and the error is from a non-admin endpoint
    const isAdminEndpoint = error.config?.url?.includes('/admin');
    const isAdminLoggedIn = localStorage.getItem('is_admin') === 'true';
    const currentPath = window.location.pathname;
    const isOnAdminPage = currentPath.startsWith('/admin');
    
    if (error.response?.status === 401 && !isLoginEndpoint) {
      // If we're on admin page and admin is logged in, only redirect if it's an admin endpoint that fails
      if (isOnAdminPage && isAdminLoggedIn) {
        if (isAdminEndpoint) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('is_admin');
          window.location.href = '/admin/login';
        }
        // Don't redirect for non-admin endpoint failures when on admin page
      } else if (isAdminLoggedIn && isAdminEndpoint) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('is_admin');
        window.location.href = '/admin/login';
      } else if (!isAdminLoggedIn) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;