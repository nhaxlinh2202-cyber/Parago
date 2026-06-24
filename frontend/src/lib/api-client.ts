import axios from 'axios';
import { useAuthStore } from '../store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If error is 500 or higher, dispatch global error event
    if (error.response?.status >= 500) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', { detail: { status: error.response.status } }));
      }
    }

    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = useAuthStore.getState().refreshToken;
      
      // If we don't have a refresh token, force logout
      if (!refreshToken) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      try {
        // Try to get a new token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update store with new tokens
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        
        // Update header for the original request and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, log out completely
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
