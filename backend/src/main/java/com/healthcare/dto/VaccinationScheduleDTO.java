package com.healthcare.dto;

import java.time.LocalDate;

public class VaccinationScheduleDTO {
    private Long id;
    private Long userId;
    private String vaccineName;
    private LocalDate scheduledDate;
    private LocalDate dueDate;
    private String ageGroup;
    private String priority;
    private String status;
    private String notes;
    private String reminderSent;

    // Constructors
    public VaccinationScheduleDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getReminderSent() { return reminderSent; }
    public void setReminderSent(String reminderSent) { this.reminderSent = reminderSent; }
}