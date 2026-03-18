# Backend Requirements — Healthcare Emergency Dispatch App
**Version:** 1.0  
**Prepared for:** Backend Developer  
**App:** React Native (Expo) — Emergency Ambulance Coordination Platform  

---

## 1. Overview

This is a real-time emergency dispatch system with three user roles:

| Role | Description |
|------|-------------|
| PATIENT | Creates SOS requests, tracks ambulance live |
| DRIVER | Receives dispatch requests, navigates to patient and hospital |
| PARAMEDIC | Assesses patient at scene, records vitals, assigns hospital |

The frontend is already built and production-ready. It communicates with the backend via:
- **REST API** (base URL: `http://<server>:3000/api`)
- **Socket.IO** (same server, same port)

You must implement all endpoints and socket events exactly as described in this document. Do not change field names, response shapes, or event names — the frontend depends on them.

---

## 2. Tech Stack (Recommended)

- **Runtime:** Node.js (Express) or any REST framework
- **Database:** PostgreSQL or MongoDB
- **Real-time:** Socket.IO (must use Socket.IO — frontend uses `socket.io-client`)
- **Auth:** JWT tokens
- **Language:** Any (Node.js preferred for Socket.IO compatibility)

---

## 3. Authentication

### 3.1 Login

```
POST /api/auth/login
```

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "role": "PATIENT | PARAMEDIC | DRIVER"
  },
  "token": "string (JWT)"
}
```

**Rules:**
- Role is determined by the user's account type in the database
- `id` for PATIENT users must be their unique patient ID (used for medical record lookup)
- Token must be returned and accepted as `Authorization: Bearer <token>` header on all subsequent requests
- If credentials are wrong → `401 { "message": "Invalid credentials" }`

---

### 3.2 Patient Registration

```
POST /api/auth/patient/register
```

**Request:**
```json
{
  "name": "string",
  "phone": "string",
  "bloodGroup": "string (optional)",
  "medicalConditions": "string (optional)"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "role": "PATIENT",
    "phone": "string"
  },
  "token": "string (JWT)"
}
```

---

## 4. Dispatch System

This is the core of the app. Every emergency starts with a dispatch request.

### Dispatch Lifecycle (in order):

```
WAITING_FOR_DRIVER
  → DRIVER_ASSIGNED
  → AMBULANCE_EN_ROUTE
  → ARRIVED_AT_SCENE
  → TEMP_CASE_CREATED  (UNKNOWN patient only)
  → VITALS_RECORDED
  → HOSPITAL_ASSIGNED
  → EN_ROUTE_TO_HOSPITAL
  → ARRIVED_AT_HOSPITAL
  → HANDOFF_COMPLETE
