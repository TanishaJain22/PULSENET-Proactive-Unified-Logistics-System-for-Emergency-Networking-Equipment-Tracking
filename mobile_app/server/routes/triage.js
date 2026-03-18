const express = require('express');
const router = express.Router();

// AI/ML placeholder endpoints — will call real models in production
router.post('/analyze', (req, res) => {
  const { symptoms, vitals } = req.body;
  // Mock triage logic
  const hr = parseInt((vitals && vitals.heartRate) || '80');
  let severity = 'NORMAL';
  if (hr >= 131 || hr <= 40) severity = 'CRITICAL';
  else if (hr >= 111)        severity = 'HIGH';
  res.json({ severity, triageScore: 5, confidence: 0.87, model: 'mock-triage-v1' });
});

module.exports = router;
