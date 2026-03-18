package com.healthcare.repository;

import com.healthcare.entity.HospitalSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalSnapshotRepository extends JpaRepository<HospitalSnapshot, UUID> {
    
    // Get latest snapshot for a hospital
    Optional<HospitalSnapshot> findTopByHospitalIdOrderBySnapshotTimeDesc(UUID hospitalId);
    
    // Get latest snapshots for all hospitals
    @Query("SELECT h FROM HospitalSnapshot h WHERE h.snapshotTime = " +
           "(SELECT MAX(h2.snapshotTime) FROM HospitalSnapshot h2 WHERE h2.hospitalId = h.hospitalId)")
    List<HospitalSnapshot> findLatestSnapshotsForAllHospitals();
    
    // Get snapshots for hospitals accepting transfers
    @Query("SELECT h FROM HospitalSnapshot h WHERE h.isAcceptingTransfers = true AND h.snapshotTime = " +
           "(SELECT MAX(h2.snapshotTime) FROM HospitalSnapshot h2 WHERE h2.hospitalId = h.hospitalId)")
    List<HospitalSnapshot> findLatestSnapshotsForAcceptingHospitals();
    
    // Get limited snapshots for AI recommendations (performance optimized)
    @Query(value = "SELECT h.* FROM hospital_snapshots h WHERE h.is_accepting_transfers = true AND h.snapshot_time = " +
           "(SELECT MAX(h2.snapshot_time) FROM hospital_snapshots h2 WHERE h2.hospital_id = h.hospital_id) " +
           "ORDER BY h.hospital_load_percentage ASC, h.icu_beds_available DESC LIMIT 15", nativeQuery = true)
    List<HospitalSnapshot> findTop15AcceptingHospitalsForAI();
    
    // Get snapshots with available ICU beds
    @Query("SELECT h FROM HospitalSnapshot h WHERE h.icuBedsAvailable > 0 AND h.snapshotTime = " +
           "(SELECT MAX(h2.snapshotTime) FROM HospitalSnapshot h2 WHERE h2.hospitalId = h.hospitalId)")
    List<HospitalSnapshot> findHospitalsWithAvailableICU();
    
    // Get snapshots with specific specialty
    @Query("SELECT h FROM HospitalSnapshot h WHERE " +
           "(LOWER(:specialty) = 'cardiology' AND h.cardiologySpecialists > 0) OR " +
           "(LOWER(:specialty) = 'neurology' AND h.neurologySpecialists > 0) OR " +
           "(LOWER(:specialty) = 'emergency medicine' AND h.emergencySpecialists > 0) OR " +
           "(LOWER(:specialty) = 'surgery' AND h.surgerySpecialists > 0) OR " +
           "(LOWER(:specialty) = 'pediatrics' AND h.pediatricsSpecialists > 0) OR " +
           "(LOWER(:specialty) = 'orthopedics' AND h.orthopedicsSpecialists > 0) OR " +
           "(LOWER(:specialty) = 'oncology' AND h.oncologySpecialists > 0) " +
           "AND h.snapshotTime = (SELECT MAX(h2.snapshotTime) FROM HospitalSnapshot h2 WHERE h2.hospitalId = h.hospitalId)")
    List<HospitalSnapshot> findHospitalsWithSpecialty(@Param("specialty") String specialty);
    
    // Clean old snapshots (keep only latest per hospital)
    @Modifying
    @Transactional
    @Query("DELETE FROM HospitalSnapshot h WHERE h.snapshotTime < :cutoffTime")
    int deleteOldSnapshots(@Param("cutoffTime") LocalDateTime cutoffTime);
}