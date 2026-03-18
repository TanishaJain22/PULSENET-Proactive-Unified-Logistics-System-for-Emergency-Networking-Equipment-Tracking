package com.healthcare.repository;

import com.healthcare.entity.Ambulance;
import com.healthcare.entity.enums.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AmbulanceRepository extends JpaRepository<Ambulance, UUID> {

    List<Ambulance> findByHospitalId(UUID hospitalId);

    List<Ambulance> findByStatus(AmbulanceStatus status);

    List<Ambulance> findByHospitalIdAndStatus(UUID hospitalId, AmbulanceStatus status);

    Optional<Ambulance> findByVehicleNumber(String vehicleNumber);

    boolean existsByVehicleNumber(String vehicleNumber);

    @Query("SELECT a FROM Ambulance a WHERE a.hospitalId = :hospitalId AND a.status IN :statuses")
    List<Ambulance> findByHospitalIdAndStatusIn(@Param("hospitalId") UUID hospitalId, 
                                               @Param("statuses") List<AmbulanceStatus> statuses);

    @Query("SELECT a FROM Ambulance a WHERE a.status IN :statuses")
    List<Ambulance> findByStatusIn(@Param("statuses") List<AmbulanceStatus> statuses);

    @Query("SELECT COUNT(a) FROM Ambulance a WHERE a.hospitalId = :hospitalId AND a.status = :status")
    long countByHospitalIdAndStatus(@Param("hospitalId") UUID hospitalId, @Param("status") AmbulanceStatus status);

    @Query("SELECT a FROM Ambulance a WHERE a.hospitalId = :hospitalId AND " +
           "(LOWER(a.vehicleNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.driverName) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Ambulance> findByHospitalIdAndSearchTerm(@Param("hospitalId") UUID hospitalId, 
                                                 @Param("searchTerm") String searchTerm);
}