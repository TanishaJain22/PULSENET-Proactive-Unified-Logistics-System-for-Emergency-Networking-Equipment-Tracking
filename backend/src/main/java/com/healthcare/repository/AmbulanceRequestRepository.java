package com.healthcare.repository;

import com.healthcare.entity.AmbulanceRequest;
import com.healthcare.entity.enums.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AmbulanceRequestRepository extends JpaRepository<AmbulanceRequest, UUID> {

    List<AmbulanceRequest> findByHospitalId(UUID hospitalId);

    List<AmbulanceRequest> findByAmbulanceId(UUID ambulanceId);

    List<AmbulanceRequest> findByStatus(AmbulanceStatus status);

    List<AmbulanceRequest> findByHospitalIdAndStatus(UUID hospitalId, AmbulanceStatus status);

    @Query("SELECT ar FROM AmbulanceRequest ar WHERE ar.hospitalId = :hospitalId AND ar.status IN :statuses")
    List<AmbulanceRequest> findByHospitalIdAndStatusIn(@Param("hospitalId") UUID hospitalId, 
                                                      @Param("statuses") List<AmbulanceStatus> statuses);

    @Query("SELECT ar FROM AmbulanceRequest ar WHERE ar.hospitalId = :hospitalId AND " +
           "ar.approvedByHospital = :approved ORDER BY ar.requestTime DESC")
    List<AmbulanceRequest> findByHospitalIdAndApprovedByHospital(@Param("hospitalId") UUID hospitalId, 
                                                                @Param("approved") Boolean approved);

    @Query("SELECT ar FROM AmbulanceRequest ar WHERE ar.hospitalId = :hospitalId AND " +
           "ar.requestTime >= :since ORDER BY ar.requestTime DESC")
    List<AmbulanceRequest> findByHospitalIdAndRequestTimeAfter(@Param("hospitalId") UUID hospitalId, 
                                                              @Param("since") LocalDateTime since);

    @Query("SELECT ar FROM AmbulanceRequest ar WHERE ar.ambulanceId = :ambulanceId AND " +
           "ar.status IN ('DISPATCHED', 'EN_ROUTE', 'AT_SCENE', 'PATIENT_PICKED') " +
           "ORDER BY ar.requestTime DESC")
    List<AmbulanceRequest> findActiveRequestsByAmbulanceId(@Param("ambulanceId") UUID ambulanceId);

    @Query("SELECT COUNT(ar) FROM AmbulanceRequest ar WHERE ar.hospitalId = :hospitalId AND ar.status = :status")
    long countByHospitalIdAndStatus(@Param("hospitalId") UUID hospitalId, @Param("status") AmbulanceStatus status);
}