package com.healthcare.controller;

import com.healthcare.entity.Notification;
import com.healthcare.entity.enums.NotificationCategory;
import com.healthcare.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        NotificationCategory cat = category != null ? NotificationCategory.valueOf(category.toUpperCase()) : null;
        Boolean isRead = unreadOnly != null && unreadOnly ? false : null;
        
        return ResponseEntity.ok(notificationService.getNotifications(
            hospitalId, cat, isRead, search, 
            PageRequest.of(page, size, Sort.by("created_at").descending())));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam UUID hospitalId) {
        return ResponseEntity.ok(notificationService.getStats(hospitalId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/{id}/unread")
    public ResponseEntity<Notification> markAsUnread(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.markAsUnread(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@RequestParam UUID hospitalId) {
        int count = notificationService.markAllAsRead(hospitalId);
        return ResponseEntity.ok(Map.of("markedCount", count));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}
