import { apiClient } from '../apiClient';
import { DispatchRequest } from '../../types';

export const dispatchService = {
  /**
   * Patient SOS — creates a dispatch request
   */
  createDispatch: async (data: {
    location: { latitude: number; longitude: number };
    patientName?: string;
    patientId?: string;
    patientIdentity: 'KNOWN' | 'UNKNOWN';
    requesterPatientId?: string;
    source?: string;
  }) => {
    const response = await apiClient.post('/dispatch/create', {
      ...data,
      source: data.source || 'PATIENT_APP',
    });
    return response.data as { dispatchId: string; priority: string; status: string; createdAt: string };
  },

  /**
   * Driver — fetch pending dispatches sorted by priority
   */
  getPendingDispatches: async (): Promise<DispatchRequest[]> => {
    try {
      const response = await apiClient.get('/dispatch/pending');
      return response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Driver — accept a dispatch request
   */
  acceptDispatch: async (dispatchId: string, driverId?: string) => {
    const response = await apiClient.post('/dispatch/accept', { dispatchId, driverId });
    return response.data;
  },

  /**
   * Update dispatch status (AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE, etc.)
   */
  updateDispatchStatus: async (dispatchId: string, status: string) => {
    const response = await apiClient.post('/dispatch/status', { dispatchId, status });
    return response.data;
  },

  /**
   * Get the current active dispatch (used by paramedic on login)
   */
  getActiveDispatch: async (): Promise<DispatchRequest | null> => {
    try {
      const response = await apiClient.get('/dispatch/active');
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Get a single dispatch
   */
  getDispatch: async (dispatchId: string): Promise<DispatchRequest | null> => {
    try {
      const response = await apiClient.get(`/dispatch/${dispatchId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Get dispatch timeline
   */
  getTimeline: async (dispatchId: string) => {
    const response = await apiClient.get(`/dispatch/${dispatchId}/timeline`);
    return response.data;
  },
};
