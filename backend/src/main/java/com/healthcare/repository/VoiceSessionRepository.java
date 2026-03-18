package com.healthcare.repository;

import com.healthcare.entity.VoiceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceSessionRepository extends JpaRepository<VoiceSession, Long> {
    
    List<VoiceSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<VoiceSession> findBySessionId(String sessionId);
    
    @Query("SELECT v FROM VoiceSession v WHERE v.userId = :userId AND v.createdAt >= :fromDate ORDER BY v.createdAt DESC")
    List<VoiceSession> findRecentSessions(@Param("userId") Long userId, @Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT COUNT(v) FROM VoiceSession v WHERE v.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);
}