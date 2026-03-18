package com.healthcare.dto;

import java.time.LocalDateTime;

public class MoodEntryDTO {
    private Long id;
    private Long userId;
    private Integer mood; // 1-5 scale
    private String notes;
    private LocalDateTime entryDate;

    // Constructors
    public MoodEntryDTO() {}

    public MoodEntryDTO(Long userId, Integer mood, String notes) {
        this.userId = userId;
        this.mood = mood;
        this.notes = notes;
        this.entryDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getMood() { return mood; }
    public void setMood(Integer mood) { this.mood = mood; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDateTime entryDate) { this.entryDate = entryDate; }
}