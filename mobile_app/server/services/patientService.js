/**
 * Patient Service
 */
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}

const PATIENT_PROFILES = {
  '123456789012': {
    id: '123456789012', name: 'Rahul Sharma', bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    aadhaar: '1234 5678 9012',
  },
  '123456789123': {
    id: '123456789123', name: 'Priya Verma', bloodGroup: 'B+',
    allergies: ['Sulfa Drugs'],
    chronicConditions: ['Asthma'],
    aadhaar: '1234 5678 9123',
  },
  // Demo patient — matches login username "patient" → id 000000000000
  '000000000000': {
    id: '000000000000', name: 'Rahul Sharma', bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    aadhaar: '0000 0000 0000',
  },
};

const MEDICAL_RECORDS = {
  '123456789012': [
    { id: 'rec_01', type: 'LAB_REPORT',   title: 'Blood Sugar Fasting', date: '2026-02-15', provider: 'City Diagnostics',   result: '142 mg/dL' },
    { id: 'rec_02', type: 'PRESCRIPTION', title: 'Metformin 500mg',     date: '2026-02-16', provider: 'Dr. Mehta' },
    { id: 'rec_03', type: 'IMAGING',      title: 'Chest X-Ray',         date: '2026-01-10', provider: 'Apollo Diagnostics', result: 'No acute findings' },
  ],
  '123456789123': [
    { id: 'rec_04', type: 'PRESCRIPTION', title: 'Salbutamol Inhaler', date: '2026-01-20', provider: 'Dr. Kapoor' },
    { id: 'rec_05', type: 'LAB_REPORT',   title: 'Spirometry Test',    date: '2026-01-18', provider: 'Sunrise Diagnostics', result: 'Mild obstruction' },
  ],
  // Demo patient shares same records as Rahul Sharma
  '000000000000': [
    { id: 'rec_d1', type: 'LAB_REPORT',   title: 'Blood Sugar Fasting', date: '2026-02-15', provider: 'City Diagnostics',   result: '142 mg/dL' },
    { id: 'rec_d2', type: 'PRESCRIPTION', title: 'Metformin 500mg',     date: '2026-02-16', provider: 'Dr. Priya Mehta' },
    { id: 'rec_d3', type: 'IMAGING',      title: 'Chest X-Ray',         date: '2026-01-10', provider: 'Apollo Diagnostics', result: 'No acute findings' },
    { id: 'rec_d4', type: 'LAB_REPORT',   title: 'HbA1c Test',          date: '2026-01-05', provider: 'City Diagnostics',   result: '7.8% (Elevated)' },
  ],
};

function getProfile(patientId) {
  return PATIENT_PROFILES[patientId] || {
    id: patientId, name: 'Unknown Patient', bloodGroup: 'Unknown',
    allergies: [], chronicConditions: [], aadhaar: patientId,
  };
}

function registerPatient({ name, phone, bloodGroup, medicalConditions }) {
  const userId = generateId('usr');
  const user = { id: userId, name, role: 'PATIENT', phone, bloodGroup: bloodGroup || '', medicalConditions: medicalConditions || '' };
  PATIENT_PROFILES[userId] = { ...user, allergies: [], chronicConditions: medicalConditions ? [medicalConditions] : [] };
  return user;
}

function getRecords(patientId) {
  return MEDICAL_RECORDS[patientId] || [];
}

function addRecord(patientId, record) {
  if (!MEDICAL_RECORDS[patientId]) MEDICAL_RECORDS[patientId] = [];
  const newRecord = { id: `rec_${Date.now()}`, ...record };
  MEDICAL_RECORDS[patientId].push(newRecord);
  return newRecord;
}

module.exports = { getProfile, registerPatient, getRecords, addRecord };
