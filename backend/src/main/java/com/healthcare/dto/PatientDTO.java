package com.healthcare.dto;

import com.healthcare.entity.enums.BloodType;
import com.healthcare.entity.enums.Gender;
import com.healthcare.entity.enums.PatientStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PatientDTO {
    private UUID id;
    
    // Basic Demographics
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private BloodType bloodType;
    
    // Contact Information
    private String phoneNumber;
    private String email;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    // Identification
    private String nationalId;
    private String medicalRecordNumber;
    
    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    
    // Medical Information
    private String allergies;
    private String chronicConditions;
    private String currentMedications;
    private String medicalNotes;
    
    // Insurance Information
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceGroupNumber;
    
    // System Fields
    private PatientStatus status;
    private Boolean isEmergencyAccessEnabled;
    private String qrCodeId;
    
    // Computed Fields
    private String fullName;
    private Integer age;
    private String formattedAddress;
    
    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    // Statistics (for dashboard)
    private Long totalVisits;
    private LocalDateTime lastVisitDate;
    private String lastVisitType;
}