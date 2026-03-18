const express = require('express');
const router = express.Router();
const patientService = require('../services/patientService');

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}
function resolveRole(username) {
  const u = (username || '').toLowerCase();
  if (u.includes('driver'))    return 'DRIVER';
  if (u.includes('paramedic')) return 'PARAMEDIC';
  return 'PATIENT';
}

// Demo display names for known test accounts
const DEMO_NAMES = {
  patient:   { name: 'Rahul Sharma', id: '000000000000' },
  paramedic: { name: 'Dr. Priya Mehta', id: 'param-042' },
  driver:    { name: 'Amit Verma', id: 'drv-092' },
};

router.post('/login', (req, res) => {
  const { username } = req.body;
  const u = (username || '').toLowerCase();
  const role = resolveRole(u);
  const demo = DEMO_NAMES[u];
  const user = {
    id:   demo ? demo.id : generateId('usr'),
    name: demo ? demo.name : (username || 'User'),
    role,
  };
  res.json({ user, token: `mock_jwt_${role.toLowerCase()}_${Date.now()}` });
});

router.post('/patient/register', (req, res) => {
  const { name, phone, bloodGroup, medicalConditions } = req.body;
  if (!name || !phone) return res.status(400).json({ message: 'name and phone are required' });
  const user = patientService.registerPatient({ name, phone, bloodGroup, medicalConditions });
  res.status(201).json({ user, token: `mock_jwt_patient_${Date.now()}` });
});

module.exports = router;
