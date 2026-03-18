/**
 * HealthcareApp — Mock Backend
 * Modular architecture: routes/ services/ sockets/
 * Run: node index.js  (from inside the server/ folder)
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 3000;

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const authRouter      = require('./routes/auth');
const emergencyModule = require('./routes/emergency');
const ambulanceModule = require('./routes/ambulance');
const hospitalModule  = require('./routes/hospital');
const patientRouter   = require('./routes/patient');
const routingRouter   = require('./routes/routing');
const triageRouter    = require('./routes/triage');
const dispatchModule  = require('./routes/dispatch');
const emergencyService = require('./services/emergencyService');
const dispatchService  = require('./services/dispatchService');

emergencyModule.setIo(io);
ambulanceModule.setIo(io);
hospitalModule.setIo(io);
dispatchModule.setIo(io);

app.use('/api/auth',      authRouter);
app.use('/api/emergency', emergencyModule.router);
app.use('/api/ambulance', ambulanceModule.router);
app.use('/api/hospital',  hospitalModule.router);
app.use('/api/patient',   patientRouter);
app.use('/api/routes',    routingRouter);
app.use('/api/triage',    triageRouter);
app.use('/api/dispatch',  dispatchModule.router);

app.get('/api/emergency/:caseId/timeline', (req, res) => {
  res.json(emergencyService.getTimeline(req.params.caseId));
});
app.get('/api/timeline/:caseId', (req, res) => {
  res.json(emergencyService.getTimeline(req.params.caseId));
});

const socketHandler = require('./sockets/index');
socketHandler.register(io);

emergencyService.seedCase('CASE-DEMO-0001', {
  patientName: 'Demo Patient (Rahul Sharma)',
  location: { latitude: 22.7196, longitude: 75.8577 },
  symptoms: ['Chest pain', 'Shortness of breath'],
  severity: 'HIGH',
});

dispatchService.seedDispatch('DISP-DEMO-0001', {
  patientName: 'Demo Patient (Rahul Sharma)',
  patientId: '000000000000',
  requesterPatientId: '000000000000',
  patientIdentity: 'KNOWN',
  location: { latitude: 22.7196, longitude: 75.8577 },
});

dispatchService.seedDispatch('DISP-DEMO-0002', {
  patientName: 'Unknown Patient',
  patientId: null,
  requesterPatientId: null,
  patientIdentity: 'UNKNOWN',
  location: { latitude: 22.7250, longitude: 75.8650 },
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n==========================================');
  console.log(`  MOCK HEALTHCARE BACKEND  :  PORT ${PORT}`);
  console.log(`  Pre-seeded case  : CASE-DEMO-0001`);
  console.log(`  Pre-seeded disp  : DISP-DEMO-0001 (KNOWN)`);
  console.log(`  Pre-seeded disp  : DISP-DEMO-0002 (UNKNOWN)`);
  console.log('==========================================');
  console.log('  Demo credentials (any password):');
  console.log('    patient    -> PATIENT role');
  console.log('    paramedic  -> PARAMEDIC role');
  console.log('    driver     -> DRIVER role');
  console.log('==========================================\n');
});