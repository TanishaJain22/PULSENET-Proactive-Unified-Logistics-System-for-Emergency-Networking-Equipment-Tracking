package com.healthcare.repository;

import com.healthcare.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, UUID> {
    
    Optional<DoctorAvailability> findByDoctorId(UUID doctorId);
    
    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctorId = :doctorId " +
           "ORDER BY da.effectiveDate DESC, da.createdAt DESC")
    Optional<DoctorAvailability> findLatestByDoctorId(@Param("doctorId") UUID doctorId);
}