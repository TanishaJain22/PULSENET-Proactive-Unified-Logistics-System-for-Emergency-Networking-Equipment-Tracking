import os
import joblib
import numpy as np
from xgboost import XGBClassifier
from data_preprocessing import load_and_prepare_data

# Ensure models folder exists
if not os.path.exists("../models"):
    os.makedirs("../models")

def train():
    X_train, X_test, y_train, y_test = load_and_prepare_data()

    # Dynamically calculate the correct class weight
    class_0_count = np.sum(y_train == 0)
    class_1_count = np.sum(y_train == 1)
    weight_ratio = class_0_count / class_1_count

    print("Training XGBoost model...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss',
        scale_pos_weight=weight_ratio  # Re-enabled Class Weights
    )

    model.fit(X_train, y_train)

    joblib.dump(model, "../models/hospital_assignment_model.pkl")
    print("XGBoost model trained and saved successfully!")

if __name__ == "__main__":
    train()