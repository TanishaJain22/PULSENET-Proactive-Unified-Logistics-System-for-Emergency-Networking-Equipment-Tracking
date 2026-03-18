package com.healthcare.dto;

import com.healthcare.entity.enums.NotificationType;
import com.healthcare.entity.enums.NotificationPriority;
import com.healthcare.entity.enums.NotificationCategory;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationDTO {
    private UUID id;
    private UUID hospitalId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;
    private NotificationCategory category;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String readBy;
    private UUID relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private String actionText;
    private String metadata;
    private LocalDateTime expiresAt;
    private Boolean autoRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String timeAgo;
    private Boolean isExpired;
}