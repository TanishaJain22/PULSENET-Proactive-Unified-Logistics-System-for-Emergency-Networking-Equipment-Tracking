import { apiClient } from '../apiClient';
import { offlineStorage } from '../../utils/offlineStorage';

export const patientService = {
  getPatientProfile: async (patientId: string) => {
    // 1. Check local cache first
    const cached = await offlineStorage.get<any>(`${offlineStorage.keys.CACHED_RECORDS}_${patientId}`);
    if (cached) return cached;

    // 2. Real Backend Call
    try {
      const response = await apiClient.get(`/patient/profile/${patientId}`);
      const profile = response.data;
      
      if (profile) {
        // Cache the result for offline access
        await offlineStorage.save(`${offlineStorage.keys.CACHED_RECORDS}_${patientId}`, profile);
        return profile;
      }
      throw new Error('Profile not found');
    } catch (e) {
      console.error('Failed to fetch patient profile:', e);
      throw e;
    }
  },

  updateEmergencyContacts: async (contacts: any[]) => {
    const response = await apiClient.post('/patient/contacts', { contacts });
    return response.data;
  },

  getMedicalRecords: async (patientId: string) => {
    try {
      const response = await apiClient.get(`/patient/records/${patientId}`);
      return response.data || [];
    } catch (e) {
      console.error('Failed to fetch medical records:', e);
      return [];
    }
  },

  addMedicalRecord: async (patientId: string, record: any) => {
    const response = await apiClient.post('/patient/records', { patientId, record });
    return response.data;
  },
};
