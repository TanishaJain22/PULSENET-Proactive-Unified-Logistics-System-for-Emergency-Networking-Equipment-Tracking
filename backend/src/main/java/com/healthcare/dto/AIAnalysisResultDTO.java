package com.healthcare.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AIAnalysisResultDTO {
    private Long id;
    private Long userId;
    private String condition;
    private Double confidence;
    private String severity;
    private String description;
    private List<String> recommendations;
    private String imageUrl;
    private LocalDateTime analyzedAt;

    // Constructors
    public AIAnalysisResultDTO() {}

    public AIAnalysisResultDTO(String condition, Double confidence, String severity, 
                              String description, List<String> recommendations) {
        this.condition = condition;
        this.confidence = confidence;
        this.severity = severity;
        this.description = description;
        this.recommendations = recommendations;
        this.analyzedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}