package com.healthcare.dto;

import java.time.LocalDateTime;
import java.util.List;

public class MentalHealthAssessmentDTO {
    private Long id;
    private Long userId;
    private String moodLevel;
    private String stressLevel;
    private String anxietyLevel;
    private List<String> symptoms;
    private String notes;
    private LocalDateTime assessmentDate;

    // Constructors
    public MentalHealthAssessmentDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMoodLevel() { return moodLevel; }
    public void setMoodLevel(String moodLevel) { this.moodLevel = moodLevel; }

    public String getStressLevel() { return stressLevel; }
    public void setStressLevel(String stressLevel) { this.stressLevel = stressLevel; }

    public String getAnxietyLevel() { return anxietyLevel; }
    public void setAnxietyLevel(String anxietyLevel) { this.anxietyLevel = anxietyLevel; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getAssessmentDate() { return assessmentDate; }
    public void setAssessmentDate(LocalDateTime assessmentDate) { this.assessmentDate = assessmentDate; }
}