# PulseNet AI Hospital Recommendation Service

## Quick Start

### 1. Start the Python AI Service

```bash
# From the project root directory
cd ml
python start_ai_service.py
```

Or manually:

```bash
cd ml
pip install -r requirements.txt
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Verify the Service is Running

- **Health Check**: http://127.0.0.1:8000/health
- **API Documentation**: http://127.0.0.1:8000/docs
- **Service Info**: http://127.0.0.1:8000/

### 3. Start the Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

## Service Architecture

```
Frontend (React) → Spring Boot Backend → Python FastAPI → XGBoost Model
                                     ↓
                              PostgreSQL Database
```

## API Contract

The Python service expects this exact JSON structure:

```json
{
  "heart_rate": 145,
  "oxygen_level": 88.0,
  "temperature": 36.5,
  "bp_systolic": 80,
  "bp_diastolic": 50,
  "respiratory_rate": 28,
  "supplemental_o2": 1,
  "consciousness_level": 1,
  "severity_level": 8,
  "estimated_travel_time": 12.0,
  "specialty_encoded": 4,
  "traffic_encoded": 1,
  "hospitals": [
    {
      "hospital_id": 0,
      "icu_beds": 5,
      "general_beds": 20,
      "ventilator": 3,
      "specialist": 2,
      "load": 75.0,
      "distance": 5.2
    }
    // ... 4 more hospitals (exactly 5 total)
  ],
  "patient_id": "P12345"
}
```

## Model Integration

### Current Status
- ✅ FastAPI service created
- ✅ XGBoost model loading implemented
- ✅ NEWS2 score calculation
- ✅ Spring Boot integration ready
- ✅ Fallback algorithm for when model is unavailable

### Model Files
- `models/hospital_assignment_model_xgb.pkl` - Main XGBoost model
- `models/hospital_assignment_model.pkl` - Alternative model

### Features Used by Model
The model expects these 38 features in exact order:
- Patient vitals: heart_rate, oxygen_level, bp_systolic, bp_diastolic, temperature
- Clinical: respiratory_rate, supplemental_o2, consciousness_level, severity_level
- Context: estimated_travel_time, specialty_encoded, traffic_encoded
- Hospital data: h0_* through h4_* (6 features × 5 hospitals = 30 features)

## Testing the Integration

### 1. Test Python Service Directly

```bash
curl -X POST "http://127.0.0.1:8000/get_top_hospitals" \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 145,
    "oxygen_level": 88.0,
    "temperature": 36.5,
    "bp_systolic": 80,
    "bp_diastolic": 50,
    "respiratory_rate": 28,
    "supplemental_o2": 1,
    "consciousness_level": 1,
    "severity_level": 8,
    "estimated_travel_time": 12.0,
    "specialty_encoded": 4,
    "traffic_encoded": 1,
    "hospitals": [
      {"hospital_id": 0, "icu_beds": 5, "general_beds": 20, "ventilator": 3, "specialist": 2, "load": 75.0, "distance": 5.2},
      {"hospital_id": 1, "icu_beds": 2, "general_beds": 15, "ventilator": 1, "specialist": 1, "load": 85.0, "distance": 8.1},
      {"hospital_id": 2, "icu_beds": 8, "general_beds": 30, "ventilator": 5, "specialist": 3, "load": 60.0, "distance": 12.5},
      {"hospital_id": 3, "icu_beds": 0, "general_beds": 10, "ventilator": 0, "specialist": 0, "load": 95.0, "distance": 3.2},
      {"hospital_id": 4, "icu_beds": 6, "general_beds": 25, "ventilator": 4, "specialist": 2, "load": 70.0, "distance": 15.8}
    ],
    "patient_id": "TEST-001"
  }'
```

### 2. Test via Spring Boot

Use the hospital transfers page in the frontend to create a transfer request.

## Troubleshooting

### Python Service Won't Start
- Check if port 8000 is available: `lsof -i :8000`
- Install dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (requires Python 3.7+)

### Model Loading Issues
- Verify model file exists: `ls -la models/`
- Check file permissions
- Service will use fallback algorithm if model fails to load

### Spring Boot Connection Issues
- Verify Python service is running: `curl http://127.0.0.1:8000/health`
- Check Spring Boot logs for connection errors
- Ensure `ai.python.base-url=http://127.0.0.1:8000` in application.properties

## Logs and Monitoring

### Python Service Logs
The service logs all requests and model predictions:
```
INFO: Processing recommendation request for patient: P12345
INFO: Patient NEWS2 score: 11
INFO: Using trained XGBoost model for prediction
INFO: XGBoost model predicted hospital: 2
INFO: Generated 5 recommendations using XGBoost model
```

### Spring Boot Logs
Check for Python AI service calls:
```
INFO: Calling Python AI service for patient: P12345
INFO: Using fallback recommendation algorithm (if Python service is down)
```

## Next Steps

1. **Start Python Service**: `cd ml && python start_ai_service.py`
2. **Start Spring Boot**: `cd backend && mvn spring-boot:run`
3. **Test Integration**: Use the hospital transfers page
4. **Monitor Logs**: Check both Python and Spring Boot logs
5. **Optimize Model**: Retrain with more data as needed