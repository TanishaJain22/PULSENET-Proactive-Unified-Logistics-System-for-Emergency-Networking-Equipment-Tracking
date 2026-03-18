const express = require('express');
const router = express.Router();
const emergencyService = require('../services/emergencyService');
const { calculateSpeed } = require('../services/routingService');

let _io = null;
function setIo(io) { _io = io; }

// Track previous location per case for speed calculation
const prevLocations = {};

router.post('/location', (req, res) => {
  const { caseId, latitude, longitude } = req.body;
  const prev = prevLocations[caseId] || null;
  const curr = { latitude, longitude, timestamp: new Date().toISOString() };
  const speed = calculateSpeed(prev, curr); // m/s
  prevLocations[caseId] = curr;

  emergencyService.updateAmbulanceLocation(caseId, latitude, longitude, speed);

  if (_io) {
    _io.in(caseId).emit('AMBULANCE_LOCATION_UPDATE', {
      caseId, latitude, longitude,
      speed: parseFloat(speed.toFixed(2)),
      timestamp: curr.timestamp,
    });
  }
  res.json({ success: true, speed: parseFloat(speed.toFixed(2)) });
});

module.exports = { router, setIo };
