package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.healthcare.entity.enums.HospitalType;
import com.healthcare.entity.enums.OwnershipType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRegistrationDTO {
    
    // Basic Info
    private String name;
    private String registrationNo;
    private HospitalType type;
    private Integer estYear;
    private OwnershipType ownership;
    
    // Location
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal lat;
    private BigDecimal lng;
    
    // Infrastructure
    private Integer icuBeds;
    private Integer generalBeds;
    private Integer emergencyBeds;
    private Integer ventilators;
    private Integer operatingRooms;
    
    // Specialties
    private List<String> specialties;
    
    // Equipment (equipment ID: boolean)
    private Map<String, Boolean> equipment;
    
    // Contacts
    private String emergencyNo;
    private String controlNo;
    private String email;
    private String adminName;
    private String adminPhone;
    
    // Admin Account
    private String adminEmail;
    private String adminPassword;
}