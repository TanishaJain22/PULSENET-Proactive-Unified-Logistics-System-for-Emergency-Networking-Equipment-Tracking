package com.healthcare.entity;

public enum BenefitType {
    FREE_SERVICE("Free Service", "Complete coverage with no cost"),
    DISCOUNT("Discount", "Percentage or fixed amount discount"),
    CASHBACK("Cashback", "Money back after service"),
    PRIORITY_QUEUE("Priority Queue", "Skip regular waiting lines"),
    COVERAGE("Coverage", "Insurance coverage up to limit"),
    EMERGENCY_ACCESS("Emergency Access", "24/7 emergency services"),
    SPECIALIST_ACCESS("Specialist Access", "Direct access to specialists"),
    MEDICINE_DISCOUNT("Medicine Discount", "Discounts on prescribed medicines"),
    DIAGNOSTIC_FREE("Free Diagnostics", "Free lab tests and scans"),
    TRANSPORT_ALLOWANCE("Transport Allowance", "Travel cost reimbursement");
    
    private final String displayName;
    private final String description;
    
    BenefitType(String displayName, String description) {
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