package com.healthcare.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SymptomAnalysisDTO {
    private Long id;
    private Long userId;
    private String symptoms;
    private List<String> possibleConditions;
    private String riskLevel;
    private List<String> recommendations;
    private Boolean requiresImmediateAttention;
    private LocalDateTime analyzedAt;

    // Constructors
    public SymptomAnalysisDTO() {}

    public SymptomAnalysisDTO(String symptoms, List<String> possibleConditions, 
                             String riskLevel, List<String> recommendations) {
        this.symptoms = symptoms;
        this.possibleConditions = possibleConditions;
        this.riskLevel = riskLevel;
        this.recommendations = recommendations;
        this.analyzedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public List<String> getPossibleConditions() { return possibleConditions; }
    public void setPossibleConditions(List<String> possibleConditions) { this.possibleConditions = possibleConditions; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public Boolean getRequiresImmediateAttention() { return requiresImmediateAttention; }
    public void setRequiresImmediateAttention(Boolean requiresImmediateAttention) { this.requiresImmediateAttention = requiresImmediateAttention; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}