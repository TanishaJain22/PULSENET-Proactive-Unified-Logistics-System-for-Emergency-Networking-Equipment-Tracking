package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRecommendationDTO {
    
    private UUID hospitalId;
    private String hospitalName;
    private Double distanceKm;
    private Integer travelTimeMinutes;
    private Double aiScore;
    private String reasoning;
    
    // Availability Status
    private Integer icuBedsAvailable;
    private Integer generalBedsAvailable;
    private Integer ventilatorsAvailable;
    private Boolean specialistAvailable;
    private Boolean isAcceptingTransfers;
    
    // Hospital Load
    private Double hospitalLoadPercentage;
    private String loadStatus; // "Normal", "High", "Critical"
    
    // Specialty Match
    private Boolean hasRequiredSpecialty;
    private Integer specialistCount;
    
    // Equipment Availability
    private Boolean hasRequiredEquipment;
    
    // Risk Factors
    private Boolean isHospitalFull;
    private Boolean criticalNoICU;
    
    // Contact Information
    private String contactPhone;
    private String emergencyContact;
}