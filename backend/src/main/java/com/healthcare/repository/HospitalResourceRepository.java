package com.healthcare.repository;

import com.healthcare.entity.HospitalResource;
import com.healthcare.entity.enums.ResourceType;
import com.healthcare.entity.enums.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HospitalResourceRepository extends JpaRepository<HospitalResource, UUID> {
    
    List<HospitalResource> findByHospitalId(UUID hospitalId);
    
    List<HospitalResource> findByHospitalIdAndType(UUID hospitalId, ResourceType type);
    
    List<HospitalResource> findByHospitalIdAndStatus(UUID hospitalId, ResourceStatus status);
    
    @Query("SELECT r FROM HospitalResource r WHERE r.hospitalId = :hospitalId AND r.availableCount <= r.reorderLevel")
    List<HospitalResource> findCriticalResources(@Param("hospitalId") UUID hospitalId);
    
    @Query("SELECT r FROM HospitalResource r WHERE r.hospitalId = :hospitalId AND " +
           "(LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<HospitalResource> searchResources(@Param("hospitalId") UUID hospitalId, @Param("search") String search);
    
    @Query("SELECT SUM(r.unitCost * r.totalCapacity) FROM HospitalResource r WHERE r.hospitalId = :hospitalId")
    Double getTotalInventoryValue(@Param("hospitalId") UUID hospitalId);
    
    @Query("SELECT COUNT(r) FROM HospitalResource r WHERE r.hospitalId = :hospitalId AND r.availableCount <= r.reorderLevel")
    Long getCriticalResourceCount(@Param("hospitalId") UUID hospitalId);
}