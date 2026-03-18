from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import uvicorn

app = FastAPI(title="Healthcare AI Dispatch API (NEWS 2 Edition)", version="3.0")
print("Loading V2 AI Model into memory...")
model = joblib.load("../models/hospital_assignment_model.pkl")

# --- Clinical Engine ---
def calculate_news2(hr, spo2, temp, sbp, rr, o2_stat, avpu):
    score = 0
    if hr <= 40 or hr >= 131: score += 3
    elif 111 <= hr <= 130: score += 2
    elif 41 <= hr <= 50 or 91 <= hr <= 110: score += 1
    if spo2 <= 91: score += 3
    elif 92 <= spo2 <= 93: score += 2
    elif 94 <= spo2 <= 95: score += 1
    if temp <= 35.0: score += 3
    elif temp >= 39.1: score += 2
    elif 35.1 <= temp <= 36.0 or 38.1 <= temp <= 39.0: score += 1
    if sbp <= 90 or sbp >= 220: score += 3
    elif 91 <= sbp <= 100: score += 2
    elif 101 <= sbp <= 110: score += 1
    if rr <= 8 or rr >= 25: score += 3
    elif 21 <= rr <= 24: score += 2
    elif 9 <= rr <= 11: score += 1
    if o2_stat == 1: score += 2
    if avpu == 1: score += 3
    return score

# --- Data Schemas ---
class PatientVitals(BaseModel):
    heart_rate: int
    oxygen_level: float
    temperature: float
    bp_systolic: int
    bp_diastolic: int
    respiratory_rate: int      # NEW
    supplemental_o2: int       # NEW (0 or 1)
    consciousness_level: int   # NEW (0 or 1)
    estimated_travel_time: float
    specialty_encoded: int
    traffic_encoded: int

# --- Prediction Route ---
@app.post("/get_top_hospitals")
def get_top_hospitals(patient: PatientVitals):
    
    # Mock Database State
    hospital_state = {
        'h0_icu_beds': 1, 'h0_general_beds': 5, 'h0_ventilator': 2, 'h0_specialist': 4, 'h0_load': 92, 'h0_distance': 15.5,
        'h1_icu_beds': 8, 'h1_general_beds': 20, 'h1_ventilator': 5, 'h1_specialist': 5, 'h1_load': 65, 'h1_distance': 3.2,
        'h2_icu_beds': 4, 'h2_general_beds': 15, 'h2_ventilator': 3, 'h2_specialist': 0, 'h2_load': 45, 'h2_distance': 4.1,
        'h3_icu_beds': 2, 'h3_general_beds': 10, 'h3_ventilator': 1, 'h3_specialist': 2, 'h3_load': 75, 'h3_distance': 8.5,
        'h4_icu_beds': 12, 'h4_general_beds': 40, 'h4_ventilator': 8, 'h4_specialist': 4, 'h4_load': 55, 'h4_distance': 22.0
    }
    hospital_names = {0: "City General", 1: "Memorial Medical", 2: "St. Mary's", 3: "Community Hospital", 4: "University Medical"}

    # Calculate NEWS 2 and Severity dynamically!
    live_news2 = calculate_news2(
        patient.heart_rate, patient.oxygen_level, patient.temperature,
        patient.bp_systolic, patient.respiratory_rate, patient.supplemental_o2, patient.consciousness_level
    )
    
    if live_news2 <= 2: live_severity = 1
    elif live_news2 <= 4: live_severity = 2
    elif live_news2 <= 6: live_severity = 3
    elif live_news2 <= 8: live_severity = 4
    else: live_severity = 5

    # EXACT match to the data_preprocessing features list
    feature_cols = [
        'heart_rate', 'oxygen_level', 'temperature', 'bp_systolic', 'bp_diastolic', 
        'respiratory_rate', 'supplemental_o2', 'consciousness_level', 'news2_score',
        'severity_level', 'estimated_travel_time', 'assigned_hospital_id', 
        'specialty_encoded', 'traffic_encoded', 'assigned_h_load', 'assigned_h_specialist', 
        'assigned_h_icu', 'is_hospital_full', 'is_specialty_match', 'travel_severity_risk', 'critical_no_icu'
    ]
    for i in range(5):
        feature_cols.extend([f'h{i}_icu_beds', f'h{i}_general_beds', f'h{i}_ventilator', f'h{i}_specialist', f'h{i}_load', f'h{i}_distance'])

    results = []

    for h_id in range(5):
        row_data = patient.dict()
        row_data.update(hospital_state)
        
        # Inject our calculated clinical features
        row_data['news2_score'] = live_news2
        row_data['severity_level'] = live_severity
        row_data['assigned_hospital_id'] = h_id  
        
        row_data['assigned_h_load'] = hospital_state[f'h{h_id}_load']
        row_data['assigned_h_specialist'] = hospital_state[f'h{h_id}_specialist']
        row_data['assigned_h_icu'] = hospital_state[f'h{h_id}_icu_beds']
        
        row_data['is_hospital_full'] = 1 if row_data['assigned_h_load'] > 85 else 0
        row_data['is_specialty_match'] = 1 if row_data['assigned_h_specialist'] >= 3 else 0
        row_data['travel_severity_risk'] = live_severity * patient.estimated_travel_time
        row_data['critical_no_icu'] = 1 if (live_severity >= 4 and row_data['assigned_h_icu'] <= 2) else 0

        df_eval = pd.DataFrame([row_data], columns=feature_cols)
        probability = float(model.predict_proba(df_eval)[0][1])
        
        # Build reasoning
        reasons = []
        if row_data['assigned_h_specialist'] >= 4: reasons.append("Excellent specialty match")
        elif row_data['assigned_h_specialist'] <= 1: reasons.append("CRITICAL: Lacks required specialists")
        if hospital_state[f'h{h_id}_distance'] < 5.0: reasons.append("Rapid ETA")
        elif hospital_state[f'h{h_id}_distance'] > 15.0: reasons.append("Warning: Long transit")
        if live_severity >= 4 and row_data['assigned_h_icu'] > 3: reasons.append("Good ICU availability")
        if row_data['assigned_h_load'] > 85: reasons.append("Warning: Severe crowding")
        if not reasons: reasons.append("Standard conditions")

        results.append({
            "hospital_id": h_id,
            "hospital_name": hospital_names[h_id],
            "match_score_percentage": round(probability * 100, 1),
            "ai_insights": reasons
        })

    results_sorted = sorted(results, key=lambda x: x['match_score_percentage'], reverse=True)

    return {
        "status": "success",
        "calculated_news2_score": live_news2,
        "calculated_severity": live_severity,
        "recommendations": results_sorted
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)