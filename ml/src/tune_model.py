import os
import joblib
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from data_preprocessing import load_and_prepare_data

# Ensure models folder exists
if not os.path.exists("../models"):
    os.makedirs("../models")

def tune_and_train():
    print("Loading data for tuning...")
    X_train, X_test, y_train, y_test = load_and_prepare_data()

    # Calculate class weight for imbalance
    class_0_count = np.sum(y_train == 0)
    class_1_count = np.sum(y_train == 1)
    weight_ratio = class_0_count / class_1_count

    print("Initializing Grid Search... (This may take a few minutes)")

    # 1. The base model
    base_model = XGBClassifier(
        random_state=42,
        eval_metric='logloss',
        scale_pos_weight=weight_ratio
    )

    # 2. The "Grid" of settings to test
    # It will test every combination of these numbers!
    param_grid = {
        'max_depth': [4, 6, 8],              # How deep the decision trees go
        'learning_rate': [0.05, 0.1, 0.2],   # How fast the model learns
        'n_estimators': [100, 200, 300],     # Number of trees built
        'subsample': [0.8, 1.0],             # Percentage of data used per tree (prevents overfitting)
        'colsample_bytree': [0.8, 1.0]       # Percentage of features used per tree
    }

    # 3. Setup the Grid Search
    # cv=3 means it tests each combination 3 times to be absolutely sure
    # scoring='f1_macro' tells it to care equally about Class 0 and Class 1
    grid_search = GridSearchCV(
        estimator=base_model,
        param_grid=param_grid,
        scoring='f1_macro',
        cv=3,
        verbose=2,  # Shows progress in the terminal
        n_jobs=-1   # Uses all your CPU cores to run faster!
    )

    # 4. Start the automated testing
    grid_search.fit(X_train, y_train)

    print("\n" + "="*50)
    print("🏆 BEST SETTINGS FOUND 🏆")
    print("="*50)
    for key, value in grid_search.best_params_.items():
        print(f"{key}: {value}")

    # 5. Save the absolute best model it found
    best_model = grid_search.best_estimator_
    joblib.dump(best_model, "../models/hospital_assignment_model.pkl")
    print("\nThe ultimate optimized model has been saved!")

if __name__ == "__main__":
    tune_and_train()