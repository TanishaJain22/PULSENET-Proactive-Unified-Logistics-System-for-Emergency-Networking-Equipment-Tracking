package com.healthcare.dto;

import com.healthcare.entity.enums.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequestDTO {
    
    // Patient Information
    private String patientId;
    private String patientName;
    private UUID fromHospitalId;
    
    // Patient Vitals (Required by AI Model)
    private Integer heartRate;
    private Double oxygenLevel;
    private Double temperature;
    private Integer bpSystolic;
    private Integer bpDiastolic;
    private Integer respiratoryRate;
    private Boolean supplementalO2;
    private ConsciousnessLevel consciousnessLevel;
    private Integer severityLevel;
    
    // Transfer Details
    private String requiredSpecialty;
    private TrafficCondition trafficCondition;
    private Integer estimatedTravelTime;
    private TransferReason transferReason;
    private String reasonDescription;
    private String notes;
    
    // Optional - if requesting specific hospital
    private UUID requestedHospitalId;
}