package com.healthcare.dto;

import java.util.List;

public class WorkoutPlanDTO {
    private String id;
    private String name;
    private String difficulty; // Beginner, Intermediate, Advanced
    private Integer duration; // in minutes
    private List<String> exercises;
    private List<String> targetMuscles;
    private Integer estimatedCalories;
    private String description;
    private String imageUrl;

    // Constructors
    public WorkoutPlanDTO() {}

    public WorkoutPlanDTO(String id, String name, String difficulty, Integer duration,
                         List<String> exercises, List<String> targetMuscles, 
                         Integer estimatedCalories, String description, String imageUrl) {
        this.id = id;
        this.name = name;
        this.difficulty = difficulty;
        this.duration = duration;
        this.exercises = exercises;
        this.targetMuscles = targetMuscles;
        this.estimatedCalories = estimatedCalories;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public List<String> getExercises() {
        return exercises;
    }

    public void setExercises(List<String> exercises) {
        this.exercises = exercises;
    }

    public List<String> getTargetMuscles() {
        return targetMuscles;
    }

    public void setTargetMuscles(List<String> targetMuscles) {
        this.targetMuscles = targetMuscles;
    }

    public Integer getEstimatedCalories() {
        return estimatedCalories;
    }

    public void setEstimatedCalories(Integer estimatedCalories) {
        this.estimatedCalories = estimatedCalories;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}