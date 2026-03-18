package com.healthcare.repository;

import com.healthcare.entity.Hospital;
import com.healthcare.entity.enums.HospitalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    Optional<Hospital> findByRegistrationNo(String registrationNo);
    boolean existsByRegistrationNo(String registrationNo);
    
    // New methods for AI recommendations optimization
    List<Hospital> findByStatus(HospitalStatus status);
    List<Hospital> findTop10ByStatusOrderByCreatedAtDesc(HospitalStatus status);
    
    @Query("SELECT h FROM Hospital h LEFT JOIN FETCH h.users LEFT JOIN FETCH h.location WHERE h.id = :id")
    Optional<Hospital> findByIdWithUsers(@Param("id") UUID id);
    
    @Query("SELECT DISTINCT h FROM Hospital h " +
           "LEFT JOIN FETCH h.users " +
           "LEFT JOIN FETCH h.location " +
           "LEFT JOIN FETCH h.infrastructure")
    List<Hospital> findAllWithBasicRelationships();
    
    @Query("SELECT DISTINCT h FROM Hospital h " +
           "LEFT JOIN FETCH h.users " +
           "LEFT JOIN FETCH h.location " +
           "LEFT JOIN FETCH h.infrastructure " +
           "LEFT JOIN FETCH h.specialties " +
           "LEFT JOIN FETCH h.documents")
    List<Hospital> findAllWithRelationships();
    
    @Query("SELECT DISTINCT h FROM Hospital h " +
           "LEFT JOIN FETCH h.specialties " +
           "WHERE h.id IN :hospitalIds")
    List<Hospital> findHospitalsWithSpecialties(@Param("hospitalIds") List<UUID> hospitalIds);
    
    @Query("SELECT DISTINCT h FROM Hospital h " +
           "LEFT JOIN FETCH h.documents " +
           "WHERE h.id IN :hospitalIds")
    List<Hospital> findHospitalsWithDocuments(@Param("hospitalIds") List<UUID> hospitalIds);
}