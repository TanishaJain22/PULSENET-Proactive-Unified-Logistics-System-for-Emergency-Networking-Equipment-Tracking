import type {
  Emergency,
  Transfer,
  Resource,
  Specialist,
  Patient,
  Hospital,
  AILog,
} from '@/types'

// ─── Emergencies ─────────────────────────────────────────────────────────────
export const emergencies: Emergency[] = [
  { 
    id: 'E-001', 
    type: 'incoming',
    patientName: 'Rajesh K.', 
    condition: 'Cardiac Arrest', 
    eta: '3m',  
    severity: 'critical',
    currentLocation: 'Sector 4, Main Road'
  },
  { 
    id: 'E-002', 
    type: 'incoming',
    patientName: 'Jane S.', 
    condition: 'Trauma',         
    eta: '7m', 
    severity: 'moderate',
    currentLocation: 'Bridge Overpass'
  },
  { 
    id: 'E-003', 
    type: 'dispatched',
    patientName: 'Mike T.', 
    condition: 'Fracture',       
    eta: '12m', 
    severity: 'stable',
    currentLocation: 'Community Center'
  },
]

// ─── Transfers ────────────────────────────────────────────────────────────────
export const transfers: Transfer[] = [
  { 
    id: '#T-204', 
    type: 'incoming',
    patient: 'Rahul Sharma', 
    fromHospital: 'Choithram Hospital',
    toHospital: 'MY Hospital',
    reason: 'Advanced Cardiac Care',
    status: 'in-transit',
    eta: '15m'
  },
  { 
    id: '#T-198', 
    type: 'outgoing',
    patient: 'Sara K.',  
    fromHospital: 'City General',
    toHospital: 'Metro Rehab',
    reason: 'Post-Op Recovery',
    status: 'approved',
    eta: '---'
  },
]

// ─── Resources ────────────────────────────────────────────────────────────────
export const resources: Resource[] = [
  { id: 'r1', name: 'ICU Beds',        type: 'equipment', available: 12, total: 20 },
  { id: 'r2', name: 'Ventilators',     type: 'equipment', available: 8,  total: 15 },
  { id: 'r3', name: 'General Beds',    type: 'equipment', available: 45, total: 80 },
  { id: 'r4', name: 'Nurse Staff',     type: 'staff',     available: 34, total: 40 },
  { id: 'r5', name: 'Type O- Blood',   type: 'supply',    available: 4,  total: 25 },
]

// ─── Specialists ──────────────────────────────────────────────────────────────
export const specialists: Specialist[] = [
  { id: 's1', name: 'Cardiologist',   count: 2, onDuty: true  },
  { id: 's2', name: 'Neurologist',    count: 1, onDuty: true  },
  { id: 's3', name: 'Trauma Surgeon', count: 0, onDuty: false },
  { id: 's4', name: 'Orthopedist',    count: 1, onDuty: true  },
]

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patients: Patient[] = [
  {
    id: 'PT-00123', name: 'Rahul Sharma',    age: 56, gender: 'M', severity: 'critical',
    currentCondition: 'Acute Myocardial Infarction',
    admissionDate: '10 Mar 2026',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    diagnosis: 'Acute MI',      doctor: 'Dr. Ahmed', department: 'Cardiology',
    bloodType: 'O+', contact: '+1-555-0123', dob: '15 Jan 1970',
    status: 'Under Treatment',
  },
  {
    id: 'PT-00119', name: 'Maria Lopez', age: 34, gender: 'F', severity: 'critical',
    currentCondition: 'Traumatic Brain Injury',
    admissionDate: '09 Mar 2026',
    medicalHistory: ['N/A'],
    diagnosis: 'TBI',            doctor: 'Dr. Patel', department: 'Neurology',
    bloodType: 'A-', contact: '+1-555-0124', dob: '02 Jun 1991',
    status: 'Under Treatment',
  },
  {
    id: 'PT-00115', name: 'Ahmed Khan',  age: 72, gender: 'M', severity: 'stable',
    currentCondition: 'Bacterial Pneumonia',
    admissionDate: '08 Mar 2026',
    medicalHistory: ['Asthma'],
    diagnosis: 'Pneumonia',      doctor: 'Dr. Roy', department: 'Pulmonology',
    bloodType: 'B+', contact: '+1-555-0125', dob: '20 Apr 1953',
    status: 'Stable',
  },
]

// ─── Hospitals (Admin) ────────────────────────────────────────────────────────
export const hospitals: Hospital[] = [
  { 
    id: 'H-01', 
    name: 'City General Hospital', 
    address: '123 Medical Dr, Mumbai',
    city: 'Mumbai',  
    totalStaff: 1240,
    icuAvail: 12, 
    icuTotal: 20, 
    ventilators: 8,  
    status: 'Normal'    
  },
  { 
    id: 'H-02', 
    name: 'Metro Hospital',         
    address: '45 Health Pkwy, Delhi',
    city: 'Delhi',   
    totalStaff: 980,
    icuAvail: 3,  
    icuTotal: 18, 
    ventilators: 4,  
    status: 'High Load' 
  },
  { 
    id: 'H-03', 
    name: 'Central Medical',        
    address: '78 Care Ave, Chennai',
    city: 'Chennai', 
    totalStaff: 650,
    icuAvail: 6,  
    icuTotal: 14, 
    ventilators: 6,  
    status: 'Normal'    
  },
]

export const summaries = [
  { label: 'Red', value: 300, color: '#ef4444' },
  { label: 'Amber', value: 50, color: '#10b981' },
  { label: 'Green', value: 100, color: '#22c55e' },
]
