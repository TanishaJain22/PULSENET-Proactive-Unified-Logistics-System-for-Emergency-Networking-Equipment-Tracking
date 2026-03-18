package com.healthcare.repository;

import com.healthcare.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    
    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
    
    List<Doctor> findByIsAvailableTrue();
    
    List<Doctor> findByVerifiedTrue();
    
    List<Doctor> findBySpecializationContainingIgnoreCaseAndIsAvailableTrue(String specialization);
    
    List<Doctor> findByHospitalContainingIgnoreCase(String hospital);
    
    List<Doctor> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT DISTINCT d.specialization FROM Doctor d ORDER BY d.specialization")
    List<String> findAllSpecializations();
    
    @Query("SELECT DISTINCT d.hospital FROM Doctor d ORDER BY d.hospital")
    List<String> findAllHospitals();
    
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND d.verified = true ORDER BY d.rating DESC")
    List<Doctor> findTopRatedAvailableDoctors();
    
    @Query("SELECT d FROM Doctor d WHERE d.fees BETWEEN :minFees AND :maxFees AND d.isAvailable = true")
    List<Doctor> findByFeesRange(@Param("minFees") Integer minFees, @Param("maxFees") Integer maxFees);
    
    List<Doctor> findByHospitalId(UUID hospitalId);
}