package com.healthcare.dto;

import java.time.LocalDateTime;

public class ExerciseSessionDTO {
    private String id;
    private String exercise;
    private Integer reps;
    private Integer sets;
    private Integer duration; // in seconds
    private Integer calories;
    private Double accuracy; // percentage
    private LocalDateTime timestamp;
    private Long userId;

    // Constructors
    public ExerciseSessionDTO() {}

    public ExerciseSessionDTO(String id, String exercise, Integer reps, Integer sets, 
                             Integer duration, Integer calories, Double accuracy, 
                             LocalDateTime timestamp, Long userId) {
        this.id = id;
        this.exercise = exercise;
        this.reps = reps;
        this.sets = sets;
        this.duration = duration;
        this.calories = calories;
        this.accuracy = accuracy;
        this.timestamp = timestamp;
        this.userId = userId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExercise() {
        return exercise;
    }

    public void setExercise(String exercise) {
        this.exercise = exercise;
    }

    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }

    public Integer getSets() {
        return sets;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}