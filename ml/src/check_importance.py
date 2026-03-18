import joblib
import pandas as pd
from data_preprocessing import load_and_prepare_data

# Load model and data
model = joblib.load("../models/hospital_assignment_model.pkl")
X_train, _, _, _ = load_and_prepare_data()

# Get importance scores
importance = model.feature_importances_
features = X_train.columns

# Create DataFrame and sort by most important
df_imp = pd.DataFrame({'Feature': features, 'Importance': importance})
df_imp = df_imp.sort_values(by='Importance', ascending=False).head(15)

print("\n--- Top 15 Most Important Features ---")
print(df_imp)