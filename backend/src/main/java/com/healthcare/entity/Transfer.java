package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.healthcare.entity.enums.TransferStatus;
import com.healthcare.entity.enums.TransferReason;
import com.healthcare.entity.enums.TrafficCondition;
import com.healthcare.entity.enums.ConsciousnessLevel;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transfers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "from_hospital_id", nullable = false)
    private UUID fromHospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_hospital_id", insertable = false, updatable = false)
    @JsonIgnore
    private Hospital fromHospital;

    @Column(name = "to_hospital_id")
    private UUID toHospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_hospital_id", insertable = false, updatable = false)
    @JsonIgnore
    private Hospital toHospital;

    @Column(name = "requested_hospital_id")
    private UUID requestedHospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_hospital_id", insertable = false, updatable = false)
    @JsonIgnore
    private Hospital requestedHospital;

    // Patient Vitals (Required by AI Model)
    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "oxygen_level")
    private Double oxygenLevel;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "bp_systolic")
    private Integer bpSystolic;

    @Column(name = "bp_diastolic")
    private Integer bpDiastolic;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "supplemental_o2")
    private Boolean supplementalO2;

    @Enumerated(EnumType.STRING)
    @Column(name = "consciousness_level")
    private ConsciousnessLevel consciousnessLevel;

    @Column(name = "severity_level")
    private Integer severityLevel;

    // Transfer Details
    @Column(name = "required_specialty", nullable = false)
    private String requiredSpecialty;

    @Column(name = "specialty_encoded")
    private Integer specialtyEncoded;

    @Enumerated(EnumType.STRING)
    @Column(name = "traffic_condition")
    private TrafficCondition trafficCondition;

    @Column(name = "traffic_encoded")
    private Integer trafficEncoded;

    @Column(name = "estimated_travel_time")
    private Integer estimatedTravelTime; // in minutes

    @Enumerated(EnumType.STRING)
    @Column(name = "transfer_reason", nullable = false)
    private TransferReason transferReason;

    @Column(name = "reason_description", columnDefinition = "TEXT")
    private String reasonDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status = TransferStatus.REQUESTED;

    @Column(name = "ai_recommendation_score")
    private Double aiRecommendationScore;

    @Column(name = "ai_reasoning", columnDefinition = "TEXT")
    private String aiReasoning;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "requested_by")
    private UUID requestedBy;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "ambulance_id")
    private String ambulanceId;

    @Column(name = "estimated_arrival")
    private LocalDateTime estimatedArrival;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Helper methods for AI model
    public Double calculateTravelSeverityRisk() {
        if (severityLevel != null && estimatedTravelTime != null) {
            return severityLevel * estimatedTravelTime.doubleValue();
        }
        return 0.0;
    }

    public Integer calculateNEWS2Score() {
        // Complete NEWS2 calculation based on clinical guidelines
        int score = 0;
        
        // 1. Respiratory Rate (12-20 normal)
        if (respiratoryRate != null) {
            if (respiratoryRate <= 8) score += 3;
            else if (respiratoryRate <= 11) score += 1;
            else if (respiratoryRate >= 25) score += 3;
            else if (respiratoryRate >= 21) score += 2;
            // 12-20 = 0 points (normal)
        }
        
        // 2. Oxygen Saturation (SpO2) - Scale 1 if on air, Scale 2 if on oxygen
        if (oxygenLevel != null) {
            if (supplementalO2 != null && supplementalO2) {
                // Scale 2: Patient on supplemental oxygen
                if (oxygenLevel <= 83) score += 3;
                else if (oxygenLevel <= 85) score += 2;
                else if (oxygenLevel <= 87) score += 1;
                // 88-92 on oxygen = 0 points
                // ≥93 on oxygen = 0 points
            } else {
                // Scale 1: Patient breathing room air
                if (oxygenLevel <= 91) score += 3;
                else if (oxygenLevel <= 93) score += 2;
                else if (oxygenLevel <= 95) score += 1;
                // ≥96 on air = 0 points
            }
        }
        
        // 3. Supplemental Oxygen (2 points if on oxygen)
        if (supplementalO2 != null && supplementalO2) {
            score += 2;
        }
        
        // 4. Systolic Blood Pressure (111-219 normal)
        if (bpSystolic != null) {
            if (bpSystolic <= 90) score += 3;
            else if (bpSystolic <= 100) score += 2;
            else if (bpSystolic <= 110) score += 1;
            else if (bpSystolic >= 220) score += 3;
            // 111-219 = 0 points (normal)
        }
        
        // 5. Heart Rate (51-90 normal)
        if (heartRate != null) {
            if (heartRate <= 40) score += 3;
            else if (heartRate <= 50) score += 1;
            else if (heartRate >= 131) score += 3;
            else if (heartRate >= 111) score += 2;
            else if (heartRate >= 91) score += 1;
            // 51-90 = 0 points (normal)
        }
        
        // 6. Level of Consciousness (AVPU Scale)
        if (consciousnessLevel != null) {
            switch (consciousnessLevel) {
                case ALERT:
                    // 0 points - fully alert
                    break;
                case VOICE:
                case PAIN:
                case UNRESPONSIVE:
                    score += 3; // Any altered consciousness = 3 points
                    break;
            }
        }
        
        // 7. Temperature (36.1-38.0°C normal)
        if (temperature != null) {
            if (temperature <= 35.0) score += 3;
            else if (temperature <= 36.0) score += 1;
            else if (temperature >= 39.1) score += 2;
            else if (temperature >= 38.1) score += 1;
            // 36.1-38.0 = 0 points (normal)
        }
        
        return score;
    }

    /**
     * Get NEWS2 risk category based on score
     */
    public String getNEWS2RiskCategory() {
        Integer score = calculateNEWS2Score();
        if (score == null) return "UNKNOWN";
        
        if (score == 0) return "LOW";
        else if (score <= 4) return "LOW";
        else if (score <= 6) return "MEDIUM";
        else return "HIGH";
    }

    /**
     * Get clinical response required based on NEWS2 score
     */
    public String getNEWS2ClinicalResponse() {
        Integer score = calculateNEWS2Score();
        if (score == null) return "ASSESSMENT_REQUIRED";
        
        if (score == 0) return "ROUTINE_MONITORING";
        else if (score <= 4) return "HOURLY_MONITORING";
        else if (score <= 6) return "URGENT_RESPONSE";
        else return "EMERGENCY_RESPONSE";
    }
}