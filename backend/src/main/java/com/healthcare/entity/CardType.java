package com.healthcare.entity;

public enum CardType {
    AYUSHMAN_BHARAT("Ayushman Bharat", "Government health insurance covering ₹5 lakh per family"),
    RSBY("Rashtriya Swasthya Bima Yojana", "BPL health insurance covering ₹30,000 per family"),
    JSY("Janani Suraksha Yojana", "Maternity benefit scheme for pregnant women"),
    CREDIT_CARD("Credit Card", "Banking credit card with health benefits"),
    INSURANCE_CARD("Health Insurance", "Private health insurance card"),
    STUDENT_CARD("Student Card", "Student identification for priority services"),
    SENIOR_CITIZEN("Senior Citizen Card", "Special benefits for senior citizens"),
    DISABILITY_CARD("Disability Card", "Special assistance for disabled individuals"),
    BPL_CARD("BPL Card", "Below Poverty Line identification card"),
    EMPLOYEE_CARD("Employee Health Card", "Corporate health benefits card");
    
    private final String displayName;
    private final String description;
    
    CardType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}