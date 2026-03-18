const express = require('express');
const router = express.Router();
const patientService = require('../services/patientService');

router.get('/profile/:patientId', (req, res) => {
  res.json(patientService.getProfile(req.params.patientId));
});

router.get('/records/:patientId', (req, res) => {
  res.json(patientService.getRecords(req.params.patientId));
});

router.post('/records', (req, res) => {
  const { patientId, record } = req.body;
  if (!patientId || !record) return res.status(400).json({ message: 'patientId and record required' });
  const newRecord = patientService.addRecord(patientId, record);
  res.status(201).json(newRecord);
});

router.post('/contacts', (_req, res) => {
  res.json({ success: true });
});

// Active case for patient (alias)
router.get('/active-case', (req, res) => {
  // Delegate to emergency service
  const emergencyService = require('../services/emergencyService');
  const latestId = emergencyService.getLatestCaseId();
  if (latestId && emergencyService.getCase(latestId)) return res.json(emergencyService.getCase(latestId));
  res.status(404).json({ message: 'No active case' });
});

module.exports = router;
