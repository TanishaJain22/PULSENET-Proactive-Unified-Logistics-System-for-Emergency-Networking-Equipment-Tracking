package com.healthcare.repository;

import com.healthcare.entity.Visit;
import com.healthcare.entity.enums.VisitStatus;
import com.healthcare.entity.enums.VisitType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface VisitRepository extends JpaRepository<Visit, UUID> {
    
    // Patient-based Queries
    List<Visit> findByPatientIdOrderByScheduledDateTimeDesc(UUID patientId);
    Page<Visit> findByPatientId(UUID patientId, Pageable pageable);
    
    // Hospital-based Queries
    @Query("SELECT v FROM Visit v WHERE v.hospital.id = :hospitalId ORDER BY v.scheduledDateTime DESC")
    List<Visit> findByHospitalIdOrderByScheduledDateTimeDesc(@Param("hospitalId") UUID hospitalId);
    
    @Query("SELECT v FROM Visit v WHERE v.hospital.id = :hospitalId")
    Page<Visit> findByHospitalId(@Param("hospitalId") UUID hospitalId, Pageable pageable);
    
    // Doctor-based Queries
    List<Visit> findByAttendingDoctorIdOrderByScheduledDateTimeDesc(UUID doctorId);
    Page<Visit> findByAttendingDoctorId(UUID doctorId, Pageable pageable);
    
    // Status-based Queries
    List<Visit> findByStatus(VisitStatus status);
    Page<Visit> findByStatus(VisitStatus status, Pageable pageable);
    
    @Query("SELECT v FROM Visit v WHERE v.status = :status AND v.hospital.id = :hospitalId")
    List<Visit> findByStatusAndHospitalId(@Param("status") VisitStatus status, @Param("hospitalId") UUID hospitalId);
    
    // Type-based Queries
    List<Visit> findByVisitType(VisitType visitType);
    Page<Visit> findByVisitType(VisitType visitType, Pageable pageable);
    
    // Emergency Queries
    List<Visit> findByIsEmergencyTrueOrderByScheduledDateTimeDesc();
    Page<Visit> findByIsEmergencyTrue(Pageable pageable);
    
    @Query("SELECT v FROM Visit v WHERE v.isEmergency = true AND v.hospital.id = :hospitalId")
    List<Visit> findByIsEmergencyTrueAndHospitalId(@Param("hospitalId") UUID hospitalId);
    
    // Date-based Queries
    List<Visit> findByScheduledDateTimeBetween(LocalDateTime start, LocalDateTime end);
    Page<Visit> findByScheduledDateTimeBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    List<Visit> findByActualStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Visit> findByActualEndTimeBetween(LocalDateTime start, LocalDateTime end);
    
    // Today's Visits - Using method-based queries to avoid JPQL date issues
    List<Visit> findByScheduledDateTimeBetweenOrderByScheduledDateTime(LocalDateTime start, LocalDateTime end);
    
    // Convenience method for today's visits
    default List<Visit> findTodaysVisits() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return findByScheduledDateTimeBetweenOrderByScheduledDateTime(startOfDay, endOfDay);
    }
    
    @Query("SELECT v FROM Visit v WHERE v.hospital.id = :hospitalId AND v.scheduledDateTime BETWEEN :start AND :end ORDER BY v.scheduledDateTime")
    List<Visit> findTodaysVisitsByHospital(@Param("hospitalId") UUID hospitalId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Convenience method for today's visits by hospital
    default List<Visit> findTodaysVisitsByHospital(UUID hospitalId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return findTodaysVisitsByHospital(hospitalId, startOfDay, endOfDay);
    }
    
    // Active Visits
    @Query("SELECT v FROM Visit v WHERE v.status IN ('CHECKED_IN', 'IN_PROGRESS') ORDER BY v.actualStartTime")
    List<Visit> findActiveVisits();
    
    @Query("SELECT v FROM Visit v WHERE v.status IN ('CHECKED_IN', 'IN_PROGRESS') AND v.hospital.id = :hospitalId ORDER BY v.actualStartTime")
    List<Visit> findActiveVisitsByHospital(@Param("hospitalId") UUID hospitalId);
    
    // Ambulance-related Queries
    List<Visit> findByAmbulanceIdIsNotNull();
    List<Visit> findByAmbulanceId(String ambulanceId);
    
    // Room/Bed Queries
    List<Visit> findByRoomNumberAndStatus(String roomNumber, VisitStatus status);
    List<Visit> findByBedNumberAndStatus(String bedNumber, VisitStatus status);
    
    @Query("SELECT v FROM Visit v WHERE v.roomNumber IS NOT NULL AND v.status IN ('CHECKED_IN', 'IN_PROGRESS')")
    List<Visit> findVisitsWithRoomAssignment();
    
    // Billing Queries
    @Query("SELECT v FROM Visit v WHERE v.billingStatus = :billingStatus")
    List<Visit> findByBillingStatus(@Param("billingStatus") String billingStatus);
    
    @Query("SELECT v FROM Visit v WHERE v.totalCost IS NOT NULL AND v.billingStatus = 'PENDING'")
    List<Visit> findUnbilledVisits();
    
    // Statistics Queries
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.status = :status")
    Long countByStatus(@Param("status") VisitStatus status);
    
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.visitType = :visitType")
    Long countByVisitType(@Param("visitType") VisitType visitType);
    
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.isEmergency = true")
    Long countEmergencyVisits();
    
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.scheduledDateTime BETWEEN :start AND :end")
    Long countTodaysVisits(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Convenience method for counting today's visits
    default Long countTodaysVisits() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return countTodaysVisits(startOfDay, endOfDay);
    }
    
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.hospital.id = :hospitalId AND v.scheduledDateTime BETWEEN :start AND :end")
    Long countTodaysVisitsByHospital(@Param("hospitalId") UUID hospitalId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Convenience method for counting today's visits by hospital
    default Long countTodaysVisitsByHospital(UUID hospitalId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return countTodaysVisitsByHospital(hospitalId, startOfDay, endOfDay);
    }
    
    // Average Duration
    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, v.actualStartTime, v.actualEndTime)) FROM Visit v WHERE v.actualStartTime IS NOT NULL AND v.actualEndTime IS NOT NULL")
    Double getAverageVisitDurationMinutes();
    
    // Recent Visits
    @Query("SELECT v FROM Visit v WHERE v.scheduledDateTime >= :since ORDER BY v.scheduledDateTime DESC")
    List<Visit> findRecentVisits(@Param("since") LocalDateTime since);
    
    // Patient's Last Visit
    @Query("SELECT v FROM Visit v WHERE v.patient.id = :patientId ORDER BY v.scheduledDateTime DESC LIMIT 1")
    Visit findLastVisitByPatient(@Param("patientId") UUID patientId);
    
    // Count visits by patient
    Long countByPatientId(UUID patientId);
    
    // Overdue Visits (scheduled but not started)
    @Query("SELECT v FROM Visit v WHERE v.status = 'SCHEDULED' AND v.scheduledDateTime < :currentTime")
    List<Visit> findOverdueVisits(@Param("currentTime") LocalDateTime currentTime);
}