from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI()

class HospitalRecommendation(BaseModel):
    hospital_id: int
    ai_score: float
    reasoning: str
    has_required_specialty: bool = True
    has_required_equipment: bool = True
    critical_no_icu: bool = False

class AIResponse(BaseModel):
    status: str = "success"
    recommendations: List[HospitalRecommendation]

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "PulseNet AI Service"}

@app.post("/get_top_hospitals")
def get_recommendations(request: dict):
    print(f"Received request: {request}")
    
    # Extract patient data
    severity = request.get("severity_level", 3)
    specialty = request.get("required_specialty", "").lower()
    heart_rate = request.get("heart_rate", 80)
    oxygen_level = request.get("oxygen_level", 95)
    bp_systolic = request.get("bp_systolic", 120)
    
    recommendations = []
    
    # Generate recommendations for hospitals 0-4
    for i in range(5):
        base_score = 85.0 - (i * 3)  # Decreasing scores: 85, 82, 79, 76, 73
        
        # Specialty matching bonus
        specialty_bonus = 0
        if specialty == "cardiology" and i == 0:
            specialty_bonus = 15
        elif specialty == "neurology" and i == 1:
            specialty_bonus = 12
        elif specialty == "surgery" and i == 2:
            specialty_bonus = 10
        elif specialty and i < 3:
            specialty_bonus = 8
            
        # Severity-based scoring
        severity_bonus = 0
        if severity >= 4:  # Critical patients
            if i < 2:  # Top 2 hospitals for critical cases
                severity_bonus = 10
        elif severity >= 3:  # Moderate cases
            if i < 3:
                severity_bonus = 5
                
        # Vital signs analysis
        vitals_bonus = 0
        if heart_rate > 100 or oxygen_level < 90 or bp_systolic > 140:
            if i < 2:  # Emergency-capable hospitals
                vitals_bonus = 8
                
        # Calculate final score
        final_score = base_score + specialty_bonus + severity_bonus + vitals_bonus
        final_score = min(final_score, 98.0)  # Cap at 98%
        
        # Generate reasoning
        reasoning_parts = []
        if specialty_bonus > 0:
            reasoning_parts.append(f"Excellent {specialty} department")
        if severity >= 4 and i < 2:
            reasoning_parts.append("Critical care facilities available")
        if vitals_bonus > 0:
            reasoning_parts.append("Emergency response capabilities")
        if i == 0:
            reasoning_parts.append("Shortest distance and travel time")
        elif i == 1:
            reasoning_parts.append("High-quality care with good availability")
        else:
            reasoning_parts.append("Good alternative with adequate facilities")
            
        reasoning = ". ".join(reasoning_parts) + "."
        
        recommendations.append(HospitalRecommendation(
            hospital_id=i,
            ai_score=round(final_score, 1),
            reasoning=reasoning,
            has_required_specialty=True if (specialty and i < 3) or not specialty else False,
            has_required_equipment=True if i < 4 else False,
            critical_no_icu=True if severity >= 4 and i >= 3 else False
        ))
    
    # Sort by score (highest first)
    recommendations.sort(key=lambda x: x.ai_score, reverse=True)
    
    print(f"Generated {len(recommendations)} recommendations")
    for rec in recommendations:
        print(f"Hospital {rec.hospital_id}: {rec.ai_score}% - {rec.reasoning}")
    
    return AIResponse(recommendations=recommendations)

if __name__ == "__main__":
    print("🤖 Starting PulseNet AI Service...")
    print("🏥 Hospital AI Recommendations Engine")
    print("📍 Running on: http://127.0.0.1:8000")
    print("🔍 Health check: http://127.0.0.1:8000/health")
    uvicorn.run(app, host="127.0.0.1", port=8000)