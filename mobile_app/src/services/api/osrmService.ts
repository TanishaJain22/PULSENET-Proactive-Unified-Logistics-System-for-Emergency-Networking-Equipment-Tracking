import axios from 'axios';
import { ENV } from '../../config/env';

// In production, this always points to your backend routing proxy
const OSRM_BASE_URL = `${ENV.API_BASE_URL}/routes/driving`;

export interface RouteGeometry {
  coordinates: [number, number][]; // [latitude, longitude]
  distance: number;
  duration: number;
}

export const osrmService = {
  /**
   * Fetches the road-network route between two points via the backend proxy.
   */
  fetchRoute: async (startLat: number, startLng: number, endLat: number, endLng: number): Promise<RouteGeometry> => {
    try {
      // The backend proxy normalized the OSRM request
      const url = `${OSRM_BASE_URL}/${startLng},${startLat};${endLng},${endLat}`;
      
      const response = await axios.get(url);
      const data = response.data;

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      
      // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

      return {
        coordinates,
        distance: route.distance, // meters
        duration: route.duration, // seconds
      };
    } catch (error) {
      console.error('[OSRM Service] Error fetching route:', error);
      return osrmService.fallbackMockRoute(startLat, startLng, endLat, endLng);
    }
  },

  /**
   * Provides a straight-line fallback if the OSRM API is unavailable.
   */
  fallbackMockRoute: (startLat: number, startLng: number, endLat: number, endLng: number): RouteGeometry => {
    return {
      coordinates: [
        [startLat, startLng],
        [endLat, endLng],
      ],
      distance: 0,
      duration: 0,
    };
  }
};
