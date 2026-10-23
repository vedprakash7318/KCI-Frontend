import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
});

// Attach access token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kci_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency queue to hold requests while a token refresh is in flight
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with silent automatic refresh token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry if no response or if it's already an auth-lifecycle endpoint
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh-token') ||
      url.includes('/auth/logout');

    if (error.response.status === 401 && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = localStorage.getItem('kci_refresh_token');

      // If no refresh token available, clear session and redirect
      if (!refreshToken) {
        localStorage.removeItem('kci_token');
        localStorage.removeItem('kci_refresh_token');
        localStorage.removeItem('kci_user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // If another request already started the refresh, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use bare axios to avoid interceptor recursion
        const { data } = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });

        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('kci_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('kci_refresh_token', newRefreshToken);
          }
          if (data.user) {
            localStorage.setItem('kci_user', JSON.stringify(data.user));
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh response missing token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('kci_token');
        localStorage.removeItem('kci_refresh_token');
        localStorage.removeItem('kci_user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
