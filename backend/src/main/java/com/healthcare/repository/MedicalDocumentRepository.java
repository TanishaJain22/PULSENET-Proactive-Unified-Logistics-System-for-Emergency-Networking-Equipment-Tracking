package com.healthcare.repository;

import com.healthcare.entity.MedicalDocument;
import com.healthcare.entity.enums.DocumentStatus;
import com.healthcare.entity.enums.DocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, UUID> {
    
    // Patient-based Queries
    List<MedicalDocument> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    Page<MedicalDocument> findByPatientId(UUID patientId, Pageable pageable);
    
    // Visit-based Queries
    List<MedicalDocument> findByVisitIdOrderByCreatedAtDesc(UUID visitId);
    Page<MedicalDocument> findByVisitId(UUID visitId, Pageable pageable);
    
    // Document Type Queries
    List<MedicalDocument> findByDocumentType(DocumentType documentType);
    Page<MedicalDocument> findByDocumentType(DocumentType documentType, Pageable pageable);
    List<MedicalDocument> findByPatientIdAndDocumentType(UUID patientId, DocumentType documentType);
    Page<MedicalDocument> findByPatientAndDocumentTypeOrderByCreatedAtDesc(
        com.healthcare.entity.Patient patient, DocumentType documentType, Pageable pageable);
    List<MedicalDocument> findByPatientAndDocumentTypeAndIsAbnormalTrueOrderByCreatedAtDesc(
        com.healthcare.entity.Patient patient, DocumentType documentType);
    
    // Status-based Queries
    List<MedicalDocument> findByStatus(DocumentStatus status);
    Page<MedicalDocument> findByStatus(DocumentStatus status, Pageable pageable);
    List<MedicalDocument> findByPatientIdAndStatus(UUID patientId, DocumentStatus status);
    
    // Alert-based Queries
    List<MedicalDocument> findByIsAbnormalTrue();
    List<MedicalDocument> findByIsCriticalTrue();
    List<MedicalDocument> findByPatientIdAndIsAbnormalTrue(UUID patientId);
    List<MedicalDocument> findByPatientIdAndIsCriticalTrue(UUID patientId);
    
    // Access Control Queries
    List<MedicalDocument> findByPatientIdAndPatientCanViewTrue(UUID patientId);
    List<MedicalDocument> findByIsConfidentialFalse();
    
    // Date-based Queries
    List<MedicalDocument> findByTestDateBetween(LocalDateTime start, LocalDateTime end);
    List<MedicalDocument> findByReportDateBetween(LocalDateTime start, LocalDateTime end);
    List<MedicalDocument> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Review Status Queries
    @Query("SELECT d FROM MedicalDocument d WHERE d.reviewedBy IS NULL")
    List<MedicalDocument> findUnreviewedDocuments();
    
    @Query("SELECT d FROM MedicalDocument d WHERE d.reviewedBy IS NOT NULL")
    List<MedicalDocument> findReviewedDocuments();
    
    @Query("SELECT d FROM MedicalDocument d WHERE d.reviewedBy.id = :doctorId")
    List<MedicalDocument> findByReviewedByDoctorId(@Param("doctorId") UUID doctorId);
    
    // Search Queries
    @Query("SELECT d FROM MedicalDocument d WHERE " +
           "LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.testName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<MedicalDocument> searchDocuments(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Provider-based Queries
    List<MedicalDocument> findByOrderingPhysician(String orderingPhysician);
    List<MedicalDocument> findByPerformingLab(String performingLab);
    
    // Statistics Queries
    @Query("SELECT COUNT(d) FROM MedicalDocument d WHERE d.status = :status")
    Long countByStatus(@Param("status") DocumentStatus status);
    
    @Query("SELECT COUNT(d) FROM MedicalDocument d WHERE d.documentType = :documentType")
    Long countByDocumentType(@Param("documentType") DocumentType documentType);
    
    @Query("SELECT COUNT(d) FROM MedicalDocument d WHERE d.isAbnormal = true")
    Long countAbnormalDocuments();
    
    @Query("SELECT COUNT(d) FROM MedicalDocument d WHERE d.isCritical = true")
    Long countCriticalDocuments();
    
    @Query("SELECT COUNT(d) FROM MedicalDocument d WHERE d.patient.id = :patientId")
    Long countByPatientId(@Param("patientId") UUID patientId);
    
    // Recent Documents
    @Query("SELECT d FROM MedicalDocument d WHERE d.createdAt >= :since ORDER BY d.createdAt DESC")
    List<MedicalDocument> findRecentDocuments(@Param("since") LocalDateTime since);
}