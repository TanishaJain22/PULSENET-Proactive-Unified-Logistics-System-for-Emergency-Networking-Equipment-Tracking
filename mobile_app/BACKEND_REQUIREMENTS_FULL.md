# Backend Requirements — Healthcare Emergency Dispatch App
**Document Version:** 2.0 (Full)
**Prepared for:** Backend Developer
**Frontend:** React Native (Expo) — already built and production-ready
**Author:** Frontend Team

---

## TABLE OF CONTENTS

1. Project Overview
2. System Architecture
3. Tech Stack Requirements
4. Environment & Server Setup
5. Database — Full SQL Schema
6. Authentication System
7. Dispatch System (Core)
8. Emergency Cases
9. Patient Records
10. Hospital System
11. Ambulance Location
12. Routing (OSRM Proxy)
13. Triage Engine
14. Socket.IO — Real-Time Events
15. Complete API Endpoint Reference
16. Request/Response Contracts (every endpoint)
17. Error Handling
18. CORS & Security
19. Critical Rules (Do Not Break)
20. Future AI Integration Points

---

## 1. PROJECT OVERVIEW

This is a real-time emergency ambulance coordination platform with three user roles:

| Role | What they do |
|------|-------------|
| PATIENT | Presses SOS, tracks ambulance live on map |
| DRIVER | Receives dispatch requests, navigates to patient then hospital |
| PARAMEDIC | Arrives at scene, assesses patient, records vitals, assigns hospital |

The frontend is complete. It talks to the backend via REST API + Socket.IO.
You must implement the backend to match this document exactly.
Do NOT change field names, response shapes, or socket event names.

---

## 2. SYSTEM ARCHITECTURE

```
[Patient App]  ──POST /dispatch/create──►  [Backend Server]
                                                │
[Driver App]   ──GET  /dispatch/pending──►      │  ◄── PostgreSQL DB
                ──POST /dispatch/accept──►      │
                ──Socket: AMBULANCE_LOCATION──► │  ◄── Socket.IO
                                                │
[Paramedic App]──GET  /dispatch/active──►       │
                ──POST /emergency/vitals──►      │
                ──POST /hospital/assign──►       │
```

**Flow summary:**
1. Patient presses SOS → `POST /dispatch/create` → dispatch created
2. Driver sees it on `GET /dispatch/pending` → accepts → `POST /dispatch/accept`
3. Driver navigates, sends GPS every 4s via socket
4. Patient sees live ambulance on map via socket
5. Driver arrives → `POST /dispatch/status` (ARRIVED_AT_SCENE)
6. Paramedic logs in → `GET /dispatch/active` → sees patient info
7. KNOWN patient: paramedic fetches records → records vitals → assigns hospital
8. UNKNOWN patient: paramedic creates temp case → records vitals → assigns hospital
9. Driver navigates to hospital → confirms arrival → HANDOFF_COMPLETE

---

## 3. TECH STACK REQUIREMENTS

| Component | Requirement |
|-----------|-------------|
| Runtime | Node.js 18+ (Express.js recommended) |
| Database | PostgreSQL 14+ |
| Real-time | Socket.IO 4.x (MUST be Socket.IO — frontend uses socket.io-client) |
| Auth | JWT (jsonwebtoken) |
| Password | bcrypt |
| ORM | Prisma or Sequelize (optional but recommended) |
| Port | 3000 (default, configurable via PORT env var) |

---

## 4. ENVIRONMENT & SERVER SETUP

### .env file required:
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### Server must:
- Listen on `0.0.0.0` (not just localhost) so mobile devices on same network can connect
- Support CORS from all origins (development)
- Handle both HTTP REST and Socket.IO on the same port
- Log every incoming request with timestamp, method, and URL

### Base URL structure:
```
http://<server-ip>:3000/api/<route>
```

---

## 5. DATABASE — FULL SQL SCHEMA

### 5.1 Create Database
```sql
CREATE DATABASE healthcare_db;
\c healthcare_db;
```

### 5.2 Enums
```sql
CREATE TYPE user_role AS ENUM ('PATIENT', 'PARAMEDIC', 'DRIVER');

CREATE TYPE dispatch_status AS ENUM (
  'WAITING_FOR_DRIVER',
  'DRIVER_ASSIGNED',
  'AMBULANCE_EN_ROUTE',
  'ARRIVED_AT_SCENE',
  'TEMP_CASE_CREATED',
  'VITALS_RECORDED',
  'HOSPITAL_ASSIGNED',
  'EN_ROUTE_TO_HOSPITAL',
  'ARRIVED_AT_HOSPITAL',
  'HANDOFF_COMPLETE'
);

CREATE TYPE dispatch_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE dispatch_source AS ENUM ('PATIENT_APP', 'CALL_CENTER', 'SYSTEM');

CREATE TYPE patient_identity AS ENUM ('KNOWN', 'UNKNOWN');

CREATE TYPE case_severity AS ENUM ('NOT_ASSESSED', 'NORMAL', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE record_type AS ENUM ('LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'VACCINATION', 'OTHER');

CREATE TYPE hospital_type AS ENUM ('GOVERNMENT', 'PRIVATE', 'SPECIALTY');

CREATE TYPE hospital_capability AS ENUM (
  'LEVEL_1_TRAUMA',
  'CARDIAC_CENTER',
  'BURN_UNIT',
  'GENERAL_EMERGENCY',
  'PEDIATRIC',
  'NEUROLOGY'
);
```

### 5.3 Users Table
```sql
CREATE TABLE users (
  id              VARCHAR(50)  PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(20)  UNIQUE,
  email           VARCHAR(255) UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role    NOT NULL DEFAULT 'PATIENT',
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role  ON users(role);
```

