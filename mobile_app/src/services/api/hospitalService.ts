import { apiClient } from '../apiClient';
import { Hospital, MedicalCapability } from '../../types';

export const hospitalService = {
  getAssignedHospital: async (caseId: string): Promise<Hospital> => {
    const response = await apiClient.get(`/hospital/assigned/${caseId}`);
    return response.data;
  },

  searchHospitals: async (filters: { capability?: MedicalCapability, severity?: string }): Promise<Hospital[]> => {
    const response = await apiClient.post('/hospital/search', filters);
    return response.data;
  },

  assignHospital: async (caseId: string, hospitalId: string) => {
    const response = await apiClient.post('/hospital/assign', { caseId, hospitalId });
    return response.data;
  }
};
