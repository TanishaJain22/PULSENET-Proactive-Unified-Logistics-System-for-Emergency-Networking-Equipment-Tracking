package com.healthcare.service;

import com.healthcare.entity.Notification;
import com.healthcare.entity.enums.NotificationCategory;
import com.healthcare.entity.enums.NotificationType;
import com.healthcare.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    public Page<Notification> getNotifications(UUID hospitalId, NotificationCategory category, 
                                               Boolean isRead, String search, Pageable pageable) {
        String categoryStr = category != null ? category.name() : null;
        return notificationRepository.findByFilters(hospitalId, categoryStr, isRead, search, pageable);
    }

    @Transactional
    public Notification markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification markAsUnread(UUID id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    @Transactional
    public int markAllAsRead(UUID hospitalId) {
        return notificationRepository.markAllAsRead(hospitalId);
    }

    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }

    public Map<String, Object> getStats(UUID hospitalId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("unreadCount", notificationRepository.countByHospitalIdAndIsRead(hospitalId, false));
        stats.put("emergencyCount", notificationRepository.countByHospitalIdAndType(hospitalId, NotificationType.EMERGENCY));
        stats.put("warningCount", notificationRepository.countByHospitalIdAndType(hospitalId, NotificationType.WARNING));
        stats.put("infoCount", notificationRepository.countByHospitalIdAndType(hospitalId, NotificationType.INFO));
        stats.put("highPriorityUnread", 0L); // Can be enhanced later
        return stats;
    }
}
