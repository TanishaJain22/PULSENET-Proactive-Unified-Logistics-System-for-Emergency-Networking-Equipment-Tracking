package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "card_benefits")
public class CardBenefit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    private CardType cardType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "benefit_type", nullable = false)
    private BenefitType benefitType;
    
    @Column(name = "service_type")
    private String serviceType; // ambulance, ICU, OPD, emergency, etc.
    
    @Column(name = "benefit_value")
    private String benefitValue; // "100%", "₹5000", "10%", "FREE", etc.
    
    @Column(name = "max_limit")
    private String maxLimit; // "₹5,00,000", "₹30,000", etc.
    
    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions; // JSON string with conditions
    
    @Column(name = "priority_level")
    private Integer priorityLevel = 0; // 0 = normal, 1 = high, 2 = emergency
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public CardBenefit() {}
    
    public CardBenefit(CardType cardType, BenefitType benefitType, String serviceType, 
                      String benefitValue, String maxLimit) {
        this.cardType = cardType;
        this.benefitType = benefitType;
        this.serviceType = serviceType;
        this.benefitValue = benefitValue;
        this.maxLimit = maxLimit;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public CardType getCardType() { return cardType; }
    public void setCardType(CardType cardType) { this.cardType = cardType; }
    
    public BenefitType getBenefitType() { return benefitType; }
    public void setBenefitType(BenefitType benefitType) { this.benefitType = benefitType; }
    
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    
    public String getBenefitValue() { return benefitValue; }
    public void setBenefitValue(String benefitValue) { this.benefitValue = benefitValue; }
    
    public String getMaxLimit() { return maxLimit; }
    public void setMaxLimit(String maxLimit) { this.maxLimit = maxLimit; }
    
    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }
    
    public Integer getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}