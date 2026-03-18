package com.healthcare.dto;

import com.healthcare.entity.enums.TransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferResponseDTO {
    
    private UUID id;
    private String patientId;
    private String patientName;
    
    // Hospital Information
    private UUID fromHospitalId;
    private String fromHospitalName;
    private UUID toHospitalId;
    private String toHospitalName;
    
    // Transfer Status
    private TransferStatus status;
    private String statusDescription;
    
    // Patient Condition
    private String requiredSpecialty;
    private Integer severityLevel;
    private String transferReason;
    private String reasonDescription;
    
    // AI Recommendation
    private Double aiRecommendationScore;
    private String aiReasoning;
    
    // Timeline
    private LocalDateTime requestedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime estimatedArrival;
    private LocalDateTime arrivedAt;
    private LocalDateTime completedAt;
    
    // Travel Information
    private Double distanceKm;
    private Integer estimatedTravelTime;
    private String ambulanceId;
    
    // Additional Information
    private String notes;
    private String rejectionReason;
    
    // Contact Information
    private String contactPhone;
    private String emergencyContact;
}