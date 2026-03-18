package com.healthcare.dto;

public class EmergencyContactDTO {
    private Long id;
    private Long userId;
    private String name;
    private String relationship;
    private String phoneNumber;
    private String email;
    private String address;
    private boolean isPrimary;
    private String notes;

    // Constructors
    public EmergencyContactDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}