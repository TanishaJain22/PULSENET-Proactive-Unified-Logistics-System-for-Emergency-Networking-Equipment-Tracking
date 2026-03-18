package com.healthcare.repository;

import com.healthcare.entity.Transfer;
import com.healthcare.entity.enums.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, UUID> {
    
    // Outgoing transfers (from this hospital)
    List<Transfer> findByFromHospitalIdOrderByRequestedAtDesc(UUID fromHospitalId);
    
    // Incoming transfers (to this hospital)
    List<Transfer> findByToHospitalIdOrderByRequestedAtDesc(UUID toHospitalId);
    
    // Pending incoming transfers for review
    List<Transfer> findByToHospitalIdAndStatusOrderByRequestedAtDesc(UUID toHospitalId, TransferStatus status);
    
    // All transfers involving this hospital
    @Query("SELECT t FROM Transfer t WHERE t.fromHospitalId = :hospitalId OR t.toHospitalId = :hospitalId ORDER BY t.requestedAt DESC")
    List<Transfer> findAllTransfersForHospital(@Param("hospitalId") UUID hospitalId);
    
    // Active transfers (not completed/rejected/cancelled)
    @Query("SELECT t FROM Transfer t WHERE (t.fromHospitalId = :hospitalId OR t.toHospitalId = :hospitalId) " +
           "AND t.status NOT IN ('COMPLETED', 'REJECTED', 'CANCELLED') ORDER BY t.requestedAt DESC")
    List<Transfer> findActiveTransfersForHospital(@Param("hospitalId") UUID hospitalId);
    
    // Transfers by patient
    List<Transfer> findByPatientIdOrderByRequestedAtDesc(String patientId);
    
    // Transfers by status
    List<Transfer> findByStatusOrderByRequestedAtDesc(TransferStatus status);
    
    // Recent transfers (last 24 hours)
    @Query("SELECT t FROM Transfer t WHERE t.requestedAt >= :since ORDER BY t.requestedAt DESC")
    List<Transfer> findRecentTransfers(@Param("since") LocalDateTime since);
    
    // Transfer statistics
    @Query("SELECT COUNT(t) FROM Transfer t WHERE t.fromHospitalId = :hospitalId AND t.requestedAt >= :since")
    Long countOutgoingTransfersSince(@Param("hospitalId") UUID hospitalId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(t) FROM Transfer t WHERE t.toHospitalId = :hospitalId AND t.requestedAt >= :since")
    Long countIncomingTransfersSince(@Param("hospitalId") UUID hospitalId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(t) FROM Transfer t WHERE t.toHospitalId = :hospitalId AND t.status = 'ACCEPTED' AND t.requestedAt >= :since")
    Long countAcceptedTransfersSince(@Param("hospitalId") UUID hospitalId, @Param("since") LocalDateTime since);
}