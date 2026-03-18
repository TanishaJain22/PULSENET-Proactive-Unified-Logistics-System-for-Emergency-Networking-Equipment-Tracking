// src/types/user.ts
export type UserRole = 'DRIVER' | 'PARAMEDIC' | 'PATIENT' | null;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  token?: string;
  phone?: string;
  aadhaar?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  emergencyContacts?: string;
}

// src/types/emergency.ts
export type EMERGENCY_SEVERITY = 'NORMAL' | 'LOW' | 'MEDIUM' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'NOT_ASSESSED';

export interface EmergencyCase {
  caseId: string;
  temporaryPatientId: string;
  severity: EMERGENCY_SEVERITY;
  status: string;
  assignedHospitalId?: string;
  assignedHospital?: Hospital;
  patientName?: string;
  symptoms?: string;
  location?: { latitude: number; longitude: number };
  createdAt?: string;
  dispatchId?: string;
}

// src/types/dispatch.ts
export type DispatchPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DispatchStatus =
  | 'WAITING_FOR_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'AMBULANCE_EN_ROUTE'
  | 'ARRIVED_AT_SCENE'
  | 'TEMP_CASE_CREATED'
  | 'VITALS_RECORDED'
  | 'HOSPITAL_ASSIGNED'
  | 'EN_ROUTE_TO_HOSPITAL'
  | 'ARRIVED_AT_HOSPITAL'
  | 'HANDOFF_COMPLETE';

export interface DispatchRequest {
  dispatchId: string;
  location: { latitude: number; longitude: number };
  source: 'PATIENT_APP' | 'CALL_CENTER' | 'SYSTEM';
  priority: DispatchPriority;
  status: DispatchStatus;
  assignedDriverId: string | null;
  patientName: string;
  patientId?: string | null;
  patientIdentity: 'KNOWN' | 'UNKNOWN';
  requesterPatientId?: string | null;
  tempCaseId?: string | null;
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface TimelineEvent {
  event: string;
  time: string;
  status: 'completed' | 'active' | 'pending';
}

// src/types/hospital.ts
export type HospitalType = 'GOVERNMENT' | 'PRIVATE' | 'SPECIALTY';
export type MedicalCapability = 'LEVEL_1_TRAUMA' | 'CARDIAC_CENTER' | 'BURN_UNIT' | 'NEONATAL_ICU' | 'GENERAL_EMERGENCY';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
  type: HospitalType;
  capabilities: MedicalCapability[];
  currentOccupancy: number; // 0-100
  emergencyPreparednessStatus: string;
  availableBeds?: number;
}
