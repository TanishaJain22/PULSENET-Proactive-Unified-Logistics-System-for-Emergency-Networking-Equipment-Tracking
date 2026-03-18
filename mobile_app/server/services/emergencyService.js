/**
 * Emergency Service — manages in-memory case store
 * Temp cases are created by paramedics after arriving at scene (linked to a dispatch)
 */
const { HOSPITALS } = require('./hospitalService');

const emergencies = {};
let latestCaseId = null;

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function getAll() { return emergencies; }
function getCase(caseId) { return emergencies[caseId] || null; }
function getLatestCaseId() { return latestCaseId; }
function setLatestCaseId(id) { latestCaseId = id; }

// Seed a case with a fixed known ID (for demo/testing)
function seedCase(fixedId, data) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  emergencies[fixedId] = {
    id: fixedId, caseId: fixedId,
    temporaryPatientId: `TMP-DEMO-0001`,
    patientName: data.patientName || 'Demo Patient',
    location: data.location || { latitude: 22.7196, longitude: 75.8577 },
    symptoms: data.symptoms || [],
    severity: data.severity || 'HIGH',
    status: 'PENDING',
    assignedHospital: HOSPITALS[0],
    assignedHospitalId: HOSPITALS[0].id,
    vitals: null,
    ambulanceLocation: null,
    timeline: [
      { event: 'EMERGENCY_CREATED',    time: timeStr, status: 'completed' },
      { event: 'AMBULANCE_DISPATCHED', time: timeStr, status: 'active' },
      { event: 'PATIENT_PICKED_UP',    time: 'Pending', status: 'pending' },
      { event: 'EN_ROUTE_TO_HOSPITAL', time: 'Pending', status: 'pending' },
      { event: 'ARRIVED_AT_HOSPITAL',  time: 'Pending', status: 'pending' },
      { event: 'HANDOFF_COMPLETE',     time: 'Pending', status: 'pending' },
    ],
    createdAt: now.toISOString(),
  };
  latestCaseId = fixedId;
  return emergencies[fixedId];
}

function createCase({ patientName, location, symptoms, severity }) {
  const caseId = generateId('CASE');
  const temporaryPatientId = generateId('TMP');
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newCase = {
    id: caseId, caseId, temporaryPatientId,
    patientName: patientName || 'Unknown Patient',
    location: location || { latitude: 22.7196, longitude: 75.8577 },
    symptoms: symptoms || [],
    severity: severity || 'NOT_ASSESSED',
    status: 'PENDING',
    assignedHospital: HOSPITALS[0],
    assignedHospitalId: HOSPITALS[0].id,
    vitals: null,
    ambulanceLocation: null,
    dispatchId: null,
    timeline: [
      { event: 'EMERGENCY_CREATED',    time: timeStr, status: 'completed' },
      { event: 'AMBULANCE_DISPATCHED', time: timeStr, status: 'active' },
      { event: 'PATIENT_PICKED_UP',    time: 'Pending', status: 'pending' },
      { event: 'EN_ROUTE_TO_HOSPITAL', time: 'Pending', status: 'pending' },
      { event: 'ARRIVED_AT_HOSPITAL',  time: 'Pending', status: 'pending' },
      { event: 'HANDOFF_COMPLETE',     time: 'Pending', status: 'pending' },
    ],
    createdAt: now.toISOString(),
  };

  emergencies[caseId] = newCase;
  latestCaseId = caseId;
  return newCase;
}

function updateStatus(caseId, status) {
  const em = emergencies[caseId];
  if (!em) return null;
  em.status = status;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const eventMap = {
    PICKED_UP:            'PATIENT_PICKED_UP',
    EN_ROUTE_TO_HOSPITAL: 'EN_ROUTE_TO_HOSPITAL',
    ARRIVED:              'ARRIVED_AT_HOSPITAL',
    HANDOFF_COMPLETE:     'HANDOFF_COMPLETE',
  };
  const eventKey = eventMap[status];
  if (eventKey) {
    let foundTarget = false;
    em.timeline = em.timeline.map(ev => {
      if (ev.event === eventKey) { foundTarget = true; return { ...ev, time: timeStr, status: 'completed' }; }
      if (ev.status === 'active') return { ...ev, status: 'completed' };
      if (foundTarget && ev.status === 'pending') { foundTarget = false; return { ...ev, status: 'active' }; }
      return ev;
    });
  }

  if (status === 'HANDOFF_COMPLETE' || status === 'ARRIVED') {
    if (latestCaseId === caseId) latestCaseId = null;
  }
  return em;
}

