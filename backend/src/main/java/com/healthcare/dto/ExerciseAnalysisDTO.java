package com.healthcare.dto;

import java.util.List;
import java.util.Map;

public class ExerciseAnalysisDTO {
    private String exerciseType;
    private Integer detectedReps;
    private Double accuracy;
    private List<String> formFeedback;
    private Map<String, Double> poseKeypoints;
    private String analysisMethod; // "pose-detection", "motion-analysis", "ai-vision"
    private Long processingTime;
    private Boolean isCorrectForm;

    // Constructors
    public ExerciseAnalysisDTO() {}

    public ExerciseAnalysisDTO(String exerciseType, Integer detectedReps, Double accuracy,
                              List<String> formFeedback, Map<String, Double> poseKeypoints,
                              String analysisMethod, Long processingTime, Boolean isCorrectForm) {
        this.exerciseType = exerciseType;
        this.detectedReps = detectedReps;
        this.accuracy = accuracy;
        this.formFeedback = formFeedback;
        this.poseKeypoints = poseKeypoints;
        this.analysisMethod = analysisMethod;
        this.processingTime = processingTime;
        this.isCorrectForm = isCorrectForm;
    }

    // Getters and Setters
    public String getExerciseType() {
        return exerciseType;
    }

    public void setExerciseType(String exerciseType) {
        this.exerciseType = exerciseType;
    }

    public Integer getDetectedReps() {
        return detectedReps;
    }

    public void setDetectedReps(Integer detectedReps) {
        this.detectedReps = detectedReps;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public List<String> getFormFeedback() {
        return formFeedback;
    }

    public void setFormFeedback(List<String> formFeedback) {
        this.formFeedback = formFeedback;
    }

    public Map<String, Double> getPoseKeypoints() {
        return poseKeypoints;
    }

    public void setPoseKeypoints(Map<String, Double> poseKeypoints) {
        this.poseKeypoints = poseKeypoints;
    }

    public String getAnalysisMethod() {
        return analysisMethod;
    }

    public void setAnalysisMethod(String analysisMethod) {
        this.analysisMethod = analysisMethod;
    }

    public Long getProcessingTime() {
        return processingTime;
    }

    public void setProcessingTime(Long processingTime) {
        this.processingTime = processingTime;
    }

    public Boolean getIsCorrectForm() {
        return isCorrectForm;
    }

    public void setIsCorrectForm(Boolean isCorrectForm) {
        this.isCorrectForm = isCorrectForm;
    }
}