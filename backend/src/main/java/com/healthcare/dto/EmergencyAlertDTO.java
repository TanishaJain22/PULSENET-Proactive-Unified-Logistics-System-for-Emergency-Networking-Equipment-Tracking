package com.healthcare.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class EmergencyAlertDTO {
    @NotBlank(message = "Message is required")
    @Size(max = 500, message = "Message cannot exceed 500 characters")
    private String message;
    
    private String alertType = "EMERGENCY";
    private Double latitude;
    private Double longitude;
}