function updateVitals(caseId, vitals) {
  const em = emergencies[caseId];
  if (!em) return null;
  em.vitals = vitals;

  // Full NEWS2 scoring — matches frontend triageUtils.ts exactly
  let score = 0;
  const hr   = parseInt((vitals && vitals.heartRate)        || '80');
  const spo2 = parseInt((vitals && vitals.oxygenSaturation) || '98');
  const rr   = parseInt((vitals && vitals.respiratoryRate)  || '16');
  const temp = parseFloat((vitals && vitals.temperature)    || '98.6');

  // Respiratory Rate
  if (rr <= 8 || rr >= 25) score += 3;
  else if (rr >= 21 && rr <= 24) score += 2;
  else if (rr >= 9 && rr <= 11) score += 1;

  // SpO2
  if (spo2 <= 91) score += 3;
  else if (spo2 >= 92 && spo2 <= 93) score += 2;
  else if (spo2 >= 94 && spo2 <= 95) score += 1;

  // Heart Rate
  if (hr <= 40 || hr >= 131) score += 3;
  else if (hr >= 111 && hr <= 130) score += 2;
  else if (hr <= 50 || (hr >= 91 && hr <= 110)) score += 1;

  // Systolic BP
  if (vitals && vitals.bloodPressure) {
    const systolic = parseInt(vitals.bloodPressure.split('/')[0]);
    if (systolic <= 90 || systolic >= 220) score += 3;
    else if (systolic >= 91 && systolic <= 100) score += 2;
    else if (systolic >= 101 && systolic <= 110) score += 1;
  }

  // Temperature
  if (temp <= 95.0) score += 3;
  else if (temp >= 102.4) score += 2;
  else if (temp <= 96.8 || (temp >= 100.6 && temp <= 102.2)) score += 1;

  let severity = 'NORMAL';
  if (score >= 7)      severity = 'CRITICAL';
  else if (score >= 5) severity = 'HIGH';
  else if (score >= 3) severity = 'MEDIUM';

  em.severity = severity;
  return { severity, triageScore: score };
}

function updateAmbulanceLocation(caseId, latitude, longitude, speed) {
  const em = emergencies[caseId];
  if (!em) return;
  em.ambulanceLocation = { latitude, longitude, speed: speed || 0, timestamp: new Date().toISOString() };
}

function assignHospital(caseId, hospital) {
  const em = emergencies[caseId];
  if (!em) return null;
  em.assignedHospital = hospital;
  em.assignedHospitalId = hospital.id;
  return em;
}

function getTimeline(caseId) {
  const em = emergencies[caseId];
  if (em) return em.timeline;
  return [
    { event: 'EMERGENCY_CREATED',    time: '—', status: 'completed' },
    { event: 'AMBULANCE_DISPATCHED', time: '—', status: 'active' },
    { event: 'PATIENT_PICKED_UP',    time: 'Pending', status: 'pending' },
  ];
}

function getActiveCases() {
  return Object.values(emergencies).filter(
    em => em.status !== 'HANDOFF_COMPLETE' && em.status !== 'ARRIVED'
  );
}

/**
 * Paramedic creates a temporary case after arriving at scene (linked to dispatch)
 */
function createTempCase({ dispatchId, patientName, symptoms, location }) {
  const tempCaseId = `TMP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newCase = {
    id: tempCaseId, caseId: tempCaseId, temporaryPatientId: tempCaseId,
    dispatchId: dispatchId || null,
    patientName: patientName || 'Unknown Patient',
    location: location || { latitude: 22.7196, longitude: 75.8577 },
    symptoms: symptoms || [],
    severity: 'NOT_ASSESSED',
    status: 'TEMP_CASE_CREATED',
    assignedHospital: null,
    assignedHospitalId: null,
    vitals: null,
    triageScore: null,
    ambulanceLocation: null,
    timeline: [],   // dispatch timeline is the source of truth; this is the medical sub-record
    createdAt: now.toISOString(),
  };

  emergencies[tempCaseId] = newCase;
  latestCaseId = tempCaseId;
  return newCase;
}

module.exports = {
  getAll, getCase, getLatestCaseId, setLatestCaseId, seedCase,
  createCase, createTempCase, updateStatus, updateVitals,
  updateAmbulanceLocation, assignHospital,
  getTimeline, getActiveCases,
};
