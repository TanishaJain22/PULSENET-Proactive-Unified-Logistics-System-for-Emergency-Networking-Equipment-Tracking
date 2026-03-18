import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

# Number of samples
n_samples = 10000

# Generate timestamps
start_date = datetime(2024, 1, 1)
timestamps = [start_date + timedelta(minutes=15*i) for i in range(n_samples)]

# --- NEW: NEWS 2 Calculation Engine ---
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

# Patient Data with realistic correlations
def generate_patient_data(n):
    # Hidden "base sickness" to drive correlated vitals
    base_sickness_probs = [0.15, 0.25, 0.30, 0.20, 0.10]
    base_sickness = np.random.choice([1, 2, 3, 4, 5], n, p=base_sickness_probs)
    
    # Generate Old Vitals
    hr_base = np.random.normal(75, 10, n)
    hr_severity_effect = base_sickness * 5
    hr_variation = np.random.normal(0, 8, n)
    heart_rate = np.clip(hr_base + hr_severity_effect + hr_variation, 40, 200).astype(int)
    
    spo2_base = np.random.normal(97, 2, n)
    spo2_severity_effect = -base_sickness * 1.5
    spo2_variation = np.random.normal(0, 1.5, n)
    oxygen_level = np.clip(spo2_base + spo2_severity_effect + spo2_variation, 70, 100).round(1)
    
    bp_systolic_base = np.random.normal(120, 15, n)
    bp_diastolic_base = np.random.normal(80, 10, n)
    bp_severity_effect = np.where(base_sickness >= 4, 
                                  np.random.choice([-30, 30], n, p=[0.5, 0.5]), 
                                  np.random.normal(0, 5, n))
    bp_systolic = np.clip(bp_systolic_base + bp_severity_effect, 70, 220).astype(int)
    bp_diastolic = np.clip(bp_diastolic_base + bp_severity_effect * 0.6, 40, 130).astype(int)
    blood_pressure = [f"{s}/{d}" for s, d in zip(bp_systolic, bp_diastolic)]
    
    temp_base = np.random.normal(36.6, 0.4, n)
    temp_severity_effect = base_sickness * 0.2
    temp_variation = np.random.normal(0, 0.3, n)
    temperature = (temp_base + temp_severity_effect + temp_variation).round(1)

    # --- NEW: Generate Clinical Vitals ---
    # Respiratory Rate
    rr_base = np.random.normal(16, 2, n)
    rr_severity_effect = (base_sickness - 2) * 3 
    respiratory_rate = np.clip(rr_base + rr_severity_effect + np.random.normal(0, 2, n), 6, 35).astype(int)
    
    # Supplemental O2 (Highly likely if SpO2 is low)
    supplemental_o2 = np.where(oxygen_level < 92, 1, np.random.choice([0, 1], n, p=[0.8, 0.2]))
    
    # Consciousness (AVPU scale)
    avpu_prob = np.clip((base_sickness - 1) * 0.15, 0, 0.9)
    consciousness_level = np.array([np.random.choice([1, 0], p=[p, 1-p]) for p in avpu_prob])

    # --- NEW: Calculate True NEWS 2 Score & Assign Severity ---
    news2_scores = []
    clinical_severity = []
    
    for i in range(n):
        score = calculate_news2(
            heart_rate[i], oxygen_level[i], temperature[i], bp_systolic[i], 
            respiratory_rate[i], supplemental_o2[i], consciousness_level[i]
        )
        news2_scores.append(score)
        
        # Clinical mapping
        if score <= 2: clinical_severity.append(1)
        elif score <= 4: clinical_severity.append(2)
        elif score <= 6: clinical_severity.append(3)
        elif score <= 8: clinical_severity.append(4)
        else: clinical_severity.append(5)
            
    severity = np.array(clinical_severity) # Overwrite old logic with clinical math!
    
    # Required specialty logic
    specialty = []
    for i in range(n):
        if severity[i] >= 4:
            if heart_rate[i] > 120 or bp_systolic[i] > 180: specialty.append('cardiology')
            elif oxygen_level[i] < 90 or respiratory_rate[i] > 24: specialty.append('pulmonology') # Updated
            elif consciousness_level[i] == 1: specialty.append('neurology') # Updated
            else: specialty.append('trauma')
        elif severity[i] == 3:
            if heart_rate[i] > 100 or bp_systolic[i] > 160: specialty.append('cardiology')
            elif oxygen_level[i] < 94: specialty.append('pulmonology')
            else: specialty.append(random.choices(['cardiology', 'trauma', 'neurology', 'general'], weights=[0.3, 0.3, 0.2, 0.2])[0])
        else:
            specialty.append(random.choices(['general', 'cardiology', 'trauma', 'neurology'], weights=[0.7, 0.1, 0.1, 0.1])[0])
    
    return {
        'severity': severity,
        'news2_score': np.array(news2_scores), # NEW
        'heart_rate': heart_rate,
        'oxygen_level': oxygen_level,
        'blood_pressure': blood_pressure,
        'temperature': temperature,
        'respiratory_rate': respiratory_rate, # NEW
        'supplemental_o2': supplemental_o2,   # NEW
        'consciousness_level': consciousness_level, # NEW
        'required_specialty': specialty,
        'bp_systolic': bp_systolic,
        'bp_diastolic': bp_diastolic
    }

