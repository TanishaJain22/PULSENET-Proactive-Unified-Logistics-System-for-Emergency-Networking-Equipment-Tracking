package com.healthcare.dto;

import com.healthcare.entity.enums.AmbulanceStatus;
import lombok.Data;

import jakarta.validation.constraints.NotNull;

@Data
public class UpdateAmbulanceStatusDTO {
    @NotNull(message = "Status is required")
    private AmbulanceStatus status;
    
    private String reason;
    private String notes;
}