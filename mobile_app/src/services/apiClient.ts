import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Resolve base URL dynamically so it works regardless of when the module loads.
// Priority: EXPO_PUBLIC_API_URL env var → platform-aware default
function getBaseURL(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  // Android emulator routes to host machine via 10.0.2.2
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:3000/api`;
}

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API] Token read error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Log response errors so we can see what's actually failing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    // Suppress expected 404s that are handled gracefully by callers
    const isExpected404 = status === 404 && (
      url.includes('/emergency/active') ||
      url.includes('/dispatch/active')
    );
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error(`[API] Cannot reach server at ${getBaseURL()}. Is "node server/index.js" running?`);
    } else if (!isExpected404) {
      console.error(`[API] ${error.config?.method?.toUpperCase()} ${url} → ${status} ${error.message}`);
    }
    return Promise.reject(error);
  }
);
