// ─── Data Model Interfaces ────────────────────────────────────────────────────

export type Severity = 'critical' | 'moderate' | 'stable'

export interface Emergency {
  id: string
  type: 'incoming' | 'dispatched'
  patientName: string
  condition: string
  eta: string
  severity: Severity
  currentLocation: string
}

export interface Transfer {
  id: string
  type: 'incoming' | 'outgoing'
  patient: string
  fromHospital: string
  toHospital: string
  reason: string
  status: 'approved' | 'in-transit' | 'completed' | 'cancelled'
  eta: string
}

export interface Resource {
  id: string
  name: string
  type: 'equipment' | 'supply' | 'staff'
  available: number
  total: number
}

export interface Specialist {
  id: string
  name: string
  count: number
  onDuty: boolean
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'M' | 'F'
  severity: Severity
  currentCondition: string
  admissionDate: string
  medicalHistory: string[]
  diagnosis: string
  doctor: string
  department: string
  bloodType: string
  contact: string
  dob: string
  status: string
}

export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  totalStaff: number
  icuAvail: number
  icuTotal: number
  ventilators: number
  status: 'Normal' | 'High Load' | 'Critical'
}

export interface AILog {
  id: string
  timestamp: string
  caseId: string
  hospital: string
  decision: string
  confidence: number
  reasons: string[]
}

export interface Summary {
  label: string
  value: number
  color: string
}