```

---

### 4.1 Create Dispatch (Patient SOS)

```
POST /api/dispatch/create
```

**Request:**
```json
{
  "location": {
    "latitude": 22.7196,
    "longitude": 75.8577
  },
  "source": "PATIENT_APP",
  "patientName": "Rahul Sharma",
  "patientId": "000000000000",
  "patientIdentity": "KNOWN",
  "requesterPatientId": "000000000000"
}
```

**Field explanations:**
- `patientIdentity`: `"KNOWN"` = patient is the app user (has medical records). `"UNKNOWN"` = someone else / unidentified person
- `patientId`: the logged-in patient's user ID
- `requesterPatientId`: same as patientId — used by paramedic to fetch medical records
- `source`: always `"PATIENT_APP"` from mobile app

**Response (201):**
```json
{
  "dispatchId": "DISP-1234567890-5678",
  "priority": "HIGH",
  "status": "WAITING_FOR_DRIVER",
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

**After creating, emit Socket.IO event:**
```json
Event: "DISPATCH_CREATED"
Payload: {
  "dispatchId": "string",
  "location": { "latitude": 0, "longitude": 0 },
  "priority": "HIGH",
  "patientName": "string",
  "patientIdentity": "KNOWN | UNKNOWN",
  "status": "WAITING_FOR_DRIVER",
  "createdAt": "ISO string"
}
```
Emit to all connected clients (broadcast).

---

### 4.2 Get Pending Dispatches (Driver)

```
GET /api/dispatch/pending
```

**Response:**
```json
[
  {
    "dispatchId": "string",
    "location": { "latitude": 0, "longitude": 0 },
    "source": "PATIENT_APP",
    "priority": "HIGH",
    "status": "WAITING_FOR_DRIVER",
    "assignedDriverId": null,
    "patientName": "string",
    "patientId": "string",
    "patientIdentity": "KNOWN | UNKNOWN",
    "requesterPatientId": "string",
    "tempCaseId": null,
    "timeline": [],
    "createdAt": "ISO string"
  }
]
```

**Rules:**
- Only return dispatches with status `WAITING_FOR_DRIVER`
- Sort by priority: `CRITICAL → HIGH → MEDIUM → LOW`, then by `createdAt` ascending
- Return empty array `[]` if none pending (never return 404)

---

### 4.3 Accept Dispatch (Driver)

```
POST /api/dispatch/accept
```

**Request:**
```json
{
  "dispatchId": "string",
  "driverId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "dispatch": { ...full dispatch object... }
}
```

**Rules:**
- Change status to `DRIVER_ASSIGNED`
- If dispatch not found or already assigned → `404 { "message": "Dispatch not found or already assigned" }`

**Emit socket event:**
```json
Event: "DISPATCH_STATE_UPDATE"
Payload: {
  "dispatchId": "string",
  "state": "DRIVER_ASSIGNED",
  "assignedDriverId": "string"
}
```
Emit to ALL clients (broadcast).

---

### 4.4 Update Dispatch Status

```
POST /api/dispatch/status
```

**Request:**
```json
{
  "dispatchId": "string",
  "status": "AMBULANCE_EN_ROUTE"
}
```

**Response:**
```json
{ "success": true }
```

**Valid status values:**
`AMBULANCE_EN_ROUTE`, `ARRIVED_AT_SCENE`, `TEMP_CASE_CREATED`, `VITALS_RECORDED`, `HOSPITAL_ASSIGNED`, `EN_ROUTE_TO_HOSPITAL`, `ARRIVED_AT_HOSPITAL`, `HANDOFF_COMPLETE`

**Emit two socket events:**

Event 1:
```json
Event: "DISPATCH_STATE_UPDATE"
Payload: { "dispatchId": "string", "state": "string" }
```

Event 2 (to dispatch room only):
```json
Event: "STATUS_UPDATE"
Payload: {
  "dispatchId": "string",
  "status": "string",
  "message": "Human readable message",
  "timestamp": "10:30 AM"
}
```

**Status → Human message mapping:**
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

### 4.5 Get Active Dispatch (Paramedic)

```
GET /api/dispatch/active
```

**Response:** Single dispatch object (same shape as pending list item)

**Rules:**
- Return the most recently created dispatch that is NOT `HANDOFF_COMPLETE`
- This includes `WAITING_FOR_DRIVER` — paramedic should see it immediately after patient SOS
- If none → `404 { "message": "No active dispatch" }`

---

### 4.6 Get Single Dispatch

```
GET /api/dispatch/:dispatchId
```

**Response:** Full dispatch object or `404`

---

### 4.7 Get Dispatch Timeline

```
GET /api/dispatch/:dispatchId/timeline
```

**Response:**
```json
[
  { "event": "DISPATCH_CREATED",    "time": "10:30 AM", "status": "completed" },
  { "event": "DRIVER_ASSIGNED",     "time": "10:32 AM", "status": "completed" },
  { "event": "AMBULANCE_EN_ROUTE",  "time": "Pending",  "status": "pending" },
  ...
]
```

**Timeline events for KNOWN patient (9 events):**
```
DISPATCH_CREATED, DRIVER_ASSIGNED, AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE,
VITALS_RECORDED, HOSPITAL_ASSIGNED, EN_ROUTE_TO_HOSPITAL, ARRIVED_AT_HOSPITAL, HANDOFF_COMPLETE
```

**Timeline events for UNKNOWN patient (10 events — includes TEMP_CASE_CREATED):**
```
DISPATCH_CREATED, DRIVER_ASSIGNED, AMBULANCE_EN_ROUTE, ARRIVED_AT_SCENE,
TEMP_CASE_CREATED, VITALS_RECORDED, HOSPITAL_ASSIGNED, EN_ROUTE_TO_HOSPITAL,
ARRIVED_AT_HOSPITAL, HANDOFF_COMPLETE
```

**Event status values:** `"completed"`, `"active"`, `"pending"`

---

## 5. Emergency Cases

Emergency cases are the medical sub-records linked to a dispatch.

---

### 5.1 Create Emergency Case (Legacy / Standalone)

```
POST /api/emergency/create
```

**Request:**
```json
{
  "patientName": "string",
  "location": { "latitude": 0, "longitude": 0 },
  "symptoms": ["string"],
  "severity": "HIGH"
}
```

**Response (201):**
```json
{
  "caseId": "CASE-xxx",
  "temporaryPatientId": "TMP-xxx",
  "status": "PENDING",
  "severity": "HIGH",
  "assignedHospital": { ...hospital object... },
  "createdAt": "ISO string"
}
```

---

### 5.2 Create Temp Case (Unknown Patient — Paramedic at Scene)

```
POST /api/emergency/create-temp
```

**Request:**
```json
{
  "dispatchId": "DISP-xxx",
  "patientName": "Unknown Male",
  "symptoms": ["Cardiac", "Unconscious"],
  "location": { "latitude": 0, "longitude": 0 }
}
```

**Response (201):**
```json
{
  "tempCaseId": "TMP-XXXX",
  "dispatchId": "DISP-xxx",
  "temporaryPatientId": "TMP-XXXX",
  "status": "TEMP_CASE_CREATED",
  "createdAt": "ISO string"
}
```

**Rules:**
- Generate a short readable temp ID like `TMP-A3F2`
- Link this temp case to the dispatch (store `tempCaseId` on dispatch)
- Automatically advance dispatch status to `TEMP_CASE_CREATED`

**Emit socket event:**
```json
Event: "DISPATCH_STATE_UPDATE"
Payload: { "dispatchId": "string", "state": "TEMP_CASE_CREATED", "tempCaseId": "string" }
```

---

### 5.3 Submit Vitals

```
POST /api/emergency/vitals
```

**Request:**
```json
{
  "caseId": "DISP-xxx OR CASE-xxx OR TMP-xxx",
  "vitals": {
    "heartRate": "115",
    "oxygenSaturation": "94",
    "bloodPressure": "105/70",
    "temperature": "101.2",
    "respiratoryRate": "22"
  }
}
```

**IMPORTANT:** `caseId` can be a dispatch ID (KNOWN patient flow) or a case/temp ID. Backend must handle all three.

**Response:**
```json
{
  "success": true,
  "severity": "HIGH",
  "triageScore": 5
}
```

**NEWS2 Triage Scoring Algorithm (must match exactly):**

```
Respiratory Rate (breaths/min):
  ≤8 or ≥25  → +3
  21–24      → +2
  9–11       → +1
  12–20      → +0

SpO2 (%):
  ≤91        → +3
  92–93      → +2
  94–95      → +1
  ≥96        → +0

Heart Rate (BPM):
  ≤40 or ≥131 → +3
  111–130     → +2
  ≤50 or 91–110 → +1
  51–90       → +0

Systolic BP (mmHg):
  ≤90 or ≥220 → +3
  91–100      → +2
  101–110     → +1
  111–219     → +0

Temperature (°F):
  ≤95.0       → +3
  ≥102.4      → +2
  ≤96.8 or 100.6–102.2 → +1
  96.9–100.5  → +0

Severity from total score:
  ≥7  → CRITICAL
  5–6 → HIGH
  3–4 → MEDIUM
  0–2 → NORMAL
```

**Rules:**
- Advance dispatch status to `VITALS_RECORDED` after saving
- All vitals fields are strings (parse to numbers before scoring)

---

### 5.4 Get Active Case

```
GET /api/emergency/active
```

Returns the most recent non-completed emergency case. `404` if none.

---

### 5.5 Get Timeline

```
GET /api/emergency/timeline/:caseId
GET /api/emergency/:caseId/timeline
```

Both routes must work. Returns array of timeline events.

---

## 6. Patient Records

### 6.1 Get Patient Profile

```
GET /api/patient/profile/:patientId
```

**Response:**
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

**Rules:**
- `patientId` comes from the dispatch's `requesterPatientId` field
- If patient not found, return a default object (not 404) — paramedic must always see something:
```json
{
  "id": "patientId",
  "name": "Unknown Patient",
  "bloodGroup": "Unknown",
  "allergies": [],
  "chronicConditions": [],
  "aadhaar": ""
}
```

---

### 6.2 Get Medical Records

```
GET /api/patient/records/:patientId
```

**Response:**
```json
[
  {
    "id": "rec_01",
    "type": "LAB_REPORT | PRESCRIPTION | IMAGING | VACCINATION",
    "title": "Blood Sugar Fasting",
    "date": "2026-02-15",
    "provider": "City Diagnostics",
    "result": "142 mg/dL"
  }
]
```

Returns empty array `[]` if no records (never 404).

---

### 6.3 Add Medical Record

```
POST /api/patient/records
```

**Request:**
```json
{
  "patientId": "string",
  "record": {
    "type": "LAB_REPORT",
    "title": "string",
    "date": "YYYY-MM-DD",
    "provider": "string",
    "result": "string (optional)"
  }
}
```

**Response (201):** The created record with generated `id`.

---

## 7. Hospital System

### 7.1 Search Hospitals

```
POST /api/hospital/search
```

**Request:**
```json
{
  "capability": "CARDIAC_CENTER (optional)",
  "severity": "HIGH (optional)",
  "location": { "latitude": 0, "longitude": 0 }
}
```

**Response:** Array of hospital objects sorted by proximity to `location`.

**Hospital object shape:**
```json
{
  "id": "hosp02",
  "name": "Apollo Heart Institute",
  "address": "45 Cardiac Drive, Westside",
  "location": { "latitude": 22.7833, "longitude": 75.9237 },
  "type": "PRIVATE | GOVERNMENT | SPECIALTY",
  "capabilities": ["CARDIAC_CENTER", "GENERAL_EMERGENCY"],
  "currentOccupancy": 40,
  "emergencyPreparednessStatus": "ICU Bed Reserved",
  "availableBeds": 12
}
```

**Capability values:**
`LEVEL_1_TRAUMA`, `CARDIAC_CENTER`, `BURN_UNIT`, `GENERAL_EMERGENCY`

---

### 7.2 Assign Hospital

```
POST /api/hospital/assign
```

**Request:**
```json
{
  "caseId": "DISP-xxx OR CASE-xxx",
  "hospitalId": "hosp02"
}
```

**Response:**
```json
{
  "success": true,
  "hospital": { ...full hospital object... }
}
```

**Rules:**
- `caseId` can be a dispatch ID or case ID — handle both
- Advance dispatch status to `HOSPITAL_ASSIGNED`
- Store the assigned hospital on the dispatch/case record

**Emit socket event:**
```json
Event: "HOSPITAL_ASSIGNED"
Payload: {
  "caseId": "string",
  "hospital": { ...full hospital object... }
}
```
Emit to ALL clients (broadcast).

---

### 7.3 Get Assigned Hospital

```
GET /api/hospital/assigned/:caseId
```

**Response:** Hospital object or `404 { "message": "No hospital assigned yet" }`

---

### 7.4 Recommend Hospital (AI placeholder)

```
POST /api/hospital/recommend
```

**Request:**
```json
{
  "severity": "HIGH",
  "location": { "latitude": 0, "longitude": 0 },
  "capability": "CARDIAC_CENTER"
}
```

**Response:**
```json
{
  "recommended": { ...hospital object... },
  "confidence": 0.92,
  "reason": "Nearest available with matching capability"
}
```

---

## 8. Ambulance Location

### 8.1 Send Location Update (Driver → Backend)

```
POST /api/ambulance/location
```

**Request:**
```json
{
  "caseId": "string (dispatchId or caseId)",
  "latitude": 22.7196,
  "longitude": 75.8577
}
```

**Response:**
```json
{ "success": true, "speed": 8.5 }
```

**Rules:**
- Calculate speed from previous location update (m/s)
- Broadcast to all clients in the case/dispatch room via socket

**Emit socket event:**
```json
Event: "AMBULANCE_LOCATION_UPDATE"
Payload: {
  "caseId": "string",
  "latitude": 0,
  "longitude": 0,
  "speed": 8.5,
  "timestamp": "ISO string"
}
```

---

## 9. Routing (OSRM Proxy)

### 9.1 Get Driving Route

```
GET /api/routes/driving/:coords
```

Where `:coords` = `startLng,startLat;endLng,endLat`

Example: `GET /api/routes/driving/75.8577,22.7196;75.9237,22.7833`

**Response:** OSRM-compatible response:
```json
{
  "code": "Ok",
  "routes": [
    {
      "geometry": {
        "type": "LineString",
        "coordinates": [[lng, lat], [lng, lat], ...]
      },
      "distance": 4200.5,
      "duration": 840.0
    }
  ],
  "eta": 14
}
```

**Rules:**
- Proxy to `https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson`
- If OSRM fails, return a fallback straight-line route (do not return 500)
- `eta` = estimated minutes (distance / 10 m/s / 60)

---

## 10. Triage (AI Placeholder)

```
POST /api/triage/analyze
```

**Request:**
```json
{
  "symptoms": ["Chest pain"],
  "vitals": {
    "heartRate": "115",
    "oxygenSaturation": "94"
  }
}
```

**Response:**
```json
{
  "severity": "HIGH",
  "triageScore": 5,
  "confidence": 0.87,
  "model": "triage-v1"
}
```

This endpoint is a placeholder for future AI integration. Use the same NEWS2 scoring logic as `/api/emergency/vitals`.

---

## 11. Socket.IO — Complete Event Reference

### Server URL
Same as REST API: `http://<server>:3000`

### Rooms
The frontend joins rooms using these events. Backend must support them:

| Client Event | Description |
|---|---|
| `JOIN_CASE` | `{ caseId }` — joins room for ambulance tracking (legacy) |
| `JOIN_DISPATCH` | `{ dispatchId }` — joins room for dispatch tracking (new flow) |
| `JOIN_DRIVERS` | no payload — joins global `drivers` room |

### Events Backend Must Emit

| Event | When | Payload |
|---|---|---|
| `DISPATCH_CREATED` | New dispatch created | `{ dispatchId, location, priority, patientName, patientIdentity, status, createdAt }` |
| `DISPATCH_STATE_UPDATE` | Any status change | `{ dispatchId, state }` |
| `STATUS_UPDATE` | Any status change | `{ dispatchId, status, message, timestamp }` |
| `AMBULANCE_LOCATION_UPDATE` | Driver sends GPS | `{ caseId, latitude, longitude, speed, timestamp }` |
| `HOSPITAL_ASSIGNED` | Hospital assigned | `{ caseId, hospital }` |

### Events Backend Must Listen For

| Event | When | Action |
|---|---|---|
| `AMBULANCE_LOCATION_UPDATE` | Driver sends GPS via socket | Broadcast to case/dispatch room |
| `JOIN_CASE` | Client joins | Add socket to room |
| `JOIN_DISPATCH` | Client joins | Add socket to room |
| `JOIN_DRIVERS` | Driver connects | Add socket to `drivers` room |

---

## 12. Data Models (Database Schema Reference)

### User
```
id            string (primary key)
name          string
phone         string
role          PATIENT | PARAMEDIC | DRIVER
passwordHash  string
createdAt     datetime
```

### Dispatch
```
dispatchId          string (primary key, format: DISP-xxx)
patientId           string (FK → User)
patientName         string
patientIdentity     KNOWN | UNKNOWN
requesterPatientId  string (FK → User, same as patientId for KNOWN)
location            json { latitude, longitude }
source              PATIENT_APP | CALL_CENTER | SYSTEM
priority            LOW | MEDIUM | HIGH | CRITICAL
status              (see lifecycle above)
assignedDriverId    string (FK → User, nullable)
tempCaseId          string (FK → EmergencyCase, nullable)
assignedHospitalId  string (FK → Hospital, nullable)
timeline            json array
createdAt           datetime
updatedAt           datetime
```

### EmergencyCase
```
caseId              string (primary key)
dispatchId          string (FK → Dispatch, nullable)
temporaryPatientId  string
patientName         string
location            json
symptoms            json array
severity            NORMAL | MEDIUM | HIGH | CRITICAL | NOT_ASSESSED
status              string
vitals              json (nullable)
triageScore         integer (nullable)
assignedHospitalId  string (FK → Hospital, nullable)
createdAt           datetime
```

### PatientProfile
```
patientId           string (FK → User, primary key)
bloodGroup          string
allergies           json array
chronicConditions   json array
aadhaarNumber       string (encrypted)
```

### MedicalRecord
```
id          string (primary key)
patientId   string (FK → User)
type        LAB_REPORT | PRESCRIPTION | IMAGING | VACCINATION
title       string
date        date
provider    string
result      string (nullable)
createdAt   datetime
```

### Hospital
```
id                          string (primary key)
name                        string
address                     string
location                    json { latitude, longitude }
type                        GOVERNMENT | PRIVATE | SPECIALTY
capabilities                json array
currentOccupancy            integer (percentage)
emergencyPreparednessStatus string
availableBeds               integer
```

---

## 13. Error Response Format

All errors must follow this format:
```json
{
  "message": "Human readable error description"
}
```

Standard HTTP codes:
- `400` — Bad request / missing required fields
- `401` — Unauthorized (invalid/missing token)
- `404` — Resource not found
- `500` — Internal server error

---

## 14. CORS

Allow all origins during development:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Socket.IO CORS:
```js
cors: { origin: "*", methods: ["GET", "POST"] }
```

---

## 15. Complete API Endpoint List

| Method | Endpoint | Used By |
|--------|----------|---------|
| POST | `/api/auth/login` | All roles |
| POST | `/api/auth/patient/register` | Patient |
| POST | `/api/dispatch/create` | Patient |
| GET | `/api/dispatch/pending` | Driver |
| POST | `/api/dispatch/accept` | Driver |
| POST | `/api/dispatch/status` | Driver, Paramedic |
| GET | `/api/dispatch/active` | Paramedic |
| GET | `/api/dispatch/:id` | All |
| GET | `/api/dispatch/:id/timeline` | All |
| POST | `/api/emergency/create` | Paramedic (standalone) |
| POST | `/api/emergency/create-temp` | Paramedic (unknown patient) |
| POST | `/api/emergency/vitals` | Paramedic |
| GET | `/api/emergency/active` | Patient, Paramedic |
| GET | `/api/emergency/timeline/:caseId` | All |
| GET | `/api/emergency/:caseId/timeline` | All |
| GET | `/api/patient/profile/:patientId` | Paramedic |
| GET | `/api/patient/records/:patientId` | Paramedic, Patient |
| POST | `/api/patient/records` | Paramedic |
| POST | `/api/hospital/search` | Paramedic |
| POST | `/api/hospital/assign` | Paramedic |
| GET | `/api/hospital/assigned/:caseId` | Driver, Patient |
| POST | `/api/hospital/recommend` | Paramedic (AI) |
| POST | `/api/ambulance/location` | Driver |
| GET | `/api/routes/driving/:coords` | Driver, Patient |
| POST | `/api/triage/analyze` | Paramedic (AI) |

---

## 16. Critical Rules (Do Not Break These)

1. **Field names are fixed.** The frontend reads `dispatchId`, `patientIdentity`, `requesterPatientId`, `assignedDriverId`, `tempCaseId` — exact spelling, exact casing.

2. **Socket event names are fixed.** `DISPATCH_CREATED`, `DISPATCH_STATE_UPDATE`, `STATUS_UPDATE`, `AMBULANCE_LOCATION_UPDATE`, `HOSPITAL_ASSIGNED` — exact uppercase spelling.

3. **NEWS2 scoring must match exactly.** The frontend calculates the score live as the paramedic types vitals. The backend must return the same score for the same inputs.

4. **`GET /api/dispatch/active` must return `WAITING_FOR_DRIVER` dispatches.** Paramedic needs to see the dispatch immediately after patient creates SOS.

5. **`GET /api/dispatch/pending` must return empty array `[]` when no pending dispatches.** Never return 404 for this endpoint.

6. **`GET /api/patient/records/:patientId` must return empty array `[]` when no records.** Never return 404.

7. **Hospital assignment must emit `HOSPITAL_ASSIGNED` socket event to ALL clients.** The patient's tracking screen listens for this to show the hospital marker on the map.

8. **Ambulance location updates must be broadcast to the dispatch room** (using `dispatchId` as room key) — not just the case room. The patient joins the dispatch room, not the case room.

9. **`caseId` in vitals and hospital assign can be a dispatch ID.** For KNOWN patients, the frontend passes the `dispatchId` as the `caseId`. Backend must handle this.

10. **Token must be accepted as `Authorization: Bearer <token>` header.** The frontend sends it on every request automatically.

---

## 17. Future AI Integration Points

These endpoints are placeholders now but will connect to real AI models later:

- `POST /api/triage/analyze` — AI triage scoring
- `POST /api/hospital/recommend` — AI hospital recommendation based on patient condition, distance, capacity
- Patient record analysis for paramedic decision support

Design the database schema to support these without breaking changes.
