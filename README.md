# 🏥 PulseNet: Proactive Unified Logistics System for Emergency Networking Equipment Tracking

**PulseNet** is an advanced, real-time emergency healthcare resource coordination platform designed to optimize emergency responses, ambulance dispatch, patient transfers, and resource allocation. Centered around a realistic regional healthcare ecosystem (currently mapped to Indore, Madhya Pradesh, India), the platform coordinates critical data between dispatchers, hospital administrators, paramedics, and patients.

---

## 🚀 Key Features

*   **AI-Powered Hospital Recommendation**: Utilizes a Python-based FastAPI service running a trained XGBoost model to evaluate patient vitals (NEWS2 score, heart rate, oxygen level, BP, etc.), estimated travel times, traffic, and hospital load to recommend the optimal destination.
*   **Real-time Map & Routing**: Integrated Leaflet Maps with routing services to track ambulance locations, calculate shortest routes, and estimate travel times dynamically.
*   **Emergency QR Code Integration**: Patients get a unique medical QR code that allows paramedics or emergency response teams to scan and instantly pull up crucial medical records, allergies, chronic conditions, and current medications.
*   **Comprehensive Dashboards**:
    *   **System Admin**: Manage hospital approvals, view system-wide metrics, and oversee the entire emergency coordination network.
    *   **Hospital Admin**: Monitor available beds (ICU and General), manage the ambulance fleet, accept incoming emergency/transfer cases, and dispatch vehicles.
    *   **Patient Portal**: Access digital health cards, review consultation visits, and manage emergency access settings.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (v19) with Vite (v7)
*   **Styling**: Vanilla CSS, TailwindCSS (v4), Framer Motion (for smooth micro-animations)
*   **Maps & Navigation**: Leaflet, React-Leaflet, Leaflet Routing Machine, Mapbox Polyline
*   **Visualization**: Recharts (for health metrics and occupancy stats)

### Backend
*   **Core**: Java 17, Spring Boot 3.2
*   **Database**: PostgreSQL
*   **Data Access**: Spring Data JPA / Hibernate
*   **Security**: JWT-based stateless authentication, Spring Security
*   **Integrations**: Gemini AI (for medical summaries), Cloudflare R2 (for document/image hosting)

### Machine Learning & AI
*   **Service**: Python 3.13, FastAPI, Uvicorn
*   **Model**: XGBoost (XGB Classifier), Scikit-Learn
*   **Clinical Logic**: NEWS2 (National Early Warning Score) medical algorithm

---

## 📐 System Architecture

```
                       ┌─────────────────────────┐
                       │     React Frontend      │
                       │     (Vite + Leaflet)    │
                       └────────────┬────────────┘
                                    │
                                    │ HTTP / REST
                                    ▼
                       ┌─────────────────────────┐
                       │   Spring Boot Backend   │
                       └──────┬───────────┬──────┘
                              │           │
           JPA / PostgreSQL   │           │ HTTP / JSON
                              ▼           ▼
                      ┌───────────┐   ┌───────────────────────────┐
                      │PostgreSQL │   │     FastAPI ML Service    │
                      │ Database  │   │  (XGBoost Recommendation) │
                      └───────────┘   └───────────────────────────┘
```

---

## 📦 Project Structure

```
Prayatna_Final_Submission/
├── frontend/               # React Vite UI client
├── backend/                # Spring Boot REST API
├── ml/                     # Python FastAPI & XGBoost models
├── apache-maven-3.9.6/     # Local Maven configuration
└── README.md               # Project documentation
```

---

## ⚙️ Setup & Running Instructions

### Prerequisites
*   Java 17 or higher
*   PostgreSQL installed and running
*   Python 3.10+
*   Node.js (v18+) & npm

---

### Step 1: Set Up the Database
1.  Open your PostgreSQL CLI or pgAdmin and create a database named `pulsenet`:
    ```sql
    CREATE DATABASE pulsenet;
    ```
2.  Open `backend/src/main/resources/application.properties` and verify your credentials:
    ```properties
    spring.datasource.username=postgres
    spring.datasource.password=your_db_password
    ```

---

### Step 2: Start the Python ML Service
1.  Navigate to the `ml` directory:
    ```bash
    cd ml
    ```
2.  Set up the virtual environment:
    ```bash
    python -m venv venv
    venv\Scripts\activate      # On Windows
    source venv/bin/activate   # On macOS/Linux
    ```
3.  Install requirements:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the service:
    ```bash
    python start_ai_service.py
    ```
    *The service will be active at:* [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

### Step 3: Run the Spring Boot Backend
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Run the application using the local Maven wrapper:
    ```bash
    ..\apache-maven-3.9.6\bin\mvn spring-boot:run
    ```
    *The backend will boot on port `8080` and seed initial database records automatically.*

---

### Step 4: Run the React Frontend
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *Access the web app at:* [http://localhost:5173/](http://localhost:5173/)

---

## 🔐 Seeded Test Credentials

To log in and experience the full capabilities of the platform, use these pre-configured user credentials:

| Role | Email Address | Password | Purpose |
|---|---|---|---|
| **System Admin** | `sysadmin@pulsenet.gov.in` | `PulseNet@2024` | Approve hospitals, track platform statistics |
| **Hospital Admin (MY Hospital)** | `admin.myhospital@pulsenet.in` | `hospital123` | Dispatch ambulances, manage ICU beds |
| **Hospital Admin (Choithram)** | `admin.choithram@pulsenet.in` | `hospital123` | Dispatch ambulances, manage ICU beds |
| **Hospital Admin (Bombay Hospital)** | `admin.bombay@pulsenet.in` | `hospital123` | Dispatch ambulances, manage ICU beds |
| **General Patient (User 1)** | `rahul.sharma@gmail.com` | `rahul123` | View health QR code, personal medical history |
| **General Patient (User 2)** | `priya.patel@gmail.com` | `priya123` | View health QR code, personal medical history |
