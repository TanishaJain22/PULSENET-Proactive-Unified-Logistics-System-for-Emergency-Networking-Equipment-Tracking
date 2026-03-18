import joblib
import pandas as pd
import numpy as np

def run_recommendation_engine():
    print("Loading AI Model...")
    model = joblib.load("../models/hospital_assignment_model.pkl")

    # 1. Define the Patient's Vitals (Example: Critical Trauma Patient)
    patient_vitals = {
        'heart_rate': 145,
        'oxygen_level': 88.0,
        'temperature': 36.5,
        'severity_level': 5,
        'estimated_travel_time': 12.0, 
        'bp_systolic': 80,
        'bp_diastolic': 50,
        'specialty_encoded': 4,    # Assuming 4 = 'trauma'
        'traffic_encoded': 1       # Assuming 1 = 'moderate'
    }

    # 2. Define the current real-time state of the 5 hospitals
    hospital_state = {
        'h0_icu_beds': 1, 'h0_general_beds': 5, 'h0_ventilator': 2, 'h0_specialist': 4, 'h0_load': 92, 'h0_distance': 15.5,
        'h1_icu_beds': 8, 'h1_general_beds': 20, 'h1_ventilator': 5, 'h1_specialist': 5, 'h1_load': 65, 'h1_distance': 3.2,
        'h2_icu_beds': 4, 'h2_general_beds': 15, 'h2_ventilator': 3, 'h2_specialist': 0, 'h2_load': 45, 'h2_distance': 4.1,
        'h3_icu_beds': 2, 'h3_general_beds': 10, 'h3_ventilator': 1, 'h3_specialist': 2, 'h3_load': 75, 'h3_distance': 8.5,
        'h4_icu_beds': 12, 'h4_general_beds': 40, 'h4_ventilator': 8, 'h4_specialist': 4, 'h4_load': 55, 'h4_distance': 22.0
    }
    hospital_names = {0: "City General", 1: "Memorial Medical", 2: "St. Mary's", 3: "Community Hospital", 4: "University Medical"}

    # 3. Define the EXACT feature columns the model expects (Now including engineered features)
    feature_cols = [
        'heart_rate', 'oxygen_level', 'temperature', 'severity_level', 
        'estimated_travel_time', 'bp_systolic', 'bp_diastolic', 
        'assigned_hospital_id', 'specialty_encoded', 'traffic_encoded',
        
        # --- NEW ENGINEERED COLUMNS ADDED HERE ---
        'assigned_h_load', 'assigned_h_specialist', 'assigned_h_icu', 
        'is_hospital_full', 'is_specialty_match', 'travel_severity_risk', 'critical_no_icu'
    ]
    for i in range(5):
        feature_cols.extend([f'h{i}_icu_beds', f'h{i}_general_beds', f'h{i}_ventilator', f'h{i}_specialist', f'h{i}_load', f'h{i}_distance'])

    # 4. Evaluate every hospital
    results = []

    for h_id in range(5):
        # Combine patient vitals and hospital state
        row_data = patient_vitals.copy()
        row_data.update(hospital_state)
        row_data['assigned_hospital_id'] = h_id  
        
        # --- CALCULATE ENGINEERED FEATURES ON THE FLY ---
        row_data['assigned_h_load'] = hospital_state[f'h{h_id}_load']
        row_data['assigned_h_specialist'] = hospital_state[f'h{h_id}_specialist']
        row_data['assigned_h_icu'] = hospital_state[f'h{h_id}_icu_beds']
        
        row_data['is_hospital_full'] = 1 if row_data['assigned_h_load'] > 85 else 0
        row_data['is_specialty_match'] = 1 if row_data['assigned_h_specialist'] >= 3 else 0
        row_data['travel_severity_risk'] = patient_vitals['severity_level'] * patient_vitals['estimated_travel_time']
        row_data['critical_no_icu'] = 1 if (patient_vitals['severity_level'] >= 4 and row_data['assigned_h_icu'] <= 2) else 0

        # Create DataFrame for prediction using the exact column order
        df_eval = pd.DataFrame([row_data], columns=feature_cols)
        
        # Get probability of class 1 (Optimal)
        probability = model.predict_proba(df_eval)[0][1]
        
        # Generate Reason Logic for the printout
        reasons = []
        spec_score = hospital_state[f'h{h_id}_specialist']
        load = hospital_state[f'h{h_id}_load']
        dist = hospital_state[f'h{h_id}_distance']
        icu = hospital_state[f'h{h_id}_icu_beds']
        
        if spec_score >= 4:
            reasons.append("Excellent specialty match")
        elif spec_score <= 1:
            reasons.append("CRITICAL: Lacks required specialists")
            
        if dist < 5.0:
            reasons.append("Rapid ETA (Very close)")
        elif dist > 15.0:
            reasons.append("Warning: Long transit time")
            
        if patient_vitals['severity_level'] >= 4 and icu > 3:
            reasons.append("Good ICU availability for critical condition")
            
        if load > 85:
            reasons.append("Warning: Facility is experiencing severe crowding")
            
        if not reasons:
            reasons.append("Standard facility conditions")

        # Save result
        results.append({
            'Hospital': hospital_names[h_id],
            'Suitability': probability * 100,
            'Reasons': " | ".join(reasons)
        })

    # 5. Sort and Display
    results_sorted = sorted(results, key=lambda x: x['Suitability'], reverse=True)

    print("\n" + "="*70)
    print(f"🚑 AI DISPATCH RECOMMENDATIONS (Severity Level {patient_vitals['severity_level']})")
    print("="*70)
    
    for rank, res in enumerate(results_sorted, 1):
        print(f"\n#{rank}: {res['Hospital']}")
        print(f"Match Score : {res['Suitability']:.1f}%")
        print(f"AI Insights : {res['Reasons']}")

if __name__ == "__main__":
    run_recommendation_engine()