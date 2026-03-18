const express = require('express');
const router = express.Router();
const hospitalService = require('../services/hospitalService');
const emergencyService = require('../services/emergencyService');

let _io = null;
function setIo(io) { _io = io; }

router.post('/search', (req, res) => {
  const { capability, severity, location } = req.body;
  res.json(hospitalService.search({ capability, severity, location }));
});

router.post('/assign', (req, res) => {
  const { caseId, hospitalId } = req.body;
  const hospital = hospitalService.findById(hospitalId);
  if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

  // For KNOWN patients, caseId may be a dispatchId — store hospital on dispatch
  if (caseId && caseId.startsWith('DISP-')) {
    const dispatchService = require('../services/dispatchService');
    const dispatch = dispatchService.getDispatch(caseId);
    if (dispatch) {
      dispatch._assignedHospital = hospital;
      dispatchService.updateDispatchStatus(caseId, 'HOSPITAL_ASSIGNED');
      if (_io) _io.emit('HOSPITAL_ASSIGNED', { caseId, hospital });
      return res.json({ success: true, hospital });
    }
    return res.status(404).json({ message: 'Dispatch not found' });
  }

  const em = emergencyService.assignHospital(caseId, hospital);
  if (!em) return res.status(404).json({ message: 'Case not found' });
  if (_io) _io.in(caseId).emit('HOSPITAL_ASSIGNED', { caseId, hospital });
  res.json({ success: true, hospital });
});

router.get('/assigned/:caseId', (req, res) => {
  const { caseId } = req.params;
  // Handle dispatch IDs (KNOWN patient flow)
  if (caseId.startsWith('DISP-')) {
    const dispatchService = require('../services/dispatchService');
    const dispatch = dispatchService.getDispatch(caseId);
    if (dispatch && dispatch._assignedHospital) return res.json(dispatch._assignedHospital);
    return res.status(404).json({ message: 'No hospital assigned yet' });
  }
  const em = emergencyService.getCase(caseId);
  if (em && em.assignedHospital) return res.json(em.assignedHospital);
  res.status(404).json({ message: 'No hospital assigned yet' });
});

// AI/ML placeholder
router.post('/recommend', (req, res) => {
  const { severity, location, capability } = req.body;
  const hospital = hospitalService.recommend({ severity, location, capability });
  res.json({ recommended: hospital, confidence: 0.92, reason: 'Nearest available with matching capability' });
});

module.exports = { router, setIo };
