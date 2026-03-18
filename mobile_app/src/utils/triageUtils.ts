/**
 * Triage Utility
 * Implements a medical scoring system based on NEWS2 (National Early Warning Score) principles.
 */

export type SeverityLevel = 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Vitals {
  heartRate?: string;
  oxygenSaturation?: string;
  bloodPressure?: string; // Expecting format "120/80"
  temperature?: string;
  respiratoryRate?: string;
}

export interface TriageResult {
  score: number;
  severity: SeverityLevel;
  recommendation: string;
}

export const calculateTriageScore = (vitals: Vitals): TriageResult => {
  let score = 0;
  const hr = parseInt(vitals.heartRate || '0');
  const spo2 = parseInt(vitals.oxygenSaturation || '100');
  const rr = parseInt(vitals.respiratoryRate || '16');
  const temp = parseFloat(vitals.temperature || '98.6');
  
  // 1. Respiratory Rate
  if (rr <= 8 || rr >= 25) score += 3;
  else if (rr >= 21 && rr <= 24) score += 2;
  else if (rr >= 9 && rr <= 11) score += 1;

  // 2. SpO2
  if (spo2 <= 91) score += 3;
  else if (spo2 >= 92 && spo2 <= 93) score += 2;
  else if (spo2 >= 94 && spo2 <= 95) score += 1;

  // 3. Heart Rate
  if (hr <= 40 || hr >= 131) score += 3;
  else if (hr >= 111 && hr <= 130) score += 2;
  else if (hr <= 50 || (hr >= 91 && hr <= 110)) score += 1;

  // 4. Systolic BP (Simplified)
  if (vitals.bloodPressure) {
    const systolic = parseInt(vitals.bloodPressure.split('/')[0]);
    if (systolic <= 90 || systolic >= 220) score += 3;
    else if (systolic >= 91 && systolic <= 100) score += 2;
    else if (systolic >= 101 && systolic <= 110) score += 1;
  }

  // 5. Temperature
  if (temp <= 95.0) score += 3;
  else if (temp >= 102.4) score += 2;
  else if (temp <= 96.8 || (temp >= 100.6 && temp <= 102.2)) score += 1;

  // Determination of Severity
  let severity: SeverityLevel = 'NORMAL';
  let recommendation = 'Patient is stable. Routine monitoring advised.';

  if (score >= 7) {
    severity = 'CRITICAL';
    recommendation = 'IMMEDIATE ACTION REQUIRED. Urgent transport to Level-1 Trauma Center.';
  } else if (score >= 5) {
    severity = 'HIGH';
    recommendation = 'Urgent medical attention needed. Monitor vitals every 15 minutes.';
  } else if (score >= 3) {
    severity = 'MEDIUM';
    recommendation = 'Medical review suggested. Increase monitoring frequency.';
  }

  return { score, severity, recommendation };
};
