// src/config/features.ts
// Feature flags to toggle functionality during development.
// Set ENABLE_REAL_MAPS to true when:
//   1. Google Maps API key is configured
//   2. Using a development build (expo-dev-client), NOT Expo Go
//   3. Backend location APIs are available

export const FEATURES = {
  ENABLE_REAL_MAPS: false,
};
