/**
 * Dispatch Service — manages national emergency dispatch requests
 * Sits between Patient SOS and Driver/Paramedic response
 */

const dispatches = {};
let latestDispatchId = null;

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function getAll() { return dispatches; }
function getDispatch(dispatchId) { return dispatches[dispatchId] || null; }
function getLatestDispatchId() { return latestDispatchId; }

/**
 * Build timeline based on patient identity type
 * KNOWN patient: 9 events (no TEMP_CASE_CREATED)
 * UNKNOWN patient: 10 events (includes TEMP_CASE_CREATED)
 */
function buildTimeline(patientIdentity, timeStr) {
  const base = [
    { event: 'DISPATCH_CREATED',      time: timeStr,  status: 'completed' },
    { event: 'DRIVER_ASSIGNED',        time: 'Pending', status: 'pending' },
    { event: 'AMBULANCE_EN_ROUTE',     time: 'Pending', status: 'pending' },
    { event: 'ARRIVED_AT_SCENE',       time: 'Pending', status: 'pending' },
  ];
  if (patientIdentity === 'UNKNOWN') {
    base.push({ event: 'TEMP_CASE_CREATED', time: 'Pending', status: 'pending' });
  }
  base.push(
    { event: 'VITALS_RECORDED',        time: 'Pending', status: 'pending' },
    { event: 'HOSPITAL_ASSIGNED',      time: 'Pending', status: 'pending' },
    { event: 'EN_ROUTE_TO_HOSPITAL',   time: 'Pending', status: 'pending' },
    { event: 'ARRIVED_AT_HOSPITAL',    time: 'Pending', status: 'pending' },
    { event: 'HANDOFF_COMPLETE',       time: 'Pending', status: 'pending' },
  );
  return base;
}

/**
 * Create a new dispatch request (triggered by Patient SOS or Call Center)
 */
function createDispatch({ location, source = 'PATIENT_APP', patientName, patientId, patientIdentity = 'UNKNOWN', requesterPatientId }) {
  const dispatchId = generateId('DISP');
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const dispatch = {
    dispatchId,
    location: location || { latitude: 22.7196, longitude: 75.8577 },
    source,
    priority: 'HIGH',
    status: 'WAITING_FOR_DRIVER',
    assignedDriverId: null,
    patientName: patientName || 'Unknown',
    patientId: patientId || null,
    patientIdentity,                          // 'KNOWN' | 'UNKNOWN'
    requesterPatientId: requesterPatientId || patientId || null,
    tempCaseId: null,
    timeline: buildTimeline(patientIdentity, timeStr),
    createdAt: now.toISOString(),
  };

  dispatches[dispatchId] = dispatch;
  latestDispatchId = dispatchId;
  return dispatch;
}

/**
 * Driver accepts a dispatch request
 */
function acceptDispatch(dispatchId, driverId) {
  const d = dispatches[dispatchId];
  if (!d) return null;
  if (d.status !== 'WAITING_FOR_DRIVER') return null;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  d.status = 'DRIVER_ASSIGNED';
  d.assignedDriverId = driverId;
  d.timeline = _advanceTimeline(d.timeline, 'DRIVER_ASSIGNED', timeStr);
  return d;
}

/**
 * Update dispatch status (AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE, etc.)
 */
function updateDispatchStatus(dispatchId, status) {
  const d = dispatches[dispatchId];
  if (!d) return null;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  d.status = status;

  const eventMap = {
    AMBULANCE_EN_ROUTE:   'AMBULANCE_EN_ROUTE',
    ARRIVED_AT_SCENE:     'ARRIVED_AT_SCENE',
    TEMP_CASE_CREATED:    'TEMP_CASE_CREATED',
    VITALS_RECORDED:      'VITALS_RECORDED',
    HOSPITAL_ASSIGNED:    'HOSPITAL_ASSIGNED',
    EN_ROUTE_TO_HOSPITAL: 'EN_ROUTE_TO_HOSPITAL',
    ARRIVED_AT_HOSPITAL:  'ARRIVED_AT_HOSPITAL',
    HANDOFF_COMPLETE:     'HANDOFF_COMPLETE',
  };
  const eventKey = eventMap[status];
  if (eventKey) d.timeline = _advanceTimeline(d.timeline, eventKey, timeStr);
  return d;
}

/**
 * Link a temp case to this dispatch
 */
function linkTempCase(dispatchId, tempCaseId) {
  const d = dispatches[dispatchId];
  if (!d) return null;
  d.tempCaseId = tempCaseId;
  return d;
}

/**
 * Get all pending dispatches (WAITING_FOR_DRIVER), sorted by priority then createdAt
 */
function getPendingDispatches() {
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return Object.values(dispatches)
    .filter(d => d.status === 'WAITING_FOR_DRIVER')
    .sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 9;
      const pb = priorityOrder[b.priority] ?? 9;
      if (pa !== pb) return pa - pb;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

/**
 * Get active dispatch for a driver (DRIVER_ASSIGNED or later, not complete)
 */
function getActiveDispatchForDriver(driverId) {
  return Object.values(dispatches).find(
    d => d.assignedDriverId === driverId &&
         d.status !== 'HANDOFF_COMPLETE'
  ) || null;
}

function getTimeline(dispatchId) {
  const d = dispatches[dispatchId];
  return d ? d.timeline : [];
}

// Seed a demo dispatch for testing
function seedDispatch(fixedId, data) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const identity = data.patientIdentity || 'UNKNOWN';
  dispatches[fixedId] = {
    dispatchId: fixedId,
    location: data.location || { latitude: 22.7196, longitude: 75.8577 },
    source: 'PATIENT_APP',
    priority: 'HIGH',
    status: 'WAITING_FOR_DRIVER',
    assignedDriverId: null,
    patientName: data.patientName || 'Demo Patient',
    patientId: data.patientId || null,
    patientIdentity: identity,
    requesterPatientId: data.requesterPatientId || data.patientId || null,
    tempCaseId: null,
    timeline: buildTimeline(identity, timeStr),
    createdAt: now.toISOString(),
  };
  latestDispatchId = fixedId;
  return dispatches[fixedId];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
function _advanceTimeline(timeline, eventKey, timeStr) {
  let foundTarget = false;
  return timeline.map(ev => {
    if (ev.event === eventKey) {
      foundTarget = true;
      return { ...ev, time: timeStr, status: 'completed' };
    }
    if (ev.status === 'active') return { ...ev, status: 'completed' };
    // Mark the first pending event after the completed one as active
    if (foundTarget && ev.status === 'pending') {
      foundTarget = false; // only mark the immediate next one
      return { ...ev, status: 'active' };
    }
    return ev;
  });
}

module.exports = {
  getAll, getDispatch, getLatestDispatchId,
  createDispatch, acceptDispatch, updateDispatchStatus,
  linkTempCase, getPendingDispatches, getActiveDispatchForDriver,
  getTimeline, seedDispatch,
};
