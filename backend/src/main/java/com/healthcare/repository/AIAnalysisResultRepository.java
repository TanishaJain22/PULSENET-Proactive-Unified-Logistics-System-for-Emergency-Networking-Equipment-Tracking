package com.healthcare.repository;

import com.healthcare.entity.AIAnalysisResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIAnalysisResultRepository extends JpaRepository<AIAnalysisResult, Long> {
    
    List<AIAnalysisResult> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<AIAnalysisResult> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<AIAnalysisResult> findByUserIdAndAnalysisTypeOrderByCreatedAtDesc(Long userId, AIAnalysisResult.AnalysisType analysisType);
    
    List<AIAnalysisResult> findByUserIdAndSpecialtyOrderByCreatedAtDesc(Long userId, String specialty);
    
    @Query("SELECT a FROM AIAnalysisResult a WHERE a.userId = :userId AND a.createdAt >= :fromDate ORDER BY a.createdAt DESC")
    List<AIAnalysisResult> findRecentAnalyses(@Param("userId") Long userId, @Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT COUNT(a) FROM AIAnalysisResult a WHERE a.userId = :userId AND a.analysisType = :type")
    Long countByUserIdAndAnalysisType(@Param("userId") Long userId, @Param("type") AIAnalysisResult.AnalysisType type);
    
    @Query("SELECT a FROM AIAnalysisResult a WHERE a.userId = :userId AND a.severity = :severity ORDER BY a.createdAt DESC")
    List<AIAnalysisResult> findBySeverity(@Param("userId") Long userId, @Param("severity") AIAnalysisResult.Severity severity);
}