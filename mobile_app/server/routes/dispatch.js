/**
 * Dispatch Routes
 * POST /api/dispatch/create   — Patient SOS creates a dispatch request
 * GET  /api/dispatch/pending  — Driver fetches pending dispatches
 * POST /api/dispatch/accept   — Driver accepts a dispatch
 * POST /api/dispatch/status   — Update dispatch status (en-route, arrived, etc.)
 * GET  /api/dispatch/:id      — Get single dispatch
 * GET  /api/dispatch/:id/timeline
 */
const express = require('express');
const router = express.Router();
const dispatchService = require('../services/dispatchService');

let _io = null;
function setIo(io) { _io = io; }

// Patient SOS → create dispatch request
router.post('/create', (req, res) => {
  const { location, source, patientName, patientId, patientIdentity, requesterPatientId } = req.body;
  const dispatch = dispatchService.createDispatch({ location, source, patientName, patientId, patientIdentity, requesterPatientId });

  if (_io) {
    // Broadcast to all drivers
    _io.emit('DISPATCH_CREATED', {
      dispatchId: dispatch.dispatchId,
      location: dispatch.location,
      priority: dispatch.priority,
      patientName: dispatch.patientName,
      patientIdentity: dispatch.patientIdentity,
      status: dispatch.status,
      createdAt: dispatch.createdAt,
    });
  }

  console.log(`[Dispatch] Created: ${dispatch.dispatchId}`);
  res.status(201).json({
    dispatchId: dispatch.dispatchId,
    priority: dispatch.priority,
    status: dispatch.status,
    createdAt: dispatch.createdAt,
  });
});

// Driver fetches pending dispatches sorted by priority + distance
router.get('/pending', (req, res) => {
  res.json(dispatchService.getPendingDispatches());
});

// Driver accepts a dispatch
router.post('/accept', (req, res) => {
  const { dispatchId, driverId } = req.body;
  const dispatch = dispatchService.acceptDispatch(dispatchId, driverId || 'driver-001');
  if (!dispatch) return res.status(404).json({ message: 'Dispatch not found or already assigned' });

  if (_io) {
    _io.in(dispatchId).emit('DISPATCH_STATE_UPDATE', {
      dispatchId,
      state: 'DRIVER_ASSIGNED',
      assignedDriverId: dispatch.assignedDriverId,
    });
    // Also notify patient room (dispatchId doubles as room key)
    _io.emit('DISPATCH_STATE_UPDATE', {
      dispatchId,
      state: 'DRIVER_ASSIGNED',
    });
  }

  console.log(`[Dispatch] Accepted: ${dispatchId} by ${dispatch.assignedDriverId}`);
  res.json({ success: true, dispatch });
});

// Update dispatch status (AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE, etc.)
router.post('/status', (req, res) => {
  const { dispatchId, status } = req.body;
  const dispatch = dispatchService.updateDispatchStatus(dispatchId, status);
  if (!dispatch) return res.status(404).json({ message: 'Dispatch not found' });

  if (_io) {
    _io.emit('DISPATCH_STATE_UPDATE', { dispatchId, state: status });
    _io.in(dispatchId).emit('STATUS_UPDATE', {
      dispatchId,
      status,
      message: _statusMessage(status),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  res.json({ success: true });
});

// Get active (non-completed) dispatch — used by paramedic on login
// Returns the most recently created active dispatch
router.get('/active', (req, res) => {
  const all = Object.values(dispatchService.getAll());
  const active = all
    .filter(d => d.status !== 'HANDOFF_COMPLETE')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (active.length > 0) return res.json(active[0]);
  res.status(404).json({ message: 'No active dispatch' });
});

// Get single dispatch
router.get('/:dispatchId', (req, res) => {
  const d = dispatchService.getDispatch(req.params.dispatchId);
  if (!d) return res.status(404).json({ message: 'Not found' });
  res.json(d);
});

// Get dispatch timeline
router.get('/:dispatchId/timeline', (req, res) => {
  res.json(dispatchService.getTimeline(req.params.dispatchId));
});

function _statusMessage(status) {
  const map = {
    DRIVER_ASSIGNED:      'A driver has been assigned to your request.',
    AMBULANCE_EN_ROUTE:   'Ambulance is on the way to your location.',
    ARRIVED_AT_SCENE:     'Ambulance has arrived at your location.',
    TEMP_CASE_CREATED:    'Paramedic has created your medical case.',
    VITALS_RECORDED:      'Vitals have been recorded and assessed.',
    HOSPITAL_ASSIGNED:    'A hospital has been assigned for your care.',
    EN_ROUTE_TO_HOSPITAL: 'Ambulance is en route to the hospital.',
    ARRIVED_AT_HOSPITAL:  'Ambulance has arrived at the hospital.',
    HANDOFF_COMPLETE:     'Patient has been handed off to hospital staff.',
  };
  return map[status] || `Status updated: ${status}`;
}

module.exports = { router, setIo };
