package com.healthcare.dto;

import com.healthcare.entity.enums.AmbulanceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAmbulanceRequestDTO {
    
    @NotNull(message = "Hospital ID is required")
    private UUID hospitalId;
    
    @NotBlank(message = "Patient name is required")
    private String patientName;
    
    private String patientContact;
    
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;
    
    private Double pickupLatitude;
    private Double pickupLongitude;
    
    private String destinationLocation;
    private Double destinationLatitude;
    private Double destinationLongitude;
    
    @NotNull(message = "Ambulance type is required")
    private AmbulanceType ambulanceTypeRequested;
    
    private String emergencyDetails;
}