patient_data = generate_patient_data(n_samples)

# Ambulance Data (Your awesome GPS code stays!)
def generate_ambulance_data(n, severity):
    areas = ['downtown', 'suburb_a', 'suburb_b', 'rural']
    area_weights = [0.4, 0.3, 0.2, 0.1]
    
    gps_locations = []
    for _ in range(n):
        area = random.choices(areas, weights=area_weights)[0]
        if area == 'downtown':
            lat, lon = np.random.uniform(40.75, 40.80), np.random.uniform(-73.98, -73.94)
        elif area == 'suburb_a':
            lat, lon = np.random.uniform(40.70, 40.75), np.random.uniform(-74.00, -73.95)
        elif area == 'suburb_b':
            lat, lon = np.random.uniform(40.80, 40.85), np.random.uniform(-73.90, -73.85)
        else: 
            lat, lon = np.random.uniform(40.60, 40.90), np.random.uniform(-74.10, -73.80)
        gps_locations.append(f"{lat:.4f}, {lon:.4f}")
    
    base_travel_time = np.random.exponential(15, n) + 5
    severity_factor = 1 - (severity * 0.05) 
    traffic_factor = np.random.choice([0.8, 1.0, 1.5, 2.0], n, p=[0.2, 0.4, 0.3, 0.1])
    
    travel_time = np.clip((base_travel_time * severity_factor * traffic_factor).round(1), 2, 45)
    
    traffic_conditions = []
    for tf in traffic_factor:
        if tf <= 0.9: traffic_conditions.append('light')
        elif tf <= 1.1: traffic_conditions.append('moderate')
        elif tf <= 1.6: traffic_conditions.append('heavy')
        else: traffic_conditions.append('severe')
    
    return {'gps_location': gps_locations, 'travel_time': travel_time, 'traffic_condition': traffic_conditions}

ambulance_data = generate_ambulance_data(n_samples, patient_data['severity'])

# Hospital Data (Your complex load logic stays!)
hospitals = [
    {'name': 'City General', 'type': 'level1_trauma', 'capacity': 500, 'specialties': ['cardiology', 'trauma', 'neurology', 'pulmonology', 'general']},
    {'name': 'Memorial Medical', 'type': 'level1_trauma', 'capacity': 450, 'specialties': ['cardiology', 'trauma', 'neurology', 'general']},
    {'name': 'St. Mary\'s', 'type': 'cardiac_center', 'capacity': 350, 'specialties': ['cardiology', 'general']},
    {'name': 'Community Hospital', 'type': 'general', 'capacity': 300, 'specialties': ['general', 'cardiology']},
    {'name': 'University Medical', 'type': 'level1_trauma', 'capacity': 600, 'specialties': ['cardiology', 'trauma', 'neurology', 'pulmonology', 'infectious_disease', 'general']}
]

