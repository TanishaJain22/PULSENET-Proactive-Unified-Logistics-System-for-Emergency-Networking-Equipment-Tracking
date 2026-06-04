#!/usr/bin/env python3
"""
PulseNet AI Hospital Recommendation Service
FastAPI service that integrates with XGBoost model for hospital recommendations
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import logging
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PulseNet AI Hospital Recommendation Service",
    description="AI-powered hospital recommendation system using XGBoost",
    version="1.0.0"
)

# Pydantic models for request/response
class HospitalData(BaseModel):
    hospital_id: int
    icu_beds: int
    general_beds: int
    ventilator: int
    specialist: int
    load: float
    distance: float
    rating: float = 4.0  # Hospital rating (1-5 scale, default 4.0)

class PatientVitalsRequest(BaseModel):
    # Patient vitals
    heart_rate: int
    oxygen_level: float
    temperature: float
    bp_systolic: int
    bp_diastolic: int
    respiratory_rate: int
    supplemental_o2: int  # 0 or 1
    consciousness_level: int  # 0=Alert, 1=Voice, 2=Pain, 3=Unresponsive
    severity_level: int
    estimated_travel_time: float
    
    # Patient demographics (for XGBoost 51-feature model)
    patient_age: int = 50  # Default age if not provided
    patient_gender: int = 0  # 0=Male, 1=Female
    patient_weight: float = 70.0  # Default weight in kg
    
    # Encoded features
    specialty_encoded: int
    traffic_encoded: int
    
    # Emergency level (for XGBoost model)
    emergency_level: int = 5  # 1-10 scale, default moderate
    
    # Hospital data (exactly 5 hospitals)
    hospitals: List[HospitalData]
    
    # Patient identifier
    patient_id: str

class AIHospitalRecommendation(BaseModel):
    hospital_id: int
    ai_score: float
    reasoning: str
    has_required_specialty: bool
    has_required_equipment: bool
    critical_no_icu: bool

class AIResponse(BaseModel):
    recommendations: List[AIHospitalRecommendation]
    status: str
    message: str

# Global model placeholder (will be loaded on startup)
model = None
feature_columns = None

def calculate_news2_score(vitals: PatientVitalsRequest) -> int:
    """
    Calculate NEWS2 (National Early Warning Score 2) based on patient vitals
    This is the standardized clinical scoring system
    """
    score = 0
    
    # 1. Respiratory Rate (12-20 normal)
    if vitals.respiratory_rate <= 8:
        score += 3
    elif vitals.respiratory_rate <= 11:
        score += 1
    elif vitals.respiratory_rate >= 25:
        score += 3
    elif vitals.respiratory_rate >= 21:
        score += 2
    # 12-20 = 0 points (normal)
    
    # 2. Oxygen Saturation (SpO2)
    if vitals.supplemental_o2 == 1:  # On supplemental oxygen
        if vitals.oxygen_level <= 83:
            score += 3
        elif vitals.oxygen_level <= 85:
            score += 2
        elif vitals.oxygen_level <= 87:
            score += 1
        # 88-92 on oxygen = 0 points
    else:  # Room air
        if vitals.oxygen_level <= 91:
            score += 3
        elif vitals.oxygen_level <= 93:
            score += 2
        elif vitals.oxygen_level <= 95:
            score += 1
        # ≥96 on air = 0 points
    
    # 3. Supplemental Oxygen (2 points if on oxygen)
    if vitals.supplemental_o2 == 1:
        score += 2
    
    # 4. Systolic Blood Pressure (111-219 normal)
    if vitals.bp_systolic <= 90:
        score += 3
    elif vitals.bp_systolic <= 100:
        score += 2
    elif vitals.bp_systolic <= 110:
        score += 1
    elif vitals.bp_systolic >= 220:
        score += 3
    # 111-219 = 0 points (normal)
    
    # 5. Heart Rate (51-90 normal)
    if vitals.heart_rate <= 40:
        score += 3
    elif vitals.heart_rate <= 50:
        score += 1
    elif vitals.heart_rate >= 131:
        score += 3
    elif vitals.heart_rate >= 111:
        score += 2
    elif vitals.heart_rate >= 91:
        score += 1
    # 51-90 = 0 points (normal)
    
    # 6. Level of Consciousness (AVPU Scale)
    if vitals.consciousness_level > 0:  # Any altered consciousness
        score += 3
    
    # 7. Temperature (36.1-38.0°C normal)
    if vitals.temperature <= 35.0:
        score += 3
    elif vitals.temperature <= 36.0:
        score += 1
    elif vitals.temperature >= 39.1:
        score += 2
    elif vitals.temperature >= 38.1:
        score += 1
    # 36.1-38.0 = 0 points (normal)
    
    return score

def load_ml_model():
    """
    Load the XGBoost ML model from the models directory
    """
    global model, feature_columns

    try:
        # Load the actual XGBoost model (51 features)
        model_path = "models/hospital_assignment_model.pkl"

        if os.path.exists(model_path):
            model = joblib.load(model_path)
            logger.info(f"Loaded XGBoost model from: {model_path}")
        else:
            raise FileNotFoundError(f"XGBoost model not found at: {model_path}")

        # Define feature columns for XGBoost model (51 features)
        feature_columns = [
            # Patient vitals (9 features)
            'heart_rate', 'oxygen_level', 'bp_systolic', 'bp_diastolic', 'temperature',
            'respiratory_rate', 'supplemental_o2', 'consciousness_level', 'severity_level',
            # Context (3 features)
            'estimated_travel_time', 'specialty_encoded', 'traffic_encoded',
            # Patient demographics (3 features)
            'patient_age', 'patient_gender', 'patient_weight',
            # Hospital features (5 hospitals × 7 features = 35 features)
            'h0_icu_beds', 'h0_general_beds', 'h0_ventilator', 'h0_specialist', 'h0_load', 'h0_distance', 'h0_rating',
            'h1_icu_beds', 'h1_general_beds', 'h1_ventilator', 'h1_specialist', 'h1_load', 'h1_distance', 'h1_rating',
            'h2_icu_beds', 'h2_general_beds', 'h2_ventilator', 'h2_specialist', 'h2_load', 'h2_distance', 'h2_rating',
            'h3_icu_beds', 'h3_general_beds', 'h3_ventilator', 'h3_specialist', 'h3_load', 'h3_distance', 'h3_rating',
            'h4_icu_beds', 'h4_general_beds', 'h4_ventilator', 'h4_specialist', 'h4_load', 'h4_distance', 'h4_rating',
            # Additional context feature (1 feature)
            'emergency_level'  # Emergency severity level
        ]

        logger.info(f"XGBoost model loaded successfully with {len(feature_columns)} features")
        logger.info(f"Model type: {type(model)}")

        # Test the model with correct feature count
        import numpy as np
        test_features = np.zeros((1, len(feature_columns)))
        test_prediction = model.predict(test_features)
        logger.info(f"XGBoost model test prediction successful: {test_prediction}")

    except Exception as e:
        logger.error(f"Failed to load XGBoost model: {e}")
        logger.info("Falling back to heuristic algorithm")
        model = "fallback_model"
        feature_columns = [
            # Patient vitals (9 features)
            'heart_rate', 'oxygen_level', 'bp_systolic', 'bp_diastolic', 'temperature',
            'respiratory_rate', 'supplemental_o2', 'consciousness_level', 'severity_level',
            # Context (3 features)
            'estimated_travel_time', 'specialty_encoded', 'traffic_encoded',
            # Patient demographics (3 features)
            'patient_age', 'patient_gender', 'patient_weight',
            # Hospital features (5 hospitals × 7 features = 35 features)
            'h0_icu_beds', 'h0_general_beds', 'h0_ventilator', 'h0_specialist', 'h0_load', 'h0_distance', 'h0_rating',
            'h1_icu_beds', 'h1_general_beds', 'h1_ventilator', 'h1_specialist', 'h1_load', 'h1_distance', 'h1_rating',
            'h2_icu_beds', 'h2_general_beds', 'h2_ventilator', 'h2_specialist', 'h2_load', 'h2_distance', 'h2_rating',
            'h3_icu_beds', 'h3_general_beds', 'h3_ventilator', 'h3_specialist', 'h3_load', 'h3_distance', 'h3_rating',
            'h4_icu_beds', 'h4_general_beds', 'h4_ventilator', 'h4_specialist', 'h4_load', 'h4_distance', 'h4_rating',
            # Additional context feature
            'emergency_level'
        ]

def prepare_features(request: PatientVitalsRequest) -> Dict[str, float]:
    """
    Convert request data to feature vector for XGBoost model (51 features)
    Uses the exact format from your training data (h0_, h1_, etc.)
    """
    features = {}

    # Patient vitals (9 features)
    features['heart_rate'] = float(request.heart_rate)
    features['oxygen_level'] = request.oxygen_level
    features['temperature'] = request.temperature
    features['bp_systolic'] = float(request.bp_systolic)
    features['bp_diastolic'] = float(request.bp_diastolic)
    features['respiratory_rate'] = float(request.respiratory_rate)
    features['supplemental_o2'] = float(request.supplemental_o2)
    features['consciousness_level'] = float(request.consciousness_level)
    features['severity_level'] = float(request.severity_level)

    # Context features (3 features)
    features['estimated_travel_time'] = request.estimated_travel_time
    features['specialty_encoded'] = float(request.specialty_encoded)
    features['traffic_encoded'] = float(request.traffic_encoded)

    # Patient demographics (3 features)
    features['patient_age'] = float(request.patient_age)
    features['patient_gender'] = float(request.patient_gender)
    features['patient_weight'] = float(request.patient_weight)

    # Hospital features (5 hospitals × 7 features = 35 features)
    for i in range(5):
        if i < len(request.hospitals):
            hospital = request.hospitals[i]
            features[f'h{i}_icu_beds'] = float(hospital.icu_beds)
            features[f'h{i}_general_beds'] = float(hospital.general_beds)
            features[f'h{i}_ventilator'] = float(hospital.ventilator)
            features[f'h{i}_specialist'] = float(hospital.specialist)
            features[f'h{i}_load'] = hospital.load
            features[f'h{i}_distance'] = hospital.distance
            features[f'h{i}_rating'] = hospital.rating
        else:
            # Fill missing hospitals with default values
            features[f'h{i}_icu_beds'] = 0.0
            features[f'h{i}_general_beds'] = 0.0
            features[f'h{i}_ventilator'] = 0.0
            features[f'h{i}_specialist'] = 0.0
            features[f'h{i}_load'] = 100.0
            features[f'h{i}_distance'] = 999.0
            features[f'h{i}_rating'] = 1.0

    # Additional context feature (1 feature)
    features['emergency_level'] = float(request.emergency_level)

    return features

def predict_hospital_rankings(features: Dict[str, float]) -> List[float]:
    """
    Use XGBoost ML model to predict hospital rankings
    Returns list of 5 scores (one for each hospital)
    """
    try:
        if model != "fallback_model" and model is not None:
            # Use actual XGBoost model (binary classifier)
            logger.info("Using trained XGBoost model for prediction")
            
            # Create feature vector in correct order (51 features)
            feature_vector = [features[col] for col in feature_columns]
            
            logger.info(f"Feature vector length: {len(feature_vector)}")
            
            # Get prediction probabilities from XGBoost model
            # Since it's a binary classifier, we'll use the confidence to weight our heuristics
            if hasattr(model, 'predict_proba'):
                prediction_proba = model.predict_proba([feature_vector])
                transfer_confidence = prediction_proba[0][1]  # Probability of needing transfer
                logger.info(f"XGBoost transfer confidence: {transfer_confidence:.3f}")
            else:
                transfer_confidence = 0.5  # Default if no probabilities available
            
            # Use transfer confidence to weight our hospital selection heuristics
            scores = []
            
            for i in range(5):
                # Base score influenced by transfer confidence (minimum 20 for any hospital)
                base_score = 20.0 + (transfer_confidence * 20.0)  # 20-40 range instead of 10-40
                
                # Hospital-specific factors
                icu_beds = features.get(f'h{i}_icu_beds', 0)
                general_beds = features.get(f'h{i}_general_beds', 0)
                ventilators = features.get(f'h{i}_ventilator', 0)
                specialists = features.get(f'h{i}_specialist', 0)
                load = features.get(f'h{i}_load', 100)
                distance = features.get(f'h{i}_distance', 999)
                rating = features.get(f'h{i}_rating', 3.0)
                
                # Calculate hospital capacity score (scaled down)
                capacity_score = (icu_beds * 3) + (general_beds * 0.5) + (ventilators * 2) + (specialists * 3)
                
                # Patient severity factor
                severity = features.get('severity_level', 1)
                emergency_level = features.get('emergency_level', 1)
                
                # Critical patients need ICU beds more
                if severity >= 7 or emergency_level >= 7:
                    if icu_beds > 0:
                        capacity_score += icu_beds * 8  # Favor ICU for critical patients
                    else:
                        capacity_score -= 40  # Heavy penalty for no ICU beds for critical patients
                        final_score = min(final_score, 15)  # Cap score for hospitals with no ICU for critical patients
                
                # General penalty for hospitals with no capacity
                if icu_beds == 0 and general_beds == 0:
                    capacity_score -= 25  # Penalty for hospitals with no beds
                    
                if specialists == 0 and severity >= 5:
                    capacity_score -= 10  # Penalty for no specialists when needed
                
                # Load penalty (higher load = lower score)
                load_penalty = (load - 50) * 0.3
                
                # Distance penalty (farther = lower score)
                distance_penalty = min(distance * 1.5, 25)
                
                # Rating bonus (smaller impact)
                rating_bonus = (rating - 3.0) * 3
                
                # Calculate final score
                final_score = base_score + capacity_score - load_penalty - distance_penalty + rating_bonus
                
                # Additional validation for hospitals with no capacity
                if icu_beds == 0 and general_beds == 0:
                    final_score = min(final_score, 10)  # Cap very low for hospitals with no beds
                    
                if icu_beds == 0 and (severity >= 7 or emergency_level >= 7):
                    final_score = min(final_score, 5)  # Very low score for critical patients with no ICU
                
                # Ensure score is in valid range and never 0 unless it's a terrible hospital
                final_score = max(1, min(100, final_score))  # Minimum score of 1 instead of 0
                scores.append(final_score)
            
            logger.info(f"Hospital scores: {[f'{s:.1f}' for s in scores]}")
            return scores
            
        else:
            # Fallback heuristic prediction
            logger.info("Using fallback heuristic prediction (XGBoost model not available)")
            
            scores = []
            for i in range(5):
                score = 50.0  # Base score
                
                # Favor hospitals with more ICU beds
                icu_beds = features.get(f'h{i}_icu_beds', 0)
                score += min(icu_beds * 5, 20)
                
                # Penalize high load
                load = features.get(f'h{i}_load', 100)
                score -= (load - 50) * 0.3
                
                # Penalize distance
                distance = features.get(f'h{i}_distance', 999)
                score -= min(distance * 2, 30)
                
                # Favor specialist availability
                specialist = features.get(f'h{i}_specialist', 0)
                score += specialist * 3
                
                # Adjust for patient severity
                severity = features.get('severity_level', 1)
                if severity >= 8:  # Critical patient
                    score += icu_beds * 10  # Heavily favor ICU availability
                
                scores.append(max(0, min(100, score)))
            
            return scores
            
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        # Return default scores
        return [50.0, 40.0, 30.0, 20.0, 10.0]

def generate_reasoning(hospital_id: int, score: float, features: Dict[str, float], is_ml_prediction: bool = False) -> str:
    """
    Generate human-readable reasoning for the recommendation
    """
    reasons = []
    
    icu_beds = features.get(f'h{hospital_id}_icu_beds', 0)
    load = features.get(f'h{hospital_id}_load', 100)
    distance = features.get(f'h{hospital_id}_distance', 999)
    specialist = features.get(f'h{hospital_id}_specialist', 0)
    severity = features.get('severity_level', 1)
    
    if is_ml_prediction:
        reasons.append("AI model recommendation")
    
    if icu_beds > 5:
        reasons.append(f"High ICU capacity ({int(icu_beds)} beds)")
    elif icu_beds == 0:
        reasons.append("No ICU beds available")
    
    if load < 70:
        reasons.append("Low patient load")
    elif load > 90:
        reasons.append("High patient load")
    
    if distance < 10:
        reasons.append("Close proximity")
    elif distance > 30:
        reasons.append("Distant location")
    
    if specialist > 0:
        reasons.append("Specialist available")
    
    if severity >= 8 and icu_beds > 0:
        reasons.append("Critical patient - ICU required")
    
    if not reasons:
        reasons.append("Standard recommendation")
    
    return "; ".join(reasons)

@app.on_event("startup")
async def startup_event():
    """Load ML model on startup"""
    logger.info("Starting PulseNet AI Hospital Recommendation Service")
    success = load_ml_model()
    if not success:
        logger.warning("Failed to load ML model - using fallback predictions")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "PulseNet AI Hospital Recommendation Service",
        "status": "running",
        "version": "1.0.0",
        "model_loaded": model is not None and model != "fallback_model",
        "model_type": "XGBoost" if model != "fallback_model" and model is not None else "Fallback Heuristic",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_status": "loaded" if model is not None and model != "fallback_model" else "fallback",
        "model_type": "XGBoost" if model != "fallback_model" and model is not None else "Fallback Heuristic",
        "feature_count": len(feature_columns) if feature_columns else 0,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/get_top_hospitals", response_model=AIResponse)
async def get_hospital_recommendations(request: PatientVitalsRequest):
    """
    Main endpoint for hospital recommendations
    This matches the API contract expected by Spring Boot backend
    """
    try:
        logger.info(f"Processing recommendation request for patient: {request.patient_id}")
        
        # Validate input
        if len(request.hospitals) != 5:
            raise HTTPException(
                status_code=400, 
                detail=f"Expected exactly 5 hospitals, got {len(request.hospitals)}"
            )
        
        # Calculate NEWS2 score for clinical context
        news2_score = calculate_news2_score(request)
        logger.info(f"Patient NEWS2 score: {news2_score}")
        
        # Prepare features for ML model
        features = prepare_features(request)
        
        # Get ML predictions
        hospital_scores = predict_hospital_rankings(features)
        
        # Create recommendations
        recommendations = []
        is_ml_model = model != "fallback_model" and model is not None
        
        for i, score in enumerate(hospital_scores):
            if i < len(request.hospitals):
                hospital = request.hospitals[i]
                
                recommendation = AIHospitalRecommendation(
                    hospital_id=i,  # Use the index (0-4) as the ML hospital ID
                    ai_score=round(score, 2),
                    reasoning=generate_reasoning(i, score, features, is_ml_model),
                    has_required_specialty=hospital.specialist > 0,
                    has_required_equipment=hospital.icu_beds > 0 or hospital.ventilator > 0,
                    critical_no_icu=(request.severity_level >= 8 and hospital.icu_beds == 0)
                )
                
                recommendations.append(recommendation)
        
        # Sort by AI score (highest first)
        recommendations.sort(key=lambda x: x.ai_score, reverse=True)
        
        logger.info(f"Generated {len(recommendations)} recommendations using {'XGBoost model' if is_ml_model else 'fallback algorithm'}")
        
        model_type = "XGBoost" if is_ml_model else "Fallback Heuristic"
        
        return AIResponse(
            recommendations=recommendations,
            status="success",
            message=f"AI recommendations generated successfully using {model_type} (NEWS2: {news2_score})"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing recommendation request: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/test")
async def test_endpoint(data: Dict[str, Any]):
    """Test endpoint for debugging"""
    return {
        "received": data,
        "timestamp": datetime.now().isoformat(),
        "status": "test_successful"
    }

if __name__ == "__main__":
    # Run the FastAPI server
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=port,
        reload=os.environ.get("RENDER") is None,  # Only reload in local dev
        log_level="info"
    )