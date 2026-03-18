package com.healthcare.entity;

import com.healthcare.entity.enums.DocumentType;
import com.healthcare.entity.enums.DocumentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_documents")
@Data
@EqualsAndHashCode(callSuper = false)
public class MedicalDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // Patient Reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;
    
    // Visit Reference (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    @JsonIgnore
    private Visit visit;
    
    // Document Information
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.PENDING;
    
    // File Information
    @Column(length = 500)
    private String fileName;
    
    @Column(length = 500)
    private String filePath;
    
    @Column(length = 100)
    private String mimeType;
    
    @Column
    private Long fileSize; // in bytes
    
    @Column(length = 100)
    private String fileHash; // for integrity verification
    
    // Medical Information
    @Column(length = 100)
    private String testName; // for lab results
    
    @Column(length = 2000)
    private String results; // test results or report content
    
    @Column(length = 1000)
    private String interpretation; // doctor's interpretation
    
    @Column(length = 500)
    private String referenceRanges; // normal ranges for lab tests
    
    @Column
    private Boolean isAbnormal = false;
    
    @Column
    private Boolean isCritical = false;
    
    // Provider Information
    @Column(length = 200)
    private String orderingPhysician;
    
    @Column(length = 200)
    private String performingLab; // lab or imaging center
    
    @Column
    private LocalDateTime testDate;
    
    @Column
    private LocalDateTime reportDate;
    
    // Access Control
    @Column
    private Boolean isConfidential = false;
    
    @Column(length = 500)
    private String accessRestrictions;
    
    @Column
    private Boolean patientCanView = true;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_doctor_id")
    @JsonIgnore
    private Doctor reviewedBy;
    
    @Column
    private LocalDateTime reviewedAt;
    
    @Column(length = 1000)
    private String reviewNotes;
    
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
    
    // Computed Properties
    @Transient
    public String getFormattedFileSize() {
        if (fileSize == null) return "Unknown";
        
        if (fileSize < 1024) return fileSize + " B";
        if (fileSize < 1024 * 1024) return String.format("%.1f KB", fileSize / 1024.0);
        if (fileSize < 1024 * 1024 * 1024) return String.format("%.1f MB", fileSize / (1024.0 * 1024.0));
        return String.format("%.1f GB", fileSize / (1024.0 * 1024.0 * 1024.0));
    }
    
    @Transient
    public Boolean isPending() {
        return status == DocumentStatus.PENDING;
    }
    
    @Transient
    public Boolean isReviewed() {
        return reviewedBy != null && reviewedAt != null;
    }
    
    @Transient
    public Boolean requiresAttention() {
        return isAbnormal || isCritical || status == DocumentStatus.PENDING;
    }
}