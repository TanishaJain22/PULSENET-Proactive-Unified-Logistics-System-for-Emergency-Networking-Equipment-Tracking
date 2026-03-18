package com.healthcare.repository;

import com.healthcare.entity.Emergency;
import com.healthcare.entity.enums.EmergencyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmergencyRepository extends JpaRepository<Emergency, UUID> {
    
    Page<Emergency> findByHospitalIdAndStatus(UUID hospitalId, EmergencyStatus status, Pageable pageable);
    
    List<Emergency> findByHospitalIdAndStatusIn(UUID hospitalId, List<EmergencyStatus> statuses);
    
    long countByHospitalIdAndStatus(UUID hospitalId, EmergencyStatus status);
}
