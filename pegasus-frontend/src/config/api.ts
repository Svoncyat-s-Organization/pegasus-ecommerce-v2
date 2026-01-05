import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Determine context based on current location (where the user is)
  // NOT based on the API endpoint being called
  const isBackofficeContext = window.location.pathname.startsWith('/admin');

  if (isBackofficeContext) {
    // Backoffice token (Zustand persist)
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } else {
    // Storefront token (direct localStorage)
    const storefrontToken = localStorage.getItem('storefront-token');
    if (storefrontToken) {
      config.headers.Authorization = `Bearer ${storefrontToken}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isBackoffice = window.location.pathname.startsWith('/admin');
      
      if (isBackoffice && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/admin/login';
      } else if (!isBackoffice && window.location.pathname !== '/login') {
        localStorage.removeItem('storefront-token');
        localStorage.removeItem('storefront-auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
