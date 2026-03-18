package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalReviewDTO {
    
    @NotNull(message = "Status is required")
    private String status; // APPROVED, REJECTED, UNDER_REVIEW
    
    @NotBlank(message = "Admin comments are required")
    private String adminComments;
    
    private String reviewedBy; // Admin user ID (optional, will be set from JWT)
}