import { apiClient } from '../apiClient';
import { EmergencyCase } from '../../types';

export const emergencyService = {
  createEmergency: async (data: any): Promise<EmergencyCase> => {
    const response = await apiClient.post('/emergency/create', data);
    const raw = response.data;
    // Normalize: backend returns { id, status, createdAt, temporaryPatientId, ... }
    return {
      caseId: raw.caseId || raw.id,
      temporaryPatientId: raw.temporaryPatientId || raw.id,
      severity: raw.severity || 'NOT_ASSESSED',
      status: raw.status,
      patientName: data.patientName,
      location: data.location,
      createdAt: raw.createdAt,
      assignedHospital: raw.assignedHospital,
      assignedHospitalId: raw.assignedHospital?.id,
    };
  },

  getActiveCase: async (): Promise<EmergencyCase | null> => {
    try {
      const response = await apiClient.get('/emergency/active');
      const raw = response.data;
      return {
        caseId: raw.caseId || raw.id,
        temporaryPatientId: raw.temporaryPatientId || raw.id,
        severity: raw.severity || 'NOT_ASSESSED',
        status: raw.status,
        patientName: raw.patientName,
        location: raw.location,
        createdAt: raw.createdAt,
        assignedHospital: raw.assignedHospital,
        assignedHospitalId: raw.assignedHospital?.id,
      };
    } catch (e: any) {
      // 404 is expected when no active case exists — not a real error
      if (e?.response?.status !== 404) {
        console.warn('[emergencyService] getActiveCase error:', e?.message);
      }
      return null;
    }
  },

  submitVitals: async (caseId: string, vitals: any) => {
    const response = await apiClient.post('/emergency/vitals', { caseId, vitals });
    return response.data;
  },

  updateEmergencyStatus: async (caseId: string, status: string) => {
    const response = await apiClient.post('/emergency/status', { caseId, status });
    return response.data;
  },

  getTimeline: async (caseId: string) => {
    const response = await apiClient.get(`/emergency/${caseId}/timeline`);
    return response.data;
  },

  /**
   * Paramedic creates a temporary case after arriving at scene (linked to dispatch)
   */
  createTempCase: async (data: {
    dispatchId?: string;
    patientName?: string;
    symptoms?: string[];
    location?: { latitude: number; longitude: number };
  }) => {
    const response = await apiClient.post('/emergency/create-temp', data);
    return response.data as { tempCaseId: string; dispatchId: string; status: string; createdAt: string };
  },
};
