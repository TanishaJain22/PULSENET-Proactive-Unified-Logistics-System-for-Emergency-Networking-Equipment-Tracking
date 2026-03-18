package com.healthcare.repository;

import com.healthcare.entity.SpecialistAvailabilitySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpecialistAvailabilitySummaryRepository extends JpaRepository<SpecialistAvailabilitySummary, UUID> {
    
    List<SpecialistAvailabilitySummary> findByHospitalId(UUID hospitalId);
    
    @Query("SELECT s FROM SpecialistAvailabilitySummary s WHERE s.hospitalId = :hospitalId " +
           "AND s.specialty = :specialty")
    Optional<SpecialistAvailabilitySummary> findByHospitalIdAndSpecialty(@Param("hospitalId") UUID hospitalId,
                                                                        @Param("specialty") String specialty);
    
    @Modifying
    @Query("DELETE FROM SpecialistAvailabilitySummary s WHERE s.hospitalId = :hospitalId")
    void deleteByHospitalId(@Param("hospitalId") UUID hospitalId);
}