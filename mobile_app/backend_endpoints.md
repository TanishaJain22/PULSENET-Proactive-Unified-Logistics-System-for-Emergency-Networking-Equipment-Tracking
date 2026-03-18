# HealthcareApp Backend API Specification

This document defines the backend endpoints required by the HealthcareApp frontend. All endpoints are expected to consume and produce `application/json` unless otherwise specified.

---

## 1. Authentication & User Management
Base Path: `/api/auth` or `/api/patient`

### 1.1. User Login
*   **Endpoint:** `POST /auth/login`
*   **Description:** Authenticates a user (Patient, Paramedic, Driver, etc.) and returns a session token.
*   **Request Body:**
    ```json
    {
      "username": "string",
      "password": "password_string"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "user": {
        "id": "string",
        "name": "string",
        "role": "PATIENT | PARAMEDIC | DRIVER | ADMIN",
        "email": "string"
      },
      "token": "jwt_token_string"
    }
    ```

### 1.2. Patient Registration
*   **Endpoint:** `POST /patient/register`
*   **Description:** Registers a new patient.
*   **Request Body:**
    ```json
    {
      "name": "string",
      "email": "string",
      "password": "password_string",
      "phone": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "bloodGroup": "string (optional)"
    }
    ```
*   **Successful Response (201 Created):** Returns user details and token similar to Login.

---

## 2. Emergency Management
Base Path: `/api/emergency`

### 2.1. Create Emergency Case
*   **Endpoint:** `POST /emergency/create`
*   **Description:** Initiates a new emergency request (SOS).
*   **Request Body:**
    ```json
    {
      "patientName": "string",
      "location": {
        "latitude": 0.000,
        "longitude": 0.000
      },
      "symptoms": ["string"],
      "severity": "NORMAL | HIGH | CRITICAL (Calculated frontend or backend)"
    }
    ```
*   **Successful Response (201 Created):**
    ```json
    {
      "id": "case_id_string",
      "status": "PENDING",
      "createdAt": "timestamp"
    }
    ```

### 2.2. Submit Vitals
*   **Endpoint:** `POST /emergency/vitals`
*   **Description:** Submits or updates patient vitals for a specific case. This may trigger backend triage scoring.
*   **Request Body:**
    ```json
    {
      "caseId": "string",
      "vitals": {
        "heartRate": 80,
        "bloodPressure": "120/80",
        "oxygenLevel": 98,
        "temperature": 98.6
      }
    }
    ```
*   **Successful Response (200 OK):** Acknowledgement or updated triage state.

### 2.3. Update Emergency Status
*   **Endpoint:** `POST /emergency/status`
*   **Description:** Updates the state of the emergency (e.g., ASSIGNED, EN_ROUTE, ARRIVED).
*   **Request Body:**
    ```json
    {
      "caseId": "string",
      "status": "ASSIGNED | EN_ROUTE | ARRIVED | RESOLVED"
    }
    ```
*   **Successful Response (200 OK):** Broadcast/Ack.

---

## 3. Ambulance & Tracking
Base Path: `/api/ambulance` & `/api/emergency`

### 3.1. Send Location Update
*   **Endpoint:** `POST /ambulance/location`
*   **Description:** Continuously publishes the ambulance's live location for tracking by patient/hospital.
*   **Request Body:**
    ```json
    {
      "caseId": "string",
      "latitude": 0.000,
      "longitude": 0.000
    }
    ```
*   **Successful Response (200 OK)**

### 3.2. Confirm Arrival
*   **Endpoint:** `POST /emergency/arrival`
*   **Description:** Confirms the ambulance has arrived at the patient or hospital.
*   **Request Body:**
    ```json
    {
      "caseId": "string"
    }
    ```
*   **Successful Response (200 OK)**

---

## 4. Hospital & Resource Allocation
Base Path: `/api/hospital`

### 4.1. Search Hospitals
*   **Endpoint:** `POST /hospital/search`
*   **Description:** Discovers nearby hospitals matching required medical capabilities.
*   **Request Body:**
    ```json
    {
      "capability": "TRAUMA | CARDIAC | BURN | GENERAL (Optional)",
      "severity": "CRITICAL (Optional)"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    [
      {
        "id": "string",
        "name": "string",
        "location": { "latitude": 0.0, "longitude": 0.0 },
        "capabilities": ["TRAUMA", "CARDIAC"],
        "availableBeds": 12
      }
    ]
    ```

### 4.2. Assign Hospital
*   **Endpoint:** `POST /hospital/assign`
*   **Description:** Assigns a specific hospital to an emergency case.
*   **Request Body:**
    ```json
    {
      "caseId": "string",
      "hospitalId": "string"
    }
    ```
*   **Successful Response (200 OK)**

### 4.3. Get Assigned Hospital
*   **Endpoint:** `GET /hospital/assigned/:caseId`
*   **Description:** Retrieves hospital details assigned to an ongoing emergency case.
*   **Successful Response (200 OK):** Same hospital object as returned in Hospital Search.

---

## 5. Patient Profile & Records
Base Path: `/api/patient`

### 5.1. Get Profile
*   **Endpoint:** `GET /patient/profile/:patientId`
*   **Description:** Fetches personal and basic medical info of a patient.
*   **Successful Response (200 OK):**
    ```json
    {
      "id": "string",
      "name": "string",
      "bloodGroup": "O+",
      "allergies": ["Penicillin"],
      "chronicConditions": ["Asthma"]
    }
    ```

### 5.2. Update Emergency Contacts
*   **Endpoint:** `POST /patient/contacts`
*   **Description:** Updates emergency contact list.
*   **Request Body:**
    ```json
    {
      "contacts": [
        {
          "name": "string",
          "phone": "string",
          "relation": "string"
        }
      ]
    }
    ```
*   **Successful Response (200 OK)**

### 5.3. Get Medical Records
*   **Endpoint:** `GET /patient/records/:patientId`
*   **Description:** Retrieves historical medical records or past emergency logs.
*   **Successful Response (200 OK):**
    ```json
    [
      {
        "recordId": "string",
        "date": "timestamp",
        "type": "string",
        "summary": "string"
      }
    ]
    ```

---

## 6. Routing (OSRM Proxy)
Base Path: `/api/routes`

### 6.1. Fetch Driving Route
*   **Endpoint:** `GET /routes/driving/:startLng,:startLat;:endLng,:endLat`
*   **Description:** Proxies requests to an OSRM backend to calculate distances and driving geometry.
*   **Successful Response (200 OK):** Standard OSRM JSON response containing `routes[0].geometry.coordinates`, `distance`, and `duration`.
