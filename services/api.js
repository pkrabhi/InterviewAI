import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://interview-ai-backend-production-ddf1.up.railway.app',
  timeout: 45000, // 45s — Groq AI can be slow on cold start
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout when backend rejects the token (expired or secret mismatch)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Clear stale token from storage
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user_data');
      // Also reset the Zustand auth store so the NavigationContainer switches to AuthStack
      // Lazy import avoids circular dependency
      const { default: useAuthStore } = await import('../store/useAuthStore');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
