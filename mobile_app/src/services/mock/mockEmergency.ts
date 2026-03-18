import { EmergencyCase } from '../../types';

export const mockCreateEmergency = async (data: any): Promise<EmergencyCase> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        caseId: `CASE-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        temporaryPatientId: `TMP-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        severity: 'NOT_ASSESSED',
        status: 'EN_ROUTE',
        patientName: data.patientName || 'Unknown Patient',
        symptoms: data.symptoms || '',
        createdAt: new Date().toISOString(),
      });
    }, 1500);
  });
};