### 5.4 Patient Profiles Table
```sql
CREATE TABLE patient_profiles (
  patient_id          VARCHAR(50)  PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  blood_group         VARCHAR(10),
  aadhaar_number      VARCHAR(20),  -- store encrypted
  date_of_birth       DATE,
  gender              VARCHAR(10),
  address             TEXT,
  emergency_contact   VARCHAR(255),
  emergency_phone     VARCHAR(20),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 5.5 Patient Allergies Table
```sql
CREATE TABLE patient_allergies (
  id          SERIAL       PRIMARY KEY,
  patient_id  VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  allergy     VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allergies_patient ON patient_allergies(patient_id);
```

### 5.6 Patient Chronic Conditions Table
```sql
CREATE TABLE patient_chronic_conditions (
  id          SERIAL       PRIMARY KEY,
  patient_id  VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  condition   VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conditions_patient ON patient_chronic_conditions(patient_id);
```

### 5.7 Medical Records Table
```sql
CREATE TABLE medical_records (
  id          VARCHAR(50)  PRIMARY KEY,
  patient_id  VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        record_type  NOT NULL,
  title       VARCHAR(255) NOT NULL,
  date        DATE         NOT NULL,
  provider    VARCHAR(255),
  result      TEXT,
  file_url    TEXT,         -- for future file uploads
  notes       TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_records_patient    ON medical_records(patient_id);
CREATE INDEX idx_records_patient_dt ON medical_records(patient_id, date DESC);
```

### 5.8 Hospitals Table
```sql
CREATE TABLE hospitals (
  id                            VARCHAR(50)   PRIMARY KEY,
  name                          VARCHAR(255)  NOT NULL,
  address                       TEXT          NOT NULL,
  latitude                      DECIMAL(10,7) NOT NULL,
  longitude                     DECIMAL(10,7) NOT NULL,
  type                          hospital_type NOT NULL,
  current_occupancy             INTEGER       NOT NULL DEFAULT 0,  -- percentage 0-100
  available_beds                INTEGER       NOT NULL DEFAULT 0,
  emergency_preparedness_status VARCHAR(255),
  phone                         VARCHAR(20),
  is_active                     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at                    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hospitals_location ON hospitals(latitude, longitude);
```

### 5.9 Hospital Capabilities Table
```sql
CREATE TABLE hospital_capabilities (
  id            SERIAL             PRIMARY KEY,
  hospital_id   VARCHAR(50)        NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  capability    hospital_capability NOT NULL,
  UNIQUE(hospital_id, capability)
);

CREATE INDEX idx_hosp_cap_hospital ON hospital_capabilities(hospital_id);
```

### 5.10 Dispatches Table
```sql
CREATE TABLE dispatches (
  dispatch_id           VARCHAR(50)       PRIMARY KEY,
  patient_id            VARCHAR(50)       REFERENCES users(id),
  patient_name          VARCHAR(255)      NOT NULL,
  patient_identity      patient_identity  NOT NULL DEFAULT 'UNKNOWN',
  requester_patient_id  VARCHAR(50)       REFERENCES users(id),
  source                dispatch_source   NOT NULL DEFAULT 'PATIENT_APP',
  priority              dispatch_priority NOT NULL DEFAULT 'HIGH',
  status                dispatch_status   NOT NULL DEFAULT 'WAITING_FOR_DRIVER',
  assigned_driver_id    VARCHAR(50)       REFERENCES users(id),
  temp_case_id          VARCHAR(50),      -- FK added after emergency_cases table
  assigned_hospital_id  VARCHAR(50)       REFERENCES hospitals(id),
  location_lat          DECIMAL(10,7)     NOT NULL,
  location_lng          DECIMAL(10,7)     NOT NULL,
  created_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispatches_status     ON dispatches(status);
CREATE INDEX idx_dispatches_driver     ON dispatches(assigned_driver_id);
CREATE INDEX idx_dispatches_patient    ON dispatches(patient_id);
CREATE INDEX idx_dispatches_created    ON dispatches(created_at DESC);
```

### 5.11 Dispatch Timeline Table
```sql
CREATE TABLE dispatch_timeline (
  id           SERIAL       PRIMARY KEY,
  dispatch_id  VARCHAR(50)  NOT NULL REFERENCES dispatches(dispatch_id) ON DELETE CASCADE,
  event        VARCHAR(100) NOT NULL,
  event_time   VARCHAR(20)  NOT NULL DEFAULT 'Pending',  -- human readable "10:30 AM"
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending',  -- completed | active | pending
  occurred_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_dispatch ON dispatch_timeline(dispatch_id);
```

### 5.12 Emergency Cases Table
```sql
CREATE TABLE emergency_cases (
  case_id               VARCHAR(50)    PRIMARY KEY,
  dispatch_id           VARCHAR(50)    REFERENCES dispatches(dispatch_id),
  temporary_patient_id  VARCHAR(50)    NOT NULL,
  patient_name          VARCHAR(255),
  location_lat          DECIMAL(10,7),
  location_lng          DECIMAL(10,7),
  severity              case_severity  NOT NULL DEFAULT 'NOT_ASSESSED',
  status                VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
  triage_score          INTEGER,
  assigned_hospital_id  VARCHAR(50)    REFERENCES hospitals(id),
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cases_dispatch ON emergency_cases(dispatch_id);
CREATE INDEX idx_cases_status   ON emergency_cases(status);

-- Add FK from dispatches to emergency_cases now that the table exists
ALTER TABLE dispatches
  ADD CONSTRAINT fk_dispatch_temp_case
  FOREIGN KEY (temp_case_id) REFERENCES emergency_cases(case_id);
```

### 5.13 Case Symptoms Table
```sql
CREATE TABLE case_symptoms (
  id       SERIAL       PRIMARY KEY,
  case_id  VARCHAR(50)  NOT NULL REFERENCES emergency_cases(case_id) ON DELETE CASCADE,
  symptom  VARCHAR(255) NOT NULL
);

CREATE INDEX idx_symptoms_case ON case_symptoms(case_id);
```

### 5.14 Vitals Table
```sql
CREATE TABLE vitals (
  id                  SERIAL       PRIMARY KEY,
  case_id             VARCHAR(50)  NOT NULL,  -- can be dispatch_id or case_id
  heart_rate          INTEGER,
  oxygen_saturation   INTEGER,
  systolic_bp         INTEGER,
  diastolic_bp        INTEGER,
  temperature_f       DECIMAL(5,2),
  respiratory_rate    INTEGER,
  triage_score        INTEGER,
  severity            case_severity,
  recorded_by         VARCHAR(50)  REFERENCES users(id),
  recorded_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vitals_case ON vitals(case_id);
```

### 5.15 Ambulance Location Log Table
```sql
CREATE TABLE ambulance_location_log (
  id           SERIAL        PRIMARY KEY,
  dispatch_id  VARCHAR(50)   NOT NULL,
  driver_id    VARCHAR(50)   REFERENCES users(id),
  latitude     DECIMAL(10,7) NOT NULL,
  longitude    DECIMAL(10,7) NOT NULL,
  speed_ms     DECIMAL(6,2),  -- meters per second
  recorded_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_location_dispatch ON ambulance_location_log(dispatch_id);
CREATE INDEX idx_location_time     ON ambulance_location_log(dispatch_id, recorded_at DESC);
```

### 5.16 Seed Data — Hospitals
```sql
INSERT INTO hospitals (id, name, address, latitude, longitude, type, current_occupancy, available_beds, emergency_preparedness_status) VALUES
('hosp01', 'City Central Hospital',       '123 Medical Way, Downtown',    22.7733, 75.9137, 'GOVERNMENT', 72, 8,  'Trauma Bay Ready'),
('hosp02', 'Apollo Heart Institute',      '45 Cardiac Drive, Westside',   22.7833, 75.9237, 'PRIVATE',    40, 12, 'ICU Bed Reserved'),
('hosp03', 'Sunrise Burn & Trauma Center','88 Ring Road, Northside',      22.7600, 75.8900, 'SPECIALTY',  55, 6,  'Burn Unit Available');

INSERT INTO hospital_capabilities (hospital_id, capability) VALUES
('hosp01', 'LEVEL_1_TRAUMA'), ('hosp01', 'GENERAL_EMERGENCY'),
('hosp02', 'CARDIAC_CENTER'), ('hosp02', 'GENERAL_EMERGENCY'),
('hosp03', 'BURN_UNIT'),      ('hosp03', 'LEVEL_1_TRAUMA');
```

### 5.17 Seed Data — Demo Users
```sql
-- Passwords are "password" hashed with bcrypt (replace hash with real bcrypt hash)
INSERT INTO users (id, name, phone, password_hash, role) VALUES
('000000000000', 'Rahul Sharma',    '9999900001', '$2b$10$REPLACE_WITH_REAL_HASH', 'PATIENT'),
('param-042',    'Dr. Priya Mehta', '9999900002', '$2b$10$REPLACE_WITH_REAL_HASH', 'PARAMEDIC'),
('drv-092',      'Amit Verma',      '9999900003', '$2b$10$REPLACE_WITH_REAL_HASH', 'DRIVER');

INSERT INTO patient_profiles (patient_id, blood_group, aadhaar_number) VALUES
('000000000000', 'O+', '0000 0000 0000');

INSERT INTO patient_allergies (patient_id, allergy) VALUES
('000000000000', 'Penicillin'),
('000000000000', 'Peanuts');

INSERT INTO patient_chronic_conditions (patient_id, condition) VALUES
('000000000000', 'Type 2 Diabetes'),
('000000000000', 'Hypertension');

INSERT INTO medical_records (id, patient_id, type, title, date, provider, result) VALUES
('rec_d1', '000000000000', 'LAB_REPORT',   'Blood Sugar Fasting', '2026-02-15', 'City Diagnostics',   '142 mg/dL'),
('rec_d2', '000000000000', 'PRESCRIPTION', 'Metformin 500mg',     '2026-02-16', 'Dr. Priya Mehta',    NULL),
('rec_d3', '000000000000', 'IMAGING',      'Chest X-Ray',         '2026-01-10', 'Apollo Diagnostics', 'No acute findings'),
('rec_d4', '000000000000', 'LAB_REPORT',   'HbA1c Test',          '2026-01-05', 'City Diagnostics',   '7.8% (Elevated)');
```


---

## 6. AUTHENTICATION SYSTEM

### 6.1 POST /api/auth/login

**Request:**
```json
{ "username": "string", "password": "string" }
```
username can be phone number, email, or username.

**Response 200:**
```json
{
  "user": {
    "id": "000000000000",
    "name": "Rahul Sharma",
    "role": "PATIENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 401:**
```json
{ "message": "Invalid credentials" }
```

**Rules:**
- Compare password with bcrypt.compare()
- JWT payload must include: { id, name, role }
- Token expiry: 7 days
- Role values: PATIENT | PARAMEDIC | DRIVER (uppercase, exact)
- The `id` field for PATIENT is their patient ID — used later for medical record lookup

---

### 6.2 POST /api/auth/patient/register

**Request:**
```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "bloodGroup": "O+",
  "medicalConditions": "Diabetes"
}
```

**Response 201:**
```json
{
  "user": { "id": "usr-xxx", "name": "Rahul Sharma", "role": "PATIENT", "phone": "9876543210" },
  "token": "eyJ..."
}
```

**Rules:**
- Generate unique ID for new user
- Create entry in users table + patient_profiles table
- If phone already exists → 400 { "message": "Phone already registered" }

---

### 6.3 JWT Middleware

All routes EXCEPT /api/auth/login and /api/auth/patient/register require:
```
Authorization: Bearer <token>
```

If missing or invalid → 401 { "message": "Unauthorized" }

The frontend sends this header automatically on every request.

---

## 7. DISPATCH SYSTEM

This is the most important part. Every emergency starts here.

### Dispatch Status Lifecycle (must follow this exact order):
```
WAITING_FOR_DRIVER
  → DRIVER_ASSIGNED
  → AMBULANCE_EN_ROUTE
  → ARRIVED_AT_SCENE
  → TEMP_CASE_CREATED   (UNKNOWN patient only)
  → VITALS_RECORDED
  → HOSPITAL_ASSIGNED
  → EN_ROUTE_TO_HOSPITAL
  → ARRIVED_AT_HOSPITAL
  → HANDOFF_COMPLETE
```

---

### 7.1 POST /api/dispatch/create

Called by: Patient (after pressing SOS button)

**Request:**
```json
{
  "location": { "latitude": 22.7196, "longitude": 75.8577 },
  "source": "PATIENT_APP",
  "patientName": "Rahul Sharma",
  "patientId": "000000000000",
  "patientIdentity": "KNOWN",
  "requesterPatientId": "000000000000"
}
```

**Field meanings:**
- `patientIdentity`: KNOWN = patient is the app user (has records). UNKNOWN = someone else / unidentified
- `patientId`: logged-in user's ID
- `requesterPatientId`: same as patientId — paramedic uses this to fetch medical records
- `source`: always "PATIENT_APP" from mobile

**Response 201:**
```json
{
  "dispatchId": "DISP-1234567890-5678",
  "priority": "HIGH",
  "status": "WAITING_FOR_DRIVER",
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

**After creating, emit Socket.IO event to ALL clients:**
```json
Event: "DISPATCH_CREATED"
{
  "dispatchId": "DISP-xxx",
  "location": { "latitude": 22.7196, "longitude": 75.8577 },
  "priority": "HIGH",
  "patientName": "Rahul Sharma",
  "patientIdentity": "KNOWN",
  "status": "WAITING_FOR_DRIVER",
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

**DB operations:**
1. INSERT into dispatches table
2. INSERT into dispatch_timeline (9 events for KNOWN, 10 for UNKNOWN — see section 7.7)

---

### 7.2 GET /api/dispatch/pending

Called by: Driver (to see available dispatches)

**Response 200:**
```json
[
  {
    "dispatchId": "DISP-xxx",
    "location": { "latitude": 22.7196, "longitude": 75.8577 },
    "source": "PATIENT_APP",
    "priority": "HIGH",
    "status": "WAITING_FOR_DRIVER",
    "assignedDriverId": null,
    "patientName": "Rahul Sharma",
    "patientId": "000000000000",
    "patientIdentity": "KNOWN",
    "requesterPatientId": "000000000000",
    "tempCaseId": null,
    "timeline": [],
    "createdAt": "2026-03-15T10:30:00.000Z"
  }
]
```

**Rules:**
- Only return dispatches WHERE status = 'WAITING_FOR_DRIVER'
- Sort by: priority ASC (CRITICAL first), then createdAt ASC
- ALWAYS return array [] — never return 404 for this endpoint
- Priority sort order: CRITICAL=0, HIGH=1, MEDIUM=2, LOW=3

---

### 7.3 POST /api/dispatch/accept

Called by: Driver

**Request:**
```json
{ "dispatchId": "DISP-xxx", "driverId": "drv-092" }
```

**Response 200:**
```json
{ "success": true, "dispatch": { ...full dispatch object... } }
```

**Response 404:**
```json
{ "message": "Dispatch not found or already assigned" }
```

**DB operations:**
1. UPDATE dispatches SET status='DRIVER_ASSIGNED', assigned_driver_id=driverId WHERE dispatch_id=? AND status='WAITING_FOR_DRIVER'
2. UPDATE dispatch_timeline SET event_time=NOW(), status='completed' WHERE dispatch_id=? AND event='DRIVER_ASSIGNED'

**Emit to ALL clients:**
```json
Event: "DISPATCH_STATE_UPDATE"
{ "dispatchId": "DISP-xxx", "state": "DRIVER_ASSIGNED", "assignedDriverId": "drv-092" }
```

---

### 7.4 POST /api/dispatch/status

Called by: Driver and Paramedic (to advance dispatch lifecycle)

**Request:**
```json
{ "dispatchId": "DISP-xxx", "status": "AMBULANCE_EN_ROUTE" }
```

**Valid status values:**
AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE, TEMP_CASE_CREATED, VITALS_RECORDED,
HOSPITAL_ASSIGNED, EN_ROUTE_TO_HOSPITAL, ARRIVED_AT_HOSPITAL, HANDOFF_COMPLETE

**Response 200:**
```json
{ "success": true }
```

**DB operations:**
1. UPDATE dispatches SET status=?, updated_at=NOW()
2. UPDATE dispatch_timeline SET event_time=<human time>, status='completed' WHERE event=<mapped event>

**Emit two socket events:**

Event 1 — to ALL clients:
```json
Event: "DISPATCH_STATE_UPDATE"
{ "dispatchId": "DISP-xxx", "state": "AMBULANCE_EN_ROUTE" }
```

Event 2 — to dispatch room (dispatchId as room key):
```json
Event: "STATUS_UPDATE"
{
  "dispatchId": "DISP-xxx",
  "status": "AMBULANCE_EN_ROUTE",
  "message": "Ambulance is on the way to your location.",
  "timestamp": "10:32 AM"
}
```

**Status → Message mapping:**
```
DRIVER_ASSIGNED      → "A driver has been assigned to your request."
AMBULANCE_EN_ROUTE   → "Ambulance is on the way to your location."
ARRIVED_AT_SCENE     → "Ambulance has arrived at your location."
TEMP_CASE_CREATED    → "Paramedic has created your medical case."
VITALS_RECORDED      → "Vitals have been recorded and assessed."
HOSPITAL_ASSIGNED    → "A hospital has been assigned for your care."
EN_ROUTE_TO_HOSPITAL → "Ambulance is en route to the hospital."
ARRIVED_AT_HOSPITAL  → "Ambulance has arrived at the hospital."
HANDOFF_COMPLETE     → "Patient has been handed off to hospital staff."
```

---

### 7.5 GET /api/dispatch/active

Called by: Paramedic (on login and on screen focus)

**Response 200:** Single dispatch object (same shape as pending list item)

**Rules:**
- Return most recently created dispatch WHERE status != 'HANDOFF_COMPLETE'
- This INCLUDES 'WAITING_FOR_DRIVER' — paramedic must see it immediately after patient SOS
- SQL: SELECT * FROM dispatches WHERE status != 'HANDOFF_COMPLETE' ORDER BY created_at DESC LIMIT 1
- If none → 404 { "message": "No active dispatch" }

---

### 7.6 GET /api/dispatch/:dispatchId

**Response 200:** Full dispatch object or 404

Full dispatch object shape:
```json
{
  "dispatchId": "DISP-xxx",
  "location": { "latitude": 22.7196, "longitude": 75.8577 },
  "source": "PATIENT_APP",
  "priority": "HIGH",
  "status": "ARRIVED_AT_SCENE",
  "assignedDriverId": "drv-092",
  "patientName": "Rahul Sharma",
  "patientId": "000000000000",
  "patientIdentity": "KNOWN",
  "requesterPatientId": "000000000000",
  "tempCaseId": null,
  "assignedHospital": null,
  "timeline": [ ...see 7.7... ],
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

---

### 7.7 GET /api/dispatch/:dispatchId/timeline

**Response 200:**
```json
[
  { "event": "DISPATCH_CREATED",    "time": "10:30 AM", "status": "completed" },
  { "event": "DRIVER_ASSIGNED",     "time": "10:32 AM", "status": "completed" },
  { "event": "AMBULANCE_EN_ROUTE",  "time": "Pending",  "status": "pending"   },
  { "event": "ARRIVED_AT_SCENE",    "time": "Pending",  "status": "pending"   },
  { "event": "VITALS_RECORDED",     "time": "Pending",  "status": "pending"   },
  { "event": "HOSPITAL_ASSIGNED",   "time": "Pending",  "status": "pending"   },
  { "event": "EN_ROUTE_TO_HOSPITAL","time": "Pending",  "status": "pending"   },
  { "event": "ARRIVED_AT_HOSPITAL", "time": "Pending",  "status": "pending"   },
  { "event": "HANDOFF_COMPLETE",    "time": "Pending",  "status": "pending"   }
]
```

**KNOWN patient timeline (9 events):**
DISPATCH_CREATED, DRIVER_ASSIGNED, AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE,
VITALS_RECORDED, HOSPITAL_ASSIGNED, EN_ROUTE_TO_HOSPITAL, ARRIVED_AT_HOSPITAL, HANDOFF_COMPLETE

**UNKNOWN patient timeline (10 events — has TEMP_CASE_CREATED):**
DISPATCH_CREATED, DRIVER_ASSIGNED, AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE,
TEMP_CASE_CREATED, VITALS_RECORDED, HOSPITAL_ASSIGNED, EN_ROUTE_TO_HOSPITAL,
ARRIVED_AT_HOSPITAL, HANDOFF_COMPLETE

**event status values:** "completed" | "active" | "pending"


---

## 8. EMERGENCY CASES

Emergency cases are medical sub-records. In the KNOWN patient flow, the dispatch itself acts as the case reference. In the UNKNOWN patient flow, a temp case is created separately.

---

### 8.1 POST /api/emergency/create

Called by: Paramedic (standalone intake, no dispatch)

**Request:**
```json
{
  "patientName": "Unknown Male",
  "location": { "latitude": 22.7196, "longitude": 75.8577 },
  "symptoms": ["Chest pain", "Shortness of breath"],
  "severity": "HIGH"
}
```

**Response 201:**
```json
{
  "caseId": "CASE-1234567890-5678",
  "temporaryPatientId": "TMP-1234567890-1234",
  "status": "PENDING",
  "severity": "HIGH",
  "assignedHospital": null,
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

**DB:** INSERT into emergency_cases + case_symptoms

---

### 8.2 POST /api/emergency/create-temp

Called by: Paramedic (UNKNOWN patient — after arriving at scene)

**Request:**
```json
{
  "dispatchId": "DISP-xxx",
  "patientName": "Unknown Male",
  "symptoms": ["Cardiac", "Unconscious"],
  "location": { "latitude": 22.7196, "longitude": 75.8577 }
}
```

**Response 201:**
```json
{
  "tempCaseId": "TMP-A3F2",
  "dispatchId": "DISP-xxx",
  "temporaryPatientId": "TMP-A3F2",
  "status": "TEMP_CASE_CREATED",
  "createdAt": "2026-03-15T10:45:00.000Z"
}
```

**Rules:**
- Generate short readable ID like TMP-A3F2 (4 random uppercase alphanumeric chars)
- INSERT into emergency_cases with dispatch_id linked
- UPDATE dispatches SET temp_case_id = new case id
- Call POST /dispatch/status internally → advance dispatch to TEMP_CASE_CREATED

**Emit to ALL clients:**
```json
Event: "DISPATCH_STATE_UPDATE"
{ "dispatchId": "DISP-xxx", "state": "TEMP_CASE_CREATED", "tempCaseId": "TMP-A3F2" }
```

---

### 8.3 POST /api/emergency/vitals

Called by: Paramedic (records patient vitals at scene)

**CRITICAL: caseId can be a dispatch ID (DISP-xxx) for KNOWN patients, or a case ID (CASE-xxx / TMP-xxx) for UNKNOWN patients. Handle both.**

**Request:**
```json
{
  "caseId": "DISP-xxx",
  "vitals": {
    "heartRate": "115",
    "oxygenSaturation": "94",
    "bloodPressure": "105/70",
    "temperature": "101.2",
    "respiratoryRate": "22"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "severity": "HIGH",
  "triageScore": 5
}
```

**NEWS2 Triage Scoring Algorithm — implement EXACTLY as below:**
```
Respiratory Rate (breaths/min):
  ≤8 or ≥25   → +3
  21–24        → +2
  9–11         → +1
  12–20        → +0

SpO2 (%):
  ≤91          → +3
  92–93        → +2
  94–95        → +1
  ≥96          → +0

Heart Rate (BPM):
  ≤40 or ≥131  → +3
  111–130      → +2
  ≤50 or 91–110→ +1
  51–90        → +0

Systolic BP (mmHg) — parse from "105/70", take first number:
  ≤90 or ≥220  → +3
  91–100       → +2
  101–110      → +1
  111–219      → +0

Temperature (°F):
  ≤95.0        → +3
  ≥102.4       → +2
  ≤96.8 or 100.6–102.2 → +1
  96.9–100.5   → +0

Severity from total score:
  score ≥ 7   → CRITICAL
  score 5–6   → HIGH
  score 3–4   → MEDIUM
  score 0–2   → NORMAL
```

**All vitals fields are strings — parse to numbers before scoring.**

**DB operations:**
1. INSERT into vitals table
2. If caseId is DISP-xxx: UPDATE dispatches SET status='VITALS_RECORDED'
3. If caseId is CASE/TMP: UPDATE emergency_cases SET severity=?, triage_score=?, status='VITALS_RECORDED'
4. UPDATE dispatch_timeline for VITALS_RECORDED event

---

### 8.4 GET /api/emergency/active

Called by: Patient (to check if they have an active case on app open)

**Response 200:** Most recent non-completed emergency case object
**Response 404:** { "message": "No active case" }

---

### 8.5 GET /api/emergency/timeline/:caseId
### 8.6 GET /api/emergency/:caseId/timeline

Both routes must work (frontend uses both).

**Response 200:** Array of timeline events (same format as dispatch timeline)

---

### 8.7 POST /api/emergency/status

Called by: Paramedic (StatusUpdateScreen — manual status update)

**Request:**
```json
{ "caseId": "CASE-xxx", "status": "EN_ROUTE_TO_HOSPITAL" }
```

**Response 200:** { "success": true }

**Emit to case room:**
```json
Event: "DISPATCH_STATE_UPDATE"
{ "caseId": "CASE-xxx", "state": "EN_ROUTE_TO_HOSPITAL" }

Event: "STATUS_UPDATE"
{ "caseId": "CASE-xxx", "status": "EN_ROUTE_TO_HOSPITAL", "message": "...", "timestamp": "10:45 AM" }
```

---

## 9. PATIENT RECORDS

### 9.1 GET /api/patient/profile/:patientId

Called by: Paramedic (KnownPatientAtScene screen — loads automatically)

**Response 200:**
```json
{
  "id": "000000000000",
  "name": "Rahul Sharma",
  "bloodGroup": "O+",
  "allergies": ["Penicillin", "Peanuts"],
  "chronicConditions": ["Type 2 Diabetes", "Hypertension"],
  "aadhaar": "0000 0000 0000"
}
```

**CRITICAL RULE: Never return 404 for this endpoint.**
If patient not found, return default object:
```json
{
  "id": "<patientId>",
  "name": "Unknown Patient",
  "bloodGroup": "Unknown",
  "allergies": [],
  "chronicConditions": [],
  "aadhaar": ""
}
```

**SQL:**
```sql
SELECT u.id, u.name, pp.blood_group, pp.aadhaar_number
FROM users u
LEFT JOIN patient_profiles pp ON u.id = pp.patient_id
WHERE u.id = $1;

SELECT allergy FROM patient_allergies WHERE patient_id = $1;
SELECT condition FROM patient_chronic_conditions WHERE patient_id = $1;
```

---

### 9.2 GET /api/patient/records/:patientId

Called by: Paramedic (KnownPatientAtScene screen) and Patient (MedicalRecord screen)

**Response 200:**
```json
[
  {
    "id": "rec_d1",
    "type": "LAB_REPORT",
    "title": "Blood Sugar Fasting",
    "date": "2026-02-15",
    "provider": "City Diagnostics",
    "result": "142 mg/dL"
  },
  {
    "id": "rec_d2",
    "type": "PRESCRIPTION",
    "title": "Metformin 500mg",
    "date": "2026-02-16",
    "provider": "Dr. Priya Mehta",
    "result": null
  }
]
```

**CRITICAL RULE: Always return [] if no records — never return 404.**

**SQL:**
```sql
SELECT id, type, title, date, provider, result
FROM medical_records
WHERE patient_id = $1
ORDER BY date DESC;
```

---

### 9.3 POST /api/patient/records

Called by: Paramedic (to add a record after treatment)

**Request:**
```json
{
  "patientId": "000000000000",
  "record": {
    "type": "LAB_REPORT",
    "title": "ECG Report",
    "date": "2026-03-15",
    "provider": "Apollo Heart Institute",
    "result": "Normal sinus rhythm"
  }
}
```

**Response 201:** Created record with generated id

---

## 10. HOSPITAL SYSTEM

### 10.1 POST /api/hospital/search

Called by: Paramedic (HospitalAssignment screen)

**Request:**
```json
{
  "capability": "CARDIAC_CENTER",
  "severity": "HIGH",
  "location": { "latitude": 22.7196, "longitude": 75.8577 }
}
```

All fields optional. If location provided, sort by proximity (Haversine distance).

**Response 200:** Array of hospital objects sorted by distance:
```json
[
  {
    "id": "hosp02",
    "name": "Apollo Heart Institute",
    "address": "45 Cardiac Drive, Westside",
    "location": { "latitude": 22.7833, "longitude": 75.9237 },
    "type": "PRIVATE",
    "capabilities": ["CARDIAC_CENTER", "GENERAL_EMERGENCY"],
    "currentOccupancy": 40,
    "emergencyPreparednessStatus": "ICU Bed Reserved",
    "availableBeds": 12
  }
]
```

**SQL:**
```sql
SELECT h.*, array_agg(hc.capability) as capabilities
FROM hospitals h
LEFT JOIN hospital_capabilities hc ON h.id = hc.hospital_id
WHERE h.is_active = true
  AND ($1::text IS NULL OR hc.capability = $1)
GROUP BY h.id
ORDER BY (
  point(h.longitude, h.latitude) <-> point($2, $3)
) ASC;
```

---

### 10.2 POST /api/hospital/assign

Called by: Paramedic (after selecting hospital)

**CRITICAL: caseId can be a dispatch ID (DISP-xxx) or case ID (CASE-xxx). Handle both.**

**Request:**
```json
{ "caseId": "DISP-xxx", "hospitalId": "hosp02" }
```

**Response 200:**
```json
{
  "success": true,
  "hospital": { ...full hospital object... }
}
```

**DB operations:**
1. UPDATE dispatches SET assigned_hospital_id=hospitalId, status='HOSPITAL_ASSIGNED' WHERE dispatch_id=?
   OR UPDATE emergency_cases SET assigned_hospital_id=hospitalId WHERE case_id=?
2. UPDATE dispatch_timeline for HOSPITAL_ASSIGNED event

**Emit to ALL clients:**
```json
Event: "HOSPITAL_ASSIGNED"
{
  "caseId": "DISP-xxx",
  "hospital": {
    "id": "hosp02",
    "name": "Apollo Heart Institute",
    "location": { "latitude": 22.7833, "longitude": 75.9237 },
    ...full hospital object...
  }
}
```

**This event is critical — patient tracking screen listens for it to show hospital marker on map.**

---

### 10.3 GET /api/hospital/assigned/:caseId

Called by: Driver (NavigationScreen — to get hospital destination)

**caseId can be dispatch ID or case ID.**

**Response 200:** Full hospital object
**Response 404:** { "message": "No hospital assigned yet" }

---

### 10.4 POST /api/hospital/recommend

Called by: Paramedic (AI recommendation placeholder)

**Request:**
```json
{
  "severity": "HIGH",
  "location": { "latitude": 22.7196, "longitude": 75.8577 },
  "capability": "CARDIAC_CENTER"
}
```

**Response 200:**
```json
{
  "recommended": { ...hospital object... },
  "confidence": 0.92,
  "reason": "Nearest available with matching capability"
}
```

Logic: same as /hospital/search — return closest matching hospital.


---

## 11. AMBULANCE LOCATION

### 11.1 POST /api/ambulance/location

Called by: Driver (every 4 seconds while navigating)

**Request:**
```json
{
  "caseId": "DISP-xxx",
  "latitude": 22.7250,
  "longitude": 75.8620
}
```

**Response 200:**
```json
{ "success": true, "speed": 8.5 }
```

**Rules:**
- Calculate speed from previous location update using Haversine + time delta (result in m/s)
- INSERT into ambulance_location_log
- Broadcast to case/dispatch room via socket

**Speed calculation:**
```
distance_meters = haversine(prev_lat, prev_lng, curr_lat, curr_lng)
time_seconds    = (curr_timestamp - prev_timestamp) / 1000
speed_ms        = distance_meters / time_seconds
```

**Emit to dispatch room (dispatchId as room key):**
```json
Event: "AMBULANCE_LOCATION_UPDATE"
{
  "caseId": "DISP-xxx",
  "latitude": 22.7250,
  "longitude": 75.8620,
  "speed": 8.5,
  "timestamp": "2026-03-15T10:35:00.000Z"
}
```

---

## 12. ROUTING (OSRM PROXY)

### 12.1 GET /api/routes/driving/:coords

Called by: Driver (NavigationScreen) and Patient (AmbulanceTrackingScreen)

**URL format:** `/api/routes/driving/75.8577,22.7196;75.9237,22.7833`
(startLng,startLat;endLng,endLat)

**What to do:** Proxy the request to OSRM public server:
```
https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson
```

**Response 200:**
```json
{
  "code": "Ok",
  "routes": [
    {
      "geometry": {
        "type": "LineString",
        "coordinates": [[75.8577, 22.7196], [75.8900, 22.7500], [75.9237, 22.7833]]
      },
      "distance": 4200.5,
      "duration": 840.0
    }
  ],
  "eta": 14
}
```

**Rules:**
- `eta` = Math.ceil(distance / 10 / 60) — assumes 10 m/s (36 km/h) ambulance speed
- If OSRM fails (timeout/error), return fallback straight-line route — do NOT return 500
- Fallback: straight line from start to end with Haversine distance

**Fallback response:**
```json
{
  "code": "Ok",
  "routes": [{
    "geometry": {
      "type": "LineString",
      "coordinates": [[startLng, startLat], [midLng, midLat], [endLng, endLat]]
    },
    "distance": 4200.5,
    "duration": 420.0
  }],
  "eta": 7
}
```

---

## 13. TRIAGE ENGINE

### 13.1 POST /api/triage/analyze

AI placeholder — use same NEWS2 logic as /emergency/vitals for now.

**Request:**
```json
{
  "symptoms": ["Chest pain", "Shortness of breath"],
  "vitals": {
    "heartRate": "115",
    "oxygenSaturation": "94"
  }
}
```

**Response 200:**
```json
{
  "severity": "HIGH",
  "triageScore": 5,
  "confidence": 0.87,
  "model": "news2-v1"
}
```

---

## 14. SOCKET.IO — COMPLETE REFERENCE

### 14.1 Setup
```js
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
```

### 14.2 Rooms System

The frontend joins rooms using these socket events. Backend must handle all of them:

| Client emits | Payload | What backend does |
|---|---|---|
| `JOIN_CASE` | `{ caseId }` | socket.join(caseId) |
| `JOIN_DISPATCH` | `{ dispatchId }` | socket.join(dispatchId) |
| `JOIN_DRIVERS` | (none) | socket.join('drivers') |

**Room usage:**
- `dispatchId` room: patient joins this to receive ambulance location + status updates
- `caseId` room: legacy — keep for backward compatibility
- `drivers` room: all drivers join this to receive DISPATCH_CREATED broadcasts

---

### 14.3 Events Backend Must EMIT

| Event | When to emit | Who receives | Payload |
|---|---|---|---|
| `DISPATCH_CREATED` | New dispatch created | ALL clients | `{ dispatchId, location, priority, patientName, patientIdentity, status, createdAt }` |
| `DISPATCH_STATE_UPDATE` | Any status change | ALL clients | `{ dispatchId, state }` |
| `STATUS_UPDATE` | Any status change | dispatch room | `{ dispatchId, status, message, timestamp }` |
| `AMBULANCE_LOCATION_UPDATE` | Driver sends GPS | dispatch room + case room | `{ caseId, latitude, longitude, speed, timestamp }` |
| `HOSPITAL_ASSIGNED` | Hospital assigned | ALL clients | `{ caseId, hospital }` |

**IMPORTANT for AMBULANCE_LOCATION_UPDATE:**
Emit to BOTH the dispatchId room AND the caseId room:
```js
io.in(dispatchId).emit('AMBULANCE_LOCATION_UPDATE', payload);
io.in(caseId).emit('AMBULANCE_LOCATION_UPDATE', payload);
```
Patient joins the dispatch room. Legacy screens join the case room. Both must receive GPS updates.

---

### 14.4 Events Backend Must LISTEN FOR

| Client emits | Payload | What backend does |
|---|---|---|
| `JOIN_CASE` | `{ caseId }` | socket.join(caseId) |
| `JOIN_DISPATCH` | `{ dispatchId }` | socket.join(dispatchId) |
| `JOIN_DRIVERS` | (none) | socket.join('drivers') |
| `AMBULANCE_LOCATION_UPDATE` | `{ caseId, dispatchId, latitude, longitude }` | Broadcast to rooms, log to DB |

**Full socket handler:**
```js
io.on('connection', (socket) => {
  socket.on('JOIN_CASE',     ({ caseId })     => socket.join(caseId));
  socket.on('JOIN_DISPATCH', ({ dispatchId }) => socket.join(dispatchId));
  socket.on('JOIN_DRIVERS',  ()               => socket.join('drivers'));

  socket.on('AMBULANCE_LOCATION_UPDATE', ({ caseId, dispatchId, latitude, longitude }) => {
    const payload = { caseId, latitude, longitude, speed: 0, timestamp: new Date().toISOString() };
    // Broadcast to both rooms
    if (caseId)     io.in(caseId).emit('AMBULANCE_LOCATION_UPDATE', payload);
    if (dispatchId) io.in(dispatchId).emit('AMBULANCE_LOCATION_UPDATE', { ...payload, dispatchId });
    // Log to DB
    saveLocationLog(dispatchId || caseId, latitude, longitude);
  });

  socket.on('disconnect', () => console.log('disconnected:', socket.id));
});
```

---

### 14.5 Socket Event Payload Shapes (exact field names)

**DISPATCH_CREATED:**
```json
{
  "dispatchId": "string",
  "location": { "latitude": 0.0, "longitude": 0.0 },
  "priority": "HIGH",
  "patientName": "string",
  "patientIdentity": "KNOWN",
  "status": "WAITING_FOR_DRIVER",
  "createdAt": "ISO string"
}
```

**DISPATCH_STATE_UPDATE:**
```json
{
  "dispatchId": "string",
  "state": "AMBULANCE_EN_ROUTE",
  "assignedDriverId": "string (only on DRIVER_ASSIGNED)"
}
```

**STATUS_UPDATE:**
```json
{
  "dispatchId": "string",
  "status": "AMBULANCE_EN_ROUTE",
  "message": "Ambulance is on the way to your location.",
  "timestamp": "10:32 AM"
}
```

**AMBULANCE_LOCATION_UPDATE:**
```json
{
  "caseId": "string",
  "latitude": 22.7250,
  "longitude": 75.8620,
  "speed": 8.5,
  "timestamp": "2026-03-15T10:35:00.000Z"
}
```

**HOSPITAL_ASSIGNED:**
```json
{
  "caseId": "string",
  "hospital": {
    "id": "hosp02",
    "name": "Apollo Heart Institute",
    "address": "45 Cardiac Drive, Westside",
    "location": { "latitude": 22.7833, "longitude": 75.9237 },
    "type": "PRIVATE",
    "capabilities": ["CARDIAC_CENTER", "GENERAL_EMERGENCY"],
    "currentOccupancy": 40,
    "emergencyPreparednessStatus": "ICU Bed Reserved",
    "availableBeds": 12
  }
}
```


---

## 15. COMPLETE API ENDPOINT REFERENCE TABLE

| # | Method | Endpoint | Called By | Auth Required |
|---|--------|----------|-----------|---------------|
| 1 | POST | `/api/auth/login` | All | No |
| 2 | POST | `/api/auth/patient/register` | Patient | No |
| 3 | POST | `/api/dispatch/create` | Patient | Yes |
| 4 | GET | `/api/dispatch/pending` | Driver | Yes |
| 5 | POST | `/api/dispatch/accept` | Driver | Yes |
| 6 | POST | `/api/dispatch/status` | Driver, Paramedic | Yes |
| 7 | GET | `/api/dispatch/active` | Paramedic | Yes |
| 8 | GET | `/api/dispatch/:id` | All | Yes |
| 9 | GET | `/api/dispatch/:id/timeline` | All | Yes |
| 10 | POST | `/api/emergency/create` | Paramedic | Yes |
| 11 | POST | `/api/emergency/create-temp` | Paramedic | Yes |
| 12 | POST | `/api/emergency/vitals` | Paramedic | Yes |
| 13 | GET | `/api/emergency/active` | Patient | Yes |
| 14 | POST | `/api/emergency/status` | Paramedic | Yes |
| 15 | GET | `/api/emergency/timeline/:caseId` | All | Yes |
| 16 | GET | `/api/emergency/:caseId/timeline` | All | Yes |
| 17 | GET | `/api/patient/profile/:patientId` | Paramedic | Yes |
| 18 | GET | `/api/patient/records/:patientId` | Paramedic, Patient | Yes |
| 19 | POST | `/api/patient/records` | Paramedic | Yes |
| 20 | POST | `/api/patient/contacts` | Patient | Yes |
| 21 | POST | `/api/hospital/search` | Paramedic | Yes |
| 22 | POST | `/api/hospital/assign` | Paramedic | Yes |
| 23 | GET | `/api/hospital/assigned/:caseId` | Driver, Patient | Yes |
| 24 | POST | `/api/hospital/recommend` | Paramedic | Yes |
| 25 | POST | `/api/ambulance/location` | Driver | Yes |
| 26 | GET | `/api/routes/driving/:coords` | Driver, Patient | Yes |
| 27 | POST | `/api/triage/analyze` | Paramedic | Yes |

---

## 16. ERROR HANDLING

### Standard error response format (ALL errors must use this):
```json
{ "message": "Human readable description of what went wrong" }
```

### HTTP Status Codes:
| Code | When to use |
|------|-------------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request / missing required fields |
| 401 | Missing or invalid JWT token |
| 403 | Valid token but wrong role / no permission |
| 404 | Resource not found |
| 409 | Conflict (e.g. phone already registered) |
| 500 | Internal server error |

### Special rules:
- `GET /api/dispatch/pending` → ALWAYS return [] on empty, never 404
- `GET /api/patient/records/:id` → ALWAYS return [] on empty, never 404
- `GET /api/patient/profile/:id` → ALWAYS return default object, never 404
- `GET /api/emergency/active` → 404 is OK when no active case
- `GET /api/dispatch/active` → 404 is OK when no active dispatch

### Global error handler (Express):
```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});
```

---

## 17. CORS & SECURITY

### CORS config (development):
```js
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Socket.IO CORS:
```js
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
```

### JWT middleware:
```js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

### Password hashing:
```js
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// On register:
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// On login:
const match = await bcrypt.compare(password, storedHash);
```

### Request logger (required — frontend team uses logs for debugging):
```js
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

---

## 18. CRITICAL RULES — DO NOT BREAK THESE

These will break the frontend if violated:

**1. Field names are exact — no renaming:**
- `dispatchId` (not dispatch_id, not id)
- `patientIdentity` (not patient_identity)
- `requesterPatientId` (not requester_patient_id)
- `assignedDriverId` (not assigned_driver_id)
- `tempCaseId` (not temp_case_id)
- `createdAt` (not created_at)
- `patientName` (not patient_name)

**2. Socket event names are exact uppercase:**
- `DISPATCH_CREATED`
- `DISPATCH_STATE_UPDATE`
- `STATUS_UPDATE`
- `AMBULANCE_LOCATION_UPDATE`
- `HOSPITAL_ASSIGNED`

**3. NEWS2 scoring must match frontend exactly.**
The paramedic screen shows live triage score as they type. Backend must return same score for same inputs. Use the exact algorithm from section 8.3.

**4. GET /api/dispatch/active must return WAITING_FOR_DRIVER dispatches.**
Paramedic needs to see the dispatch immediately after patient creates SOS — before driver accepts.

**5. GET /api/dispatch/pending must return [] not 404.**
Driver dashboard shows empty state on []. A 404 crashes the list.

**6. GET /api/patient/records/:id must return [] not 404.**
KnownPatientAtScene screen renders the list. A 404 shows error instead of empty records.

**7. HOSPITAL_ASSIGNED socket event must go to ALL clients.**
Patient tracking screen listens for this to show hospital marker on map. If only sent to room, patient misses it.

**8. AMBULANCE_LOCATION_UPDATE must go to dispatch room (dispatchId as key).**
Patient joins the dispatch room (not case room) after SOS. GPS updates must reach them.

**9. caseId in /emergency/vitals and /hospital/assign can be a dispatch ID.**
For KNOWN patients, frontend passes dispatchId as caseId. Backend must detect DISP- prefix and handle accordingly.

**10. Server must listen on 0.0.0.0 not 127.0.0.1.**
Mobile devices connect over LAN. Binding to localhost only will block all mobile connections.

---

## 19. FUTURE AI INTEGRATION POINTS

Design these endpoints to be swappable with real AI models later:

| Endpoint | Current | Future |
|----------|---------|--------|
| `POST /api/triage/analyze` | NEWS2 rule-based | ML model (vitals + symptoms → severity) |
| `POST /api/hospital/recommend` | Nearest matching | AI (patient condition + hospital capacity + traffic) |
| `GET /api/patient/profile/:id` | DB lookup | AI summary of patient history for paramedic |

**Database design note:**
Keep `vitals` table separate from `emergency_cases`. AI models will need historical vitals data for training. Never store vitals as a JSON blob inside the case record.

Keep `ambulance_location_log` — future AI will use GPS history for ETA prediction and route optimization.

---

## 20. QUICK INTEGRATION CHECKLIST

Before handing off to frontend team, verify:

- [ ] POST /api/auth/login returns { user: { id, name, role }, token }
- [ ] All protected routes reject requests without Bearer token
- [ ] POST /api/dispatch/create emits DISPATCH_CREATED to all clients
- [ ] GET /api/dispatch/pending returns [] when empty (not 404)
- [ ] POST /api/dispatch/accept emits DISPATCH_STATE_UPDATE to all clients
- [ ] GET /api/dispatch/active returns WAITING_FOR_DRIVER dispatches
- [ ] POST /api/emergency/vitals handles DISP- prefix caseId
- [ ] POST /api/hospital/assign handles DISP- prefix caseId
- [ ] POST /api/hospital/assign emits HOSPITAL_ASSIGNED to ALL clients
- [ ] GET /api/patient/profile/:id never returns 404
- [ ] GET /api/patient/records/:id returns [] when empty
- [ ] Socket JOIN_DISPATCH handler adds socket to dispatchId room
- [ ] AMBULANCE_LOCATION_UPDATE emitted to dispatchId room
- [ ] Server listens on 0.0.0.0:3000
- [ ] CORS allows all origins
- [ ] All JSON field names use camelCase (dispatchId not dispatch_id)

---

*End of Backend Requirements Document*
*Frontend team contact: share this document with your backend developer as-is.*
*All API contracts are derived directly from the production frontend code.*

