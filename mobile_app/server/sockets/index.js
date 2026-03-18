/**
 * Socket.IO event handlers
 */
const emergencyService = require('../services/emergencyService');
const { calculateSpeed } = require('../services/routingService');

// GPS simulation timers
const telemetryIntervals = {};
// Previous locations for speed calc
const prevLocations = {};

function startGpsSimulation(io, caseId) {
  if (telemetryIntervals[caseId]) return;
  const em = emergencyService.getCase(caseId);
  let lat = em && em.location ? em.location.latitude  : 22.7196;
  let lng = em && em.location ? em.location.longitude : 75.8577;
  telemetryIntervals[caseId] = setInterval(() => {
    lat += 0.0002;
    lng += 0.0002;
    emergencyService.updateAmbulanceLocation(caseId, lat, lng, 5);
    io.in(caseId).emit('AMBULANCE_LOCATION_UPDATE', {
      caseId, latitude: lat, longitude: lng, speed: 5,
      timestamp: new Date().toISOString(),
    });
  }, 3000);
}

function stopGpsSimulation(caseId) {
  if (telemetryIntervals[caseId]) {
    clearInterval(telemetryIntervals[caseId]);
    delete telemetryIntervals[caseId];
  }
}

function register(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join a case room (for ambulance tracking)
    socket.on('JOIN_CASE', ({ caseId }) => {
      socket.join(caseId);
      console.log(`[Socket] ${socket.id} joined room: ${caseId}`);
      if (emergencyService.getCase(caseId)) startGpsSimulation(io, caseId);
    });

    // Join a dispatch room (for dispatch tracking)
    // Note: dispatchId is used as the room key — drivers emit AMBULANCE_LOCATION_UPDATE
    // with caseId = dispatchId, so patients in this room receive live updates
    socket.on('JOIN_DISPATCH', ({ dispatchId }) => {
      socket.join(dispatchId);
      console.log(`[Socket] ${socket.id} joined dispatch room: ${dispatchId}`);
    });

    // Drivers join a global 'drivers' room to receive DISPATCH_CREATED broadcasts
    socket.on('JOIN_DRIVERS', () => {
      socket.join('drivers');
      console.log(`[Socket] ${socket.id} joined drivers room`);
    });

    // Real driver location — stop simulation, broadcast to room
    socket.on('AMBULANCE_LOCATION_UPDATE', ({ caseId, dispatchId, latitude, longitude }) => {
      stopGpsSimulation(caseId);
      const prev = prevLocations[caseId] || null;
      const curr = { latitude, longitude, timestamp: new Date().toISOString() };
      const speed = calculateSpeed(prev, curr);
      prevLocations[caseId] = curr;
      if (emergencyService.getCase(caseId)) {
        emergencyService.updateAmbulanceLocation(caseId, latitude, longitude, speed);
      }
      const payload = {
        caseId, latitude, longitude,
        speed: parseFloat(speed.toFixed(2)),
        timestamp: curr.timestamp,
      };
      // Broadcast to case room (legacy) and dispatch room (new flow)
      io.in(caseId).emit('AMBULANCE_LOCATION_UPDATE', payload);
      if (dispatchId && dispatchId !== caseId) {
        io.in(dispatchId).emit('AMBULANCE_LOCATION_UPDATE', { ...payload, dispatchId });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

module.exports = { register, startGpsSimulation, stopGpsSimulation };
