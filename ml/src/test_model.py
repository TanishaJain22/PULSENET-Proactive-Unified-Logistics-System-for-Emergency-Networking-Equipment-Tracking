import joblib
from data_preprocessing import load_and_prepare_data
from sklearn.metrics import accuracy_score, classification_report

# Load the trained model
model = joblib.load("../models/hospital_assignment_model.pkl")  # same as saved

X_train, X_test, y_train, y_test = load_and_prepare_data()

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))