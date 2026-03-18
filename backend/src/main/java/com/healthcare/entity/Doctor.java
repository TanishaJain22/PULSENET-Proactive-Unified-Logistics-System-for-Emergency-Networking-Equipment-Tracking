package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    private String firstName; // Add first_name field to match existing database schema
    private String lastName;  // Add last_name field to match existing database schema
    
    @Column(nullable = false)
    private String specialization;
    
    @Column(nullable = false)
    private String experience;
    
    @Column(nullable = false)
    private String hospital;
    
    @Column(nullable = false)
    private Integer fees;
    
    @Column(nullable = false)
    private Double rating;
    
    @Column(columnDefinition = "TEXT")
    private String availableSlots; // JSON string: "10:00 AM,2:00 PM,5:00 PM"
    
    @Column(nullable = false)
    private Boolean isAvailable = true;
    
    @Column(nullable = false)
    private Boolean verified = true;
    
    private String address;
    private String phone;
    private String email; // Add email field to match existing database schema
    private String employeeId; // Add employee_id field to match existing database schema
    private LocalDate hireDate; // Add hire_date field to match existing database schema
    private UUID hospitalId; // Add hospital_id field to match existing database schema
    private String qualifications;
    private Integer reviewCount;
    private String nextAvailable;
    private String languages; // JSON string: "Hindi,English"
    private String image;
    private String availabilityStatus; // AVAILABLE, ON_LEAVE, BUSY, etc.
    private String notes; // Additional notes about doctor
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Doctor() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Doctor(String name, String specialization, String experience, 
                  String hospital, Integer fees, Double rating) {
        this();
        this.name = name;
        this.specialization = specialization;
        this.experience = experience;
        this.hospital = hospital;
        this.fees = fees;
        this.rating = rating;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getSpecialization() {
        return specialization;
    }
    
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
    
    public String getExperience() {
        return experience;
    }
    
    public void setExperience(String experience) {
        this.experience = experience;
    }
    
    public String getHospital() {
        return hospital;
    }
    
    public void setHospital(String hospital) {
        this.hospital = hospital;
    }
    
    public Integer getFees() {
        return fees;
    }
    
    public void setFees(Integer fees) {
        this.fees = fees;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public String getAvailableSlots() {
        return availableSlots;
    }
    
    public void setAvailableSlots(String availableSlots) {
        this.availableSlots = availableSlots;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public Boolean getVerified() {
        return verified;
    }
    
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }
    
    public LocalDate getHireDate() {
        return hireDate;
    }
    
    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }
    
    public UUID getHospitalId() {
        return hospitalId;
    }
    
    public void setHospitalId(UUID hospitalId) {
        this.hospitalId = hospitalId;
    }
    
    public String getQualifications() {
        return qualifications;
    }
    
    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }
    
    public Integer getReviewCount() {
        return reviewCount;
    }
    
    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }
    
    public String getNextAvailable() {
        return nextAvailable;
    }
    
    public void setNextAvailable(String nextAvailable) {
        this.nextAvailable = nextAvailable;
    }
    
    public String getLanguages() {
        return languages;
    }
    
    public void setLanguages(String languages) {
        this.languages = languages;
    }
    
    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
    
    public String getAvailabilityStatus() {
        return availabilityStatus;
    }
    
    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}