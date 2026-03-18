package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalLoginDTO {
    
    @NotBlank(message = "Identity is required")
    private String identity;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "OTP is required")
    private String otp;
}