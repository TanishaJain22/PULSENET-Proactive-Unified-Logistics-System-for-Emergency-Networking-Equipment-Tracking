package com.healthcare.dto;

import com.healthcare.entity.enums.BloodType;
import com.healthcare.entity.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePatientDTO {
    
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    private BloodType bloodType;
    
    // Contact Information
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;
    
    @Size(max = 20, message = "Zip code must not exceed 20 characters")
    private String zipCode;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    // Identification
    @Size(max = 50, message = "National ID must not exceed 50 characters")
    private String nationalId;
    
    // Emergency Contact
    @Size(max = 200, message = "Emergency contact name must not exceed 200 characters")
    private String emergencyContactName;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid emergency contact phone format")
    private String emergencyContactPhone;
    
    @Size(max = 100, message = "Emergency contact relation must not exceed 100 characters")
    private String emergencyContactRelation;
    
    // Medical Information
    @Size(max = 2000, message = "Allergies must not exceed 2000 characters")
    private String allergies;
    
    @Size(max = 2000, message = "Chronic conditions must not exceed 2000 characters")
    private String chronicConditions;
    
    @Size(max = 2000, message = "Current medications must not exceed 2000 characters")
    private String currentMedications;
    
    @Size(max = 1000, message = "Medical notes must not exceed 1000 characters")
    private String medicalNotes;
    
    // Insurance Information
    @Size(max = 100, message = "Insurance provider must not exceed 100 characters")
    private String insuranceProvider;
    
    @Size(max = 50, message = "Insurance policy number must not exceed 50 characters")
    private String insurancePolicyNumber;
    
    @Size(max = 50, message = "Insurance group number must not exceed 50 characters")
    private String insuranceGroupNumber;
    
    // System Fields
    private Boolean isEmergencyAccessEnabled = true;
}