def generate_hospital_data(n, patient_severity, required_specialty):
    hospital_data, target_hospital_idx = [], []
    for i in range(n):
        severity = patient_severity[i]
        specialty_needed = required_specialty[i]
        
        if severity >= 4:
            eligible_hospitals = [h for h in range(len(hospitals)) if hospitals[h]['type'] in ['level1_trauma'] and specialty_needed in hospitals[h]['specialties']]
        elif severity == 3:
            eligible_hospitals = [h for h in range(len(hospitals)) if specialty_needed in hospitals[h]['specialties']]
        else:
            eligible_hospitals = [h for h in range(len(hospitals)) if 'general' in hospitals[h]['specialties']]
        
        if not eligible_hospitals: eligible_hospitals = list(range(len(hospitals)))
        hospital_idx = random.choice(eligible_hospitals)
        
        base_distance = np.random.uniform(0.5, 25)
        distance = round(base_distance * np.random.uniform(0.8, 1.3) if severity >= 4 else base_distance * np.random.uniform(0.9, 1.1), 1)
        
        time_factor = (i % 96) / 96 
        base_load = np.random.uniform(40, 90, len(hospitals))
        time_effect = np.sin(time_factor * 2 * np.pi) * 20 
        
        icu_beds, general_beds, ventilator_beds, specialist_avail, hospital_load = [], [], [], [], []
        
        for h_idx, hospital in enumerate(hospitals):
            if h_idx == hospital_idx:
                if severity >= 4:
                    icu_avail = max(0, min(20, int(np.random.normal(15 - severity * 2, 3))))
                    vent_avail = max(0, min(15, int(np.random.normal(12 - severity * 1.5, 2))))
                else:
                    icu_avail = max(0, min(15, int(np.random.normal(8 - severity, 3))))
                    vent_avail = max(0, min(12, int(np.random.normal(7 - severity, 2))))
            else:
                icu_avail = max(0, int(np.random.normal(5, 3)))
                vent_avail = max(0, int(np.random.normal(4, 2)))
            
            general_avail = max(0, int(np.random.normal(20 - base_load[h_idx]/5 + time_effect/2, 5)))
            specialist = np.random.choice([3, 4, 5], p=[0.2, 0.5, 0.3]) if specialty_needed in hospital['specialties'] else np.random.choice([0, 1, 2], p=[0.3, 0.5, 0.2])
            load = min(100, max(20, int(base_load[h_idx] + time_effect + np.random.normal(0, 5))))
            
            icu_beds.append(icu_avail); general_beds.append(general_avail); ventilator_beds.append(vent_avail)
            specialist_avail.append(specialist); hospital_load.append(load)
        
        hospital_data.append({
            'hospital_id': hospital_idx, 'hospital_name': hospitals[hospital_idx]['name'],
            'distance_from_ambulance': distance, 'icu_beds_available': icu_beds,
            'general_beds_available': general_beds, 'ventilator_available': ventilator_beds,
            'specialist_availability': specialist_avail, 'hospital_load_percent': hospital_load
        })
        target_hospital_idx.append(hospital_idx)
    return hospital_data, target_hospital_idx

hospital_data, target_hospital = generate_hospital_data(n_samples, patient_data['severity'], patient_data['required_specialty'])

