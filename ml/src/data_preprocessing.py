import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def load_and_prepare_data():
    print("Loading V2 Clinical Dataset...")
    df = pd.read_csv("../data/emergency_medical_dataset.csv")

    # 1. Encode text columns
    le_spec = LabelEncoder()
    df['specialty_encoded'] = le_spec.fit_transform(df['required_specialty'])

    le_traffic = LabelEncoder()
    df['traffic_encoded'] = le_traffic.fit_transform(df['traffic_condition'])

    # 2. Extract specific stats for the ASSIGNED hospital
    df['assigned_h_load'] = df.apply(lambda x: x[f"h{int(x['assigned_hospital_id'])}_load"], axis=1)
    df['assigned_h_specialist'] = df.apply(lambda x: x[f"h{int(x['assigned_hospital_id'])}_specialist"], axis=1)
    df['assigned_h_icu'] = df.apply(lambda x: x[f"h{int(x['assigned_hospital_id'])}_icu_beds"], axis=1)
    
    # 3. Calculate Engineered Features
    df['is_hospital_full'] = (df['assigned_h_load'] > 85).astype(int)
    df['is_specialty_match'] = (df['assigned_h_specialist'] >= 3).astype(int)
    df['travel_severity_risk'] = df['severity_level'] * df['estimated_travel_time']
    df['critical_no_icu'] = ((df['severity_level'] >= 4) & (df['assigned_h_icu'] <= 2)).astype(int)

    # 4. Define the COMPLETE Features List (Now with NEWS 2!)
    features = [
        'heart_rate', 'oxygen_level', 'temperature', 'bp_systolic', 'bp_diastolic',
        
        # --- NEW CLINICAL FEATURES ---
        'respiratory_rate', 'supplemental_o2', 'consciousness_level', 'news2_score',
        # -----------------------------
        
        'severity_level', 'estimated_travel_time',
        'assigned_hospital_id', 'specialty_encoded', 'traffic_encoded',
        'assigned_h_load', 'assigned_h_specialist', 'assigned_h_icu',
        'is_hospital_full', 'is_specialty_match', 'travel_severity_risk', 'critical_no_icu'
    ]

    # Keep all 5 hospitals' raw data for context
    for i in range(5):
        features.extend([
            f'h{i}_icu_beds', f'h{i}_general_beds', f'h{i}_ventilator',
            f'h{i}_specialist', f'h{i}_load', f'h{i}_distance'
        ])

    X = df[features]
    y = df['optimal_assignment']

    # 5. Split the 10,000 records
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    return X_train, X_test, y_train, y_test