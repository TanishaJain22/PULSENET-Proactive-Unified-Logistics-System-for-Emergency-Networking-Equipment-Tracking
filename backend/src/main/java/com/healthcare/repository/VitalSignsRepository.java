package com.healthcare.repository;

import com.healthcare.entity.VitalSigns;
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
public interface VitalSignsRepository extends JpaRepository<VitalSigns, UUID> {
    
    // Patient-based Queries
    List<VitalSigns> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    Page<VitalSigns> findByPatientId(UUID patientId, Pageable pageable);
    
    // Visit-based Queries
    List<VitalSigns> findByVisitIdOrderByRecordedAtDesc(UUID visitId);
    Page<VitalSigns> findByVisitId(UUID visitId, Pageable pageable);
    
    // Date-based Queries
    List<VitalSigns> findByRecordedAtBetween(LocalDateTime start, LocalDateTime end);
    List<VitalSigns> findByPatientIdAndRecordedAtBetween(UUID patientId, LocalDateTime start, LocalDateTime end);
    
    // Alert-based Queries
    List<VitalSigns> findByIsAbnormalTrue();
    List<VitalSigns> findByRequiresAttentionTrue();
    List<VitalSigns> findByPatientIdAndIsAbnormalTrue(UUID patientId);
    
    // Location-based Queries
    List<VitalSigns> findByLocation(String location);
    List<VitalSigns> findByLocationAndRecordedAtBetween(String location, LocalDateTime start, LocalDateTime end);
    
    // Recent Vital Signs
    @Query("SELECT v FROM VitalSigns v WHERE v.patient.id = :patientId ORDER BY v.recordedAt DESC LIMIT 1")
    VitalSigns findLatestByPatient(@Param("patientId") UUID patientId);
    
    @Query("SELECT v FROM VitalSigns v WHERE v.recordedAt >= :since ORDER BY v.recordedAt DESC")
    List<VitalSigns> findRecentVitalSigns(@Param("since") LocalDateTime since);
    
    // Statistics Queries
    @Query("SELECT COUNT(v) FROM VitalSigns v WHERE v.isAbnormal = true")
    Long countAbnormalVitalSigns();
    
    @Query("SELECT COUNT(v) FROM VitalSigns v WHERE v.requiresAttention = true")
    Long countVitalSignsRequiringAttention();
    
    @Query("SELECT COUNT(v) FROM VitalSigns v WHERE v.patient.id = :patientId")
    Long countByPatientId(@Param("patientId") UUID patientId);
}