const express = require('express');
const router = express.Router();
const emergencyService = require('../services/emergencyService');

// Injected by index.js so routes can emit socket events
let _io = null;
function setIo(io) { _io = io; }

router.post('/create', (req, res) => {
  const { patientName, location, symptoms, severity } = req.body;
  const newCase = emergencyService.createCase({ patientName, location, symptoms, severity });
  if (_io) _io.emit('CASE_CREATED', { caseId: newCase.caseId, status: 'PENDING', createdAt: newCase.createdAt });
  console.log(`[Emergency] Created: ${newCase.caseId}`);
  res.status(201).json({
    id: newCase.caseId, caseId: newCase.caseId,
    temporaryPatientId: newCase.temporaryPatientId,
    status: newCase.status, severity: newCase.severity,
    assignedHospital: newCase.assignedHospital,
    createdAt: newCase.createdAt,
  });
});

// GET /api/emergency/active — returns latest non-completed case
router.get('/active', (req, res) => {
  const latestId = emergencyService.getLatestCaseId();
  if (latestId && emergencyService.getCase(latestId)) return res.json(emergencyService.getCase(latestId));
  // fallback: most recent active case
  const active = emergencyService.getActiveCases();
  if (active.length > 0) return res.json(active[active.length - 1]);
  res.status(404).json({ message: 'No active case' });
});

router.post('/vitals', (req, res) => {
  const { caseId, vitals } = req.body;
  // For KNOWN patients, caseId may be a dispatchId — look up linked temp case or use dispatch directly
  let targetId = caseId;
  if (caseId && caseId.startsWith('DISP-')) {
    const dispatchService = require('../services/dispatchService');
    const dispatch = dispatchService.getDispatch(caseId);
    if (dispatch && dispatch.tempCaseId) {
      targetId = dispatch.tempCaseId;
    } else {
      // Create an in-memory vitals record on the dispatch itself
      dispatch._vitals = vitals;
      const hr   = parseInt((vitals && vitals.heartRate)        || '80');
      const spo2 = parseInt((vitals && vitals.oxygenSaturation) || '98');
      const rr   = parseInt((vitals && vitals.respiratoryRate)  || '16');
      const temp = parseFloat((vitals && vitals.temperature)    || '98.6');
      let score = 0;
      if (rr <= 8 || rr >= 25) score += 3; else if (rr >= 21 && rr <= 24) score += 2; else if (rr >= 9 && rr <= 11) score += 1;
      if (spo2 <= 91) score += 3; else if (spo2 >= 92 && spo2 <= 93) score += 2; else if (spo2 >= 94 && spo2 <= 95) score += 1;
      if (hr <= 40 || hr >= 131) score += 3; else if (hr >= 111 && hr <= 130) score += 2; else if (hr <= 50 || (hr >= 91 && hr <= 110)) score += 1;
      if (vitals && vitals.bloodPressure) {
        const sys = parseInt(vitals.bloodPressure.split('/')[0]);
        if (sys <= 90 || sys >= 220) score += 3; else if (sys >= 91 && sys <= 100) score += 2; else if (sys >= 101 && sys <= 110) score += 1;
      }
      if (temp <= 95.0) score += 3; else if (temp >= 102.4) score += 2; else if (temp <= 96.8 || (temp >= 100.6 && temp <= 102.2)) score += 1;
      let severity = 'NORMAL';
      if (score >= 7) severity = 'CRITICAL'; else if (score >= 5) severity = 'HIGH'; else if (score >= 3) severity = 'MEDIUM';
      dispatch._severity = severity;
      dispatchService.updateDispatchStatus(caseId, 'VITALS_RECORDED');
      return res.json({ success: true, severity, triageScore: score });
    }
  }
  const result = emergencyService.updateVitals(targetId, vitals);
  if (!result) return res.status(404).json({ message: 'Case not found' });
  res.json({ success: true, ...result });
});

router.post('/status', (req, res) => {
  const { caseId, status } = req.body;
  const em = emergencyService.updateStatus(caseId, status);
  if (!em) return res.status(404).json({ message: 'Case not found' });

  const messages = {
    PICKED_UP:            'Patient picked up by ambulance',
    EN_ROUTE_TO_HOSPITAL: 'En route to hospital',
    ARRIVED:              'Arrived at hospital',
    HANDOFF_COMPLETE:     'Patient handed off to hospital staff',
  };
  const msg = messages[status] || `Status: ${status}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (_io) {
    _io.in(caseId).emit('DISPATCH_STATE_UPDATE', { caseId, state: status });
    _io.in(caseId).emit('STATUS_UPDATE', { caseId, status, message: msg, timestamp });
  }
  res.json({ success: true });
});

router.post('/arrival', (req, res) => {
  const { caseId } = req.body;
  const em = emergencyService.updateStatus(caseId, 'ARRIVED');
  if (!em) return res.status(404).json({ message: 'Case not found' });
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (_io) {
    _io.in(caseId).emit('DISPATCH_STATE_UPDATE', { caseId, state: 'ARRIVED_AT_HOSPITAL' });
    _io.in(caseId).emit('STATUS_UPDATE', { caseId, status: 'ARRIVED', message: 'Ambulance has arrived at the hospital.', timestamp });
  }
  res.json({ success: true });
});

// GET /api/emergency/timeline/:caseId  (also supports /:caseId/timeline for compatibility)
router.get('/timeline/:caseId', (req, res) => {
  res.json(emergencyService.getTimeline(req.params.caseId));
});

router.get('/:caseId/timeline', (req, res) => {
  res.json(emergencyService.getTimeline(req.params.caseId));
});

// POST /api/emergency/create-temp — paramedic creates temp case after arriving at scene
router.post('/create-temp', (req, res) => {
  const { dispatchId, patientName, symptoms, location } = req.body;
  const tempCase = emergencyService.createTempCase({ dispatchId, patientName, symptoms, location });

  // Advance dispatch timeline
  if (dispatchId) {
    try {
      const dispatchService = require('../services/dispatchService');
      dispatchService.updateDispatchStatus(dispatchId, 'TEMP_CASE_CREATED');
      dispatchService.linkTempCase(dispatchId, tempCase.tempCaseId || tempCase.caseId);
    } catch (e) { /* dispatch may not exist in legacy flows */ }
  }

  if (_io) {
    _io.emit('DISPATCH_STATE_UPDATE', { dispatchId, state: 'TEMP_CASE_CREATED', tempCaseId: tempCase.caseId });
  }

  console.log(`[Emergency] Temp case created: ${tempCase.caseId} (dispatch: ${dispatchId})`);
  res.status(201).json({
    tempCaseId: tempCase.caseId,
    dispatchId: tempCase.dispatchId,
    temporaryPatientId: tempCase.temporaryPatientId,
    status: tempCase.status,
    createdAt: tempCase.createdAt,
  });
});

module.exports = { router, setIo };