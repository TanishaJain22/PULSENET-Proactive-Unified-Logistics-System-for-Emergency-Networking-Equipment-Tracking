package com.healthcare.dto;

import com.healthcare.entity.CardType;
import com.healthcare.entity.BenefitType;

public class CardBenefitDTO {
    private Long id;
    private CardType cardType;
    private BenefitType benefitType;
    private String serviceType;
    private String benefitValue;
    private String maxLimit;
    private String conditions;
    private Integer priorityLevel;
    private String displayText;
    
    // Constructors
    public CardBenefitDTO() {}
    
    public CardBenefitDTO(Long id, CardType cardType, BenefitType benefitType, 
                         String serviceType, String benefitValue, String maxLimit, Integer priorityLevel) {
        this.id = id;
        this.cardType = cardType;
        this.benefitType = benefitType;
        this.serviceType = serviceType;
        this.benefitValue = benefitValue;
        this.maxLimit = maxLimit;
        this.priorityLevel = priorityLevel;
        this.displayText = generateDisplayText();
    }
    
    private String generateDisplayText() {
        StringBuilder text = new StringBuilder();
        
        if (benefitType != null) {
            text.append(benefitType.getDisplayName());
        }
        
        if (benefitValue != null && !benefitValue.isEmpty()) {
            text.append(": ").append(benefitValue);
        }
        
        if (maxLimit != null && !maxLimit.isEmpty()) {
            text.append(" (up to ").append(maxLimit).append(")");
        }
        
        if (serviceType != null && !serviceType.isEmpty()) {
            text.append(" for ").append(serviceType);
        }
        
        return text.toString();
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
    
    public String getDisplayText() { return displayText; }
    public void setDisplayText(String displayText) { this.displayText = displayText; }
}