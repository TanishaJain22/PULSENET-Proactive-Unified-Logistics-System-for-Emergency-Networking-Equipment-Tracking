package com.healthcare.repository;

import com.healthcare.entity.Notification;
import com.healthcare.entity.enums.NotificationCategory;
import com.healthcare.entity.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    Page<Notification> findByHospitalId(UUID hospitalId, Pageable pageable);
    
    Page<Notification> findByHospitalIdAndIsRead(UUID hospitalId, Boolean isRead, Pageable pageable);
    
    Page<Notification> findByHospitalIdAndCategory(UUID hospitalId, NotificationCategory category, Pageable pageable);
    
    @Query(value = "SELECT * FROM notifications n WHERE n.hospital_id = :hospitalId " +
           "AND (:category IS NULL OR n.category = CAST(:category AS VARCHAR)) " +
           "AND (:isRead IS NULL OR n.is_read = :isRead) " +
           "AND (:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(n.message) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(*) FROM notifications n WHERE n.hospital_id = :hospitalId " +
           "AND (:category IS NULL OR n.category = CAST(:category AS VARCHAR)) " +
           "AND (:isRead IS NULL OR n.is_read = :isRead) " +
           "AND (:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(n.message) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<Notification> findByFilters(@Param("hospitalId") UUID hospitalId,
                                     @Param("category") String category,
                                     @Param("isRead") Boolean isRead,
                                     @Param("search") String search,
                                     Pageable pageable);
    
    long countByHospitalIdAndIsRead(UUID hospitalId, Boolean isRead);
    
    long countByHospitalIdAndType(UUID hospitalId, NotificationType type);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.hospitalId = :hospitalId AND n.isRead = false")
    int markAllAsRead(@Param("hospitalId") UUID hospitalId);
}