# Create final dataset
dataset = []
for i in range(n_samples):
    row = {
        'patient_id': f'P{i:05d}', 'timestamp': timestamps[i].strftime('%Y-%m-%d %H:%M'),
        'heart_rate': patient_data['heart_rate'][i], 'oxygen_level': patient_data['oxygen_level'][i],
        'blood_pressure': patient_data['blood_pressure'][i], 'bp_systolic': patient_data['bp_systolic'][i], 'bp_diastolic': patient_data['bp_diastolic'][i],
        'temperature': patient_data['temperature'][i], 
        # --- NEW COLUMNS INJECTED HERE ---
        'respiratory_rate': patient_data['respiratory_rate'][i],
        'supplemental_o2': patient_data['supplemental_o2'][i],
        'consciousness_level': patient_data['consciousness_level'][i],
        'news2_score': patient_data['news2_score'][i],
        # ---------------------------------
        'severity_level': patient_data['severity'][i], 'required_specialty': patient_data['required_specialty'][i],
        'ambulance_id': f'A{i:05d}', 'ambulance_gps': ambulance_data['gps_location'][i],
        'estimated_travel_time': ambulance_data['travel_time'][i], 'traffic_condition': ambulance_data['traffic_condition'][i],
        'assigned_hospital_id': hospital_data[i]['hospital_id'], 'assigned_hospital_name': hospital_data[i]['hospital_name'],
        'hospital_distance': hospital_data[i]['distance_from_ambulance']
    }
    
    # Calculate Optimality Score (Your logic stays!)
    severity = row['severity_level']
    travel_time = row['estimated_travel_time']
    hospital_idx = row['assigned_hospital_id']
    optimal_score = 0
    
    if severity >= 4:
        if travel_time < 15: optimal_score += 1
        if hospital_data[i]['icu_beds_available'][hospital_idx] > 5: optimal_score += 1
        if hospital_data[i]['ventilator_available'][hospital_idx] > 3: optimal_score += 1
        if hospital_data[i]['specialist_availability'][hospital_idx] >= 4: optimal_score += 1
        if hospital_data[i]['hospital_load_percent'][hospital_idx] < 70: optimal_score += 1
    elif severity == 3:
        if travel_time < 20: optimal_score += 1
        if hospital_data[i]['icu_beds_available'][hospital_idx] > 2: optimal_score += 1
        if hospital_data[i]['specialist_availability'][hospital_idx] >= 3: optimal_score += 1
        if hospital_data[i]['hospital_load_percent'][hospital_idx] < 80: optimal_score += 1
    else:
        if travel_time < 25: optimal_score += 1
        if hospital_data[i]['general_beds_available'][hospital_idx] > 5: optimal_score += 1
        if hospital_data[i]['hospital_load_percent'][hospital_idx] < 85: optimal_score += 1
    
    if row['required_specialty'] in hospitals[hospital_idx]['specialties']: optimal_score += 2
    
    max_possible = 7 if severity >= 4 else 6 if severity == 3 else 4
    optimal_score = optimal_score / max_possible
    
    if np.random.random() < 0.1: optimal_score = max(0, optimal_score - np.random.uniform(0.3, 0.6))
    row['optimal_assignment'] = 1 if optimal_score > 0.65 else 0
    
    for h_idx, hospital in enumerate(hospitals):
        row[f'h{h_idx}_icu_beds'] = hospital_data[i]['icu_beds_available'][h_idx]
        row[f'h{h_idx}_general_beds'] = hospital_data[i]['general_beds_available'][h_idx]
        row[f'h{h_idx}_ventilator'] = hospital_data[i]['ventilator_available'][h_idx]
        row[f'h{h_idx}_specialist'] = hospital_data[i]['specialist_availability'][h_idx]
        row[f'h{h_idx}_load'] = hospital_data[i]['hospital_load_percent'][h_idx]
        row[f'h{h_idx}_distance'] = round(np.random.uniform(0.5, 25), 1)
    
    dataset.append(row)

# Save to CSV
df = pd.DataFrame(dataset)
df.to_csv('../data/emergency_medical_dataset.csv', index=False)
print("✅ 10,000 Clinical Records generated successfully using your advanced simulator!")