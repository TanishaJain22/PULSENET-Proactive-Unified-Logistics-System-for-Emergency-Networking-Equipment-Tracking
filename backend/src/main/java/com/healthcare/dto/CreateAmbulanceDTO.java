package com.healthcare.dto;

import com.healthcare.entity.enums.AmbulanceType;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;

@Data
public class CreateAmbulanceDTO {
    @NotBlank(message = "Vehicle number is required")
    @Pattern(regexp = "^[A-Z]{2}-\\d{2}-[A-Z]{2}-\\d{4}$", 
             message = "Vehicle number must follow format: XX-00-XX-0000")
    private String vehicleNumber;
    
    @NotNull(message = "Hospital ID is required")
    private UUID hospitalId;
    
    @NotNull(message = "Ambulance type is required")
    private AmbulanceType type;
    
    @NotBlank(message = "Driver name is required")
    private String driverName;
    
    @NotBlank(message = "Driver contact is required")
    @Pattern(regexp = "^\\+91-\\d{10}$", 
             message = "Driver contact must follow format: +91-0000000000")
    private String driverContact;
    
    private Double currentLatitude = 28.6139; // Default to Delhi
    private Double currentLongitude = 77.2090;
}