// src/config/env.ts
import { Platform } from 'react-native';

// Resolve the correct host based on platform:
// - Android emulator: 10.0.2.2 (loopback alias to host machine)
// - Physical device: set EXPO_PUBLIC_API_URL in .env to your machine's LAN IP
// - iOS simulator / web: localhost
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEFAULT_PORT = '3000';

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_HOST}:${DEFAULT_PORT}/api`,
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || `http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '',
};
