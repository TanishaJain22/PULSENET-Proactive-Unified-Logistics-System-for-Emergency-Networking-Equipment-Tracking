package com.healthcare.repository;

import com.healthcare.entity.Patient;
import com.healthcare.entity.enums.PatientStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    
    // Basic Queries
    Optional<Patient> findByMedicalRecordNumber(String medicalRecordNumber);
    Optional<Patient> findByNationalId(String nationalId);
    Optional<Patient> findByPhoneNumber(String phoneNumber);
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByQrCodeId(String qrCodeId);
    
    // Status Queries
    List<Patient> findByStatus(PatientStatus status);
    Page<Patient> findByStatus(PatientStatus status, Pageable pageable);
    
    // Search Queries
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "p.phoneNumber LIKE CONCAT('%', :searchTerm, '%') OR " +
           "p.medicalRecordNumber LIKE CONCAT('%', :searchTerm, '%')")
    Page<Patient> searchPatients(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Name-based Queries
    List<Patient> findByFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
        String firstName, String lastName);
    
    Page<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        String firstName, String lastName, Pageable pageable);
    
    // Date-based Queries
    List<Patient> findByDateOfBirth(LocalDate dateOfBirth);
    List<Patient> findByDateOfBirthBetween(LocalDate startDate, LocalDate endDate);
    
    // Emergency Access
    List<Patient> findByIsEmergencyAccessEnabledTrue();
    
    @Query("SELECT p FROM Patient p WHERE p.isEmergencyAccessEnabled = true AND " +
           "(p.allergies IS NOT NULL OR p.chronicConditions IS NOT NULL OR p.currentMedications IS NOT NULL)")
    List<Patient> findPatientsWithEmergencyMedicalInfo();
    
    // Location-based Queries
    List<Patient> findByCity(String city);
    List<Patient> findByState(String state);
    List<Patient> findByCityAndState(String city, String state);
    
    // Insurance Queries
    List<Patient> findByInsuranceProvider(String insuranceProvider);
    
    @Query("SELECT p FROM Patient p WHERE p.insuranceProvider IS NULL OR p.insurancePolicyNumber IS NULL")
    List<Patient> findPatientsWithoutInsurance();
    
    // Medical Condition Queries
    @Query("SELECT p FROM Patient p WHERE p.allergies IS NOT NULL AND p.allergies != ''")
    List<Patient> findPatientsWithAllergies();
    
    @Query("SELECT p FROM Patient p WHERE p.chronicConditions IS NOT NULL AND p.chronicConditions != ''")
    List<Patient> findPatientsWithChronicConditions();
    
    @Query("SELECT p FROM Patient p WHERE p.currentMedications IS NOT NULL AND p.currentMedications != ''")
    List<Patient> findPatientsWithCurrentMedications();
    
    // Statistics Queries
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.status = :status")
    Long countByStatus(@Param("status") PatientStatus status);
    
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.dateOfBirth >= :date")
    Long countPatientsYoungerThan(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.dateOfBirth <= :date")
    Long countPatientsOlderThan(@Param("date") LocalDate date);
    
    @Query("SELECT p.city, COUNT(p) FROM Patient p WHERE p.city IS NOT NULL GROUP BY p.city ORDER BY COUNT(p) DESC")
    List<Object[]> getPatientCountByCity();
    
    @Query("SELECT p.insuranceProvider, COUNT(p) FROM Patient p WHERE p.insuranceProvider IS NOT NULL GROUP BY p.insuranceProvider ORDER BY COUNT(p) DESC")
    List<Object[]> getPatientCountByInsuranceProvider();
    
    // Validation Queries
    boolean existsByMedicalRecordNumber(String medicalRecordNumber);
    boolean existsByNationalId(String nationalId);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    boolean existsByQrCodeId(String qrCodeId);
}