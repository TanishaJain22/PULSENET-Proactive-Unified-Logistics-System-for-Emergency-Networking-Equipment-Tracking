package com.healthcare.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vital_signs")
@Data
@EqualsAndHashCode(callSuper = false)
public class VitalSigns {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // Patient Reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;
    
    // Visit Reference (optional - can be recorded outside of visits)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    @JsonIgnore
    private Visit visit;
    
    // Vital Signs Measurements
    @Column(precision = 5, scale = 2)
    private BigDecimal systolicBP; // mmHg
    
    @Column(precision = 5, scale = 2)
    private BigDecimal diastolicBP; // mmHg
    
    @Column(precision = 5, scale = 2)
    private BigDecimal heartRate; // bpm
    
    @Column(precision = 5, scale = 2)
    private BigDecimal respiratoryRate; // breaths per minute
    
    @Column(precision = 5, scale = 2)
    private BigDecimal temperature; // Celsius
    
    @Column(precision = 5, scale = 2)
    private BigDecimal oxygenSaturation; // %
    
    @Column(precision = 5, scale = 2)
    private BigDecimal weight; // kg
    
    @Column(precision = 5, scale = 2)
    private BigDecimal height; // cm
    
    @Column(precision = 5, scale = 2)
    private BigDecimal bmi; // calculated
    
    @Column(precision = 5, scale = 2)
    private BigDecimal bloodGlucose; // mg/dL
    
    @Column(precision = 5, scale = 2)
    private BigDecimal painLevel; // 0-10 scale
    
    // Additional Measurements
    @Column(length = 500)
    private String notes;
    
    @Column(length = 100)
    private String recordedBy; // Staff member who recorded
    
    @Column(length = 50)
    private String recordingDevice; // Monitor, Manual, etc.
    
    @Column(length = 50)
    private String location; // Emergency Room, ICU, Ambulance, etc.
    
    // Alert Flags
    @Column
    private Boolean isAbnormal = false;
    
    @Column
    private Boolean requiresAttention = false;
    
    @Column(length = 500)
    private String alertNotes;
    
    // Timestamp
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;
    
    // Computed Properties
    @Transient
    public String getBloodPressure() {
        if (systolicBP != null && diastolicBP != null) {
            return systolicBP + "/" + diastolicBP;
        }
        return null;
    }
    
    @Transient
    public BigDecimal calculateBMI() {
        if (weight != null && height != null && height.compareTo(BigDecimal.ZERO) > 0) {
            // BMI = weight(kg) / (height(m))^2
            BigDecimal heightInMeters = height.divide(BigDecimal.valueOf(100));
            return weight.divide(heightInMeters.multiply(heightInMeters), 2, java.math.RoundingMode.HALF_UP);
        }
        return null;
    }
    
    @Transient
    public Boolean isBloodPressureHigh() {
        if (systolicBP != null && diastolicBP != null) {
            return systolicBP.compareTo(BigDecimal.valueOf(140)) >= 0 || 
                   diastolicBP.compareTo(BigDecimal.valueOf(90)) >= 0;
        }
        return false;
    }
    
    @Transient
    public Boolean isHeartRateAbnormal() {
        if (heartRate != null) {
            return heartRate.compareTo(BigDecimal.valueOf(60)) < 0 || 
                   heartRate.compareTo(BigDecimal.valueOf(100)) > 0;
        }
        return false;
    }
    
    @Transient
    public Boolean isTemperatureFever() {
        if (temperature != null) {
            return temperature.compareTo(BigDecimal.valueOf(37.5)) > 0; // > 37.5°C
        }
        return false;
    }
    
    @Transient
    public Boolean isOxygenSaturationLow() {
        if (oxygenSaturation != null) {
            return oxygenSaturation.compareTo(BigDecimal.valueOf(95)) < 0; // < 95%
        }
        return false;
    }
}