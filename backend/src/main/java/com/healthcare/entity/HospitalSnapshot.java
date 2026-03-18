package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospital_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private Hospital hospital;

    // AI Model Required Fields
    @Column(name = "icu_beds_available")
    private Integer icuBedsAvailable;

    @Column(name = "general_beds_available")
    private Integer generalBedsAvailable;

    @Column(name = "ventilators_available")
    private Integer ventilatorsAvailable;

    @Column(name = "specialist_count")
    private Integer specialistCount;

    @Column(name = "hospital_load_percentage")
    private Double hospitalLoadPercentage;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "travel_time_minutes")
    private Integer travelTimeMinutes;

    // Specialty Availability
    @Column(name = "cardiology_specialists")
    private Integer cardiologySpecialists;

    @Column(name = "neurology_specialists")
    private Integer neurologySpecialists;

    @Column(name = "emergency_specialists")
    private Integer emergencySpecialists;

    @Column(name = "surgery_specialists")
    private Integer surgerySpecialists;

    @Column(name = "pediatrics_specialists")
    private Integer pediatricsSpecialists;

    @Column(name = "orthopedics_specialists")
    private Integer orthopedicsSpecialists;

    @Column(name = "oncology_specialists")
    private Integer oncologySpecialists;

    // Equipment Availability
    @Column(name = "ct_scanner_available")
    private Boolean ctScannerAvailable;

    @Column(name = "mri_available")
    private Boolean mriAvailable;

    @Column(name = "dialysis_available")
    private Boolean dialysisAvailable;

    @Column(name = "operating_rooms_available")
    private Integer operatingRoomsAvailable;

    @Column(name = "snapshot_time")
    private LocalDateTime snapshotTime = LocalDateTime.now();

    @Column(name = "is_accepting_transfers")
    private Boolean isAcceptingTransfers = true;

    // ML Model Required Fields
    @Column(name = "specialist_score")
    private Integer specialistScore; // 0-5 unified specialist availability score

    @Column(name = "ml_hospital_id")
    private Integer mlHospitalId; // 0-4 mapping for ML model

    // AI Model Helper Methods
    public Boolean isHospitalFull() {
        return hospitalLoadPercentage != null && hospitalLoadPercentage > 85.0;
    }

    public Boolean hasSpecialtyMatch(String specialty) {
        if (specialty == null) return false;
        
        switch (specialty.toLowerCase()) {
            case "cardiology":
                return cardiologySpecialists != null && cardiologySpecialists >= 1;
            case "neurology":
                return neurologySpecialists != null && neurologySpecialists >= 1;
            case "emergency medicine":
                return emergencySpecialists != null && emergencySpecialists >= 1;
            case "surgery":
                return surgerySpecialists != null && surgerySpecialists >= 1;
            case "pediatrics":
                return pediatricsSpecialists != null && pediatricsSpecialists >= 1;
            case "orthopedics":
                return orthopedicsSpecialists != null && orthopedicsSpecialists >= 1;
            case "oncology":
                return oncologySpecialists != null && oncologySpecialists >= 1;
            default:
                return specialistCount != null && specialistCount >= 1;
        }
    }

    public Boolean hasCriticalNoICU(Integer severityLevel) {
        return severityLevel != null && severityLevel >= 4 && 
               icuBedsAvailable != null && icuBedsAvailable <= 2;
    }

    // ML Model Compatibility Methods
    public Integer calculateSpecialistScore(String requiredSpecialty) {
        if (requiredSpecialty == null) {
            // General specialist availability score (0-5)
            int totalSpecialists = (cardiologySpecialists != null ? cardiologySpecialists : 0) +
                                 (neurologySpecialists != null ? neurologySpecialists : 0) +
                                 (emergencySpecialists != null ? emergencySpecialists : 0) +
                                 (surgerySpecialists != null ? surgerySpecialists : 0) +
                                 (pediatricsSpecialists != null ? pediatricsSpecialists : 0) +
                                 (orthopedicsSpecialists != null ? orthopedicsSpecialists : 0) +
                                 (oncologySpecialists != null ? oncologySpecialists : 0);
            
            if (totalSpecialists >= 15) return 5;
            if (totalSpecialists >= 10) return 4;
            if (totalSpecialists >= 6) return 3;
            if (totalSpecialists >= 3) return 2;
            if (totalSpecialists >= 1) return 1;
            return 0;
        }
        
        // Specialty-specific score (0-5)
        Integer specialtyCount = getSpecialtyCount(requiredSpecialty);
        if (specialtyCount == null || specialtyCount == 0) return 0;
        if (specialtyCount >= 5) return 5;
        if (specialtyCount >= 3) return 4;
        if (specialtyCount >= 2) return 3;
        if (specialtyCount >= 1) return 2;
        return 1;
    }

    private Integer getSpecialtyCount(String specialty) {
        switch (specialty.toLowerCase()) {
            case "cardiology": return cardiologySpecialists;
            case "neurology": return neurologySpecialists;
            case "emergency medicine": return emergencySpecialists;
            case "surgery": return surgerySpecialists;
            case "pediatrics": return pediatricsSpecialists;
            case "orthopedics": return orthopedicsSpecialists;
            case "oncology": return oncologySpecialists;
            default: return specialistCount;
        }
    }
}