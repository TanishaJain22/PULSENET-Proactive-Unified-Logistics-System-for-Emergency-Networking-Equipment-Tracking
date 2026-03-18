package com.healthcare.entity;

import com.healthcare.entity.enums.Gender;
import com.healthcare.entity.enums.BloodType;
import com.healthcare.entity.enums.PatientStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Data
@EqualsAndHashCode(callSuper = false)
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // Basic Demographics
    @Column(nullable = false, length = 100)
    private String firstName;
    
    @Column(nullable = false, length = 100)
    private String lastName;
    
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;
    
    @Enumerated(EnumType.STRING)
    private BloodType bloodType;
    
    // Contact Information
    @Column(unique = true, length = 15)
    private String phoneNumber;
    
    @Column(unique = true, length = 255)
    private String email;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 100)
    private String city;
    
    @Column(length = 100)
    private String state;
    
    @Column(length = 20)
    private String zipCode;
    
    @Column(length = 100)
    private String country;
    
    // Identification
    @Column(unique = true, length = 50)
    private String nationalId; // Aadhaar, SSN, etc.
    
    @Column(unique = true, length = 50)
    private String medicalRecordNumber;
    
    // Emergency Contact
    @Column(length = 200)
    private String emergencyContactName;
    
    @Column(length = 15)
    private String emergencyContactPhone;
    
    @Column(length = 100)
    private String emergencyContactRelation;
    
    // Medical Information
    @Column(length = 2000)
    private String allergies;
    
    @Column(length = 2000)
    private String chronicConditions;
    
    @Column(length = 2000)
    private String currentMedications;
    
    @Column(length = 1000)
    private String medicalNotes;
    
    // Insurance Information
    @Column(length = 100)
    private String insuranceProvider;
    
    @Column(length = 50)
    private String insurancePolicyNumber;
    
    @Column(length = 50)
    private String insuranceGroupNumber;
    
    // System Fields
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PatientStatus status = PatientStatus.ACTIVE;
    
    @Column(nullable = false)
    private Boolean isEmergencyAccessEnabled = true;
    
    @Column(length = 100)
    private String qrCodeId; // For emergency quick access
    
    // Relationships
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Visit> visits;
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VitalSigns> vitalSigns;
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalDocument> medicalDocuments;
    
    // Audit Fields
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(length = 100)
    private String createdBy;
    
    @Column(length = 100)
    private String updatedBy;
    
    // Computed Fields
    @Transient
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    @Transient
    public int getAge() {
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }
    
    @Transient
    public String getFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        if (address != null) sb.append(address);
        if (city != null) sb.append(", ").append(city);
        if (state != null) sb.append(", ").append(state);
        if (zipCode != null) sb.append(" ").append(zipCode);
        return sb.toString();
    }
}