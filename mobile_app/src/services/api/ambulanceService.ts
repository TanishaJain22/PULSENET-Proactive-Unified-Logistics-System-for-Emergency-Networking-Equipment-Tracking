import { apiClient } from '../apiClient';

export const ambulanceService = {
  sendLocationUpdate: async (caseId: string, latitude: number, longitude: number) => {
    const response = await apiClient.post('/ambulance/location', { caseId, latitude, longitude });
    return response.data;
  },

  confirmArrival: async (caseId: string) => {
    const response = await apiClient.post('/emergency/arrival', { caseId });
    return response.data;
  },
};
