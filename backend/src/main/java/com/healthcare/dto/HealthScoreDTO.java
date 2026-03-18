package com.healthcare.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class HealthScoreDTO {
    private Long userId;
    private Double overallScore;
    private Double physicalScore;
    private Double mentalScore;
    private Double nutritionScore;
    private Double activityScore;
    private Double sleepScore;
    private Map<String, Double> categoryScores;
    private String riskLevel;
    private String recommendations;
    private LocalDateTime calculatedAt;

    // Constructors
    public HealthScoreDTO() {}

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public Double getPhysicalScore() { return physicalScore; }
    public void setPhysicalScore(Double physicalScore) { this.physicalScore = physicalScore; }

    public Double getMentalScore() { return mentalScore; }
    public void setMentalScore(Double mentalScore) { this.mentalScore = mentalScore; }

    public Double getNutritionScore() { return nutritionScore; }
    public void setNutritionScore(Double nutritionScore) { this.nutritionScore = nutritionScore; }

    public Double getActivityScore() { return activityScore; }
    public void setActivityScore(Double activityScore) { this.activityScore = activityScore; }

    public Double getSleepScore() { return sleepScore; }
    public void setSleepScore(Double sleepScore) { this.sleepScore = sleepScore; }

    public Map<String, Double> getCategoryScores() { return categoryScores; }
    public void setCategoryScores(Map<String, Double> categoryScores) { this.categoryScores = categoryScores; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
}