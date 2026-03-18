package com.healthcare.entity;

import com.healthcare.entity.enums.VisitType;
import com.healthcare.entity.enums.VisitStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "visits")
@Data
@EqualsAndHashCode(callSuper = false)
public class Visit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // Patient Reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;
    
    // Hospital Reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    @JsonIgnore
    private Hospital hospital;
    
    // Visit Information
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitType visitType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitStatus status = VisitStatus.SCHEDULED;
    
    @Column(nullable = false)
    private LocalDateTime scheduledDateTime;
    
    private LocalDateTime actualStartTime;
    
    private LocalDateTime actualEndTime;
    
    // Medical Information
    @Column(length = 1000)
    private String chiefComplaint;
    
    @Column(length = 2000)
    private String symptoms;
    
    @Column(length = 2000)
    private String diagnosis;
    
    @Column(length = 2000)
    private String treatment;
    
    @Column(length = 2000)
    private String prescriptions;
    
    @Column(length = 1000)
    private String followUpInstructions;
    
    // Doctor Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attending_doctor_id")
    @JsonIgnore
    private Doctor attendingDoctor;
    
    // Emergency Information (if applicable)
    @Column
    private Boolean isEmergency = false;
    
    @Column(length = 50)
    private String ambulanceId; // Reference to ambulance if arrived by ambulance
    
    @Column(length = 100)
    private String emergencySeverity; // Critical, High, Medium, Low
    
    // Billing Information
    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal insuranceCovered;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal patientResponsibility;
    
    @Column(length = 50)
    private String billingStatus; // Pending, Billed, Paid, Insurance_Processing
    
    // Room/Bed Assignment
    @Column(length = 50)
    private String roomNumber;
    
    @Column(length = 50)
    private String bedNumber;
    
    // Relationships
    @OneToMany(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VitalSigns> vitalSigns;
    
    @OneToMany(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalDocument> documents;
    
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
    public Long getDurationMinutes() {
        if (actualStartTime != null && actualEndTime != null) {
            return java.time.Duration.between(actualStartTime, actualEndTime).toMinutes();
        }
        return null;
    }
    
    @Transient
    public Boolean isInProgress() {
        return status == VisitStatus.IN_PROGRESS;
    }
    
    @Transient
    public Boolean isCompleted() {
        return status == VisitStatus.COMPLETED;
    }
}