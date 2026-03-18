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
public class AmbulanceDTO {
    private UUID id;
    private String vehicleNumber;
    private UUID hospitalId;
    private String hospitalName;
    private AmbulanceType type;
    private AmbulanceStatus status;
    private String driverName;
    private String driverContact;
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentLocationString;
    private LocalDateTime lastLocationUpdate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for tracking
    private AmbulanceLocationDTO currentLocation;
    private AmbulanceRequestDTO activeRequest;
    private String estimatedArrival;
    private Double distanceToDestination;
    private Double currentSpeed;
    private boolean isActive;
}