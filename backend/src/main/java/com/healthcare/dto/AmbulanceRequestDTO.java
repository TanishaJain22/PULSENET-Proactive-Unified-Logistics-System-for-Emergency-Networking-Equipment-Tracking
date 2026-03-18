package com.healthcare.dto;

import com.healthcare.entity.enums.AmbulanceStatus;
import com.healthcare.entity.enums.AmbulanceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmbulanceRequestDTO {
    private UUID id;
    private UUID hospitalId;
    private String hospitalName;
    private UUID ambulanceId;
    private String ambulanceVehicleNumber;
    private String patientName;
    private String patientContact;
    private String pickupLocation;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private String destinationLocation;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private AmbulanceType ambulanceTypeRequested;
    private AmbulanceStatus status;
    private String emergencyDetails;
    private LocalDateTime estimatedArrivalTime;
    private LocalDateTime actualArrivalTime;
    private LocalDateTime completionTime;
    private Double distanceKm;
    private LocalDateTime requestTime;
    private Boolean approvedByHospital;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional tracking fields
    private String pickupLocationString;
    private String destinationLocationString;
    private boolean isActive;
    private boolean isCompleted;
    private String estimatedArrivalString;
    private Long elapsedTimeMinutes;
}