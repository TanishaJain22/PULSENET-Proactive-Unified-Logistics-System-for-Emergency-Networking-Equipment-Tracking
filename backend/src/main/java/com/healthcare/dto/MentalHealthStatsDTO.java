package com.healthcare.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class MentalHealthStatsDTO {
    private Long userId;
    private String overallMoodTrend;
    private String averageStressLevel;
    private String averageAnxietyLevel;
    private int totalAssessments;
    private Map<String, Integer> moodDistribution;
    private Map<String, Integer> stressDistribution;
    private LocalDateTime lastAssessmentDate;
    private String recommendations;

    // Constructors
    public MentalHealthStatsDTO() {}

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getOverallMoodTrend() { return overallMoodTrend; }
    public void setOverallMoodTrend(String overallMoodTrend) { this.overallMoodTrend = overallMoodTrend; }

    public String getAverageStressLevel() { return averageStressLevel; }
    public void setAverageStressLevel(String averageStressLevel) { this.averageStressLevel = averageStressLevel; }

    public String getAverageAnxietyLevel() { return averageAnxietyLevel; }
    public void setAverageAnxietyLevel(String averageAnxietyLevel) { this.averageAnxietyLevel = averageAnxietyLevel; }

    public int getTotalAssessments() { return totalAssessments; }
    public void setTotalAssessments(int totalAssessments) { this.totalAssessments = totalAssessments; }

    public Map<String, Integer> getMoodDistribution() { return moodDistribution; }
    public void setMoodDistribution(Map<String, Integer> moodDistribution) { this.moodDistribution = moodDistribution; }

    public Map<String, Integer> getStressDistribution() { return stressDistribution; }
    public void setStressDistribution(Map<String, Integer> stressDistribution) { this.stressDistribution = stressDistribution; }

    public LocalDateTime getLastAssessmentDate() { return lastAssessmentDate; }
    public void setLastAssessmentDate(LocalDateTime lastAssessmentDate) { this.lastAssessmentDate = lastAssessmentDate; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
}