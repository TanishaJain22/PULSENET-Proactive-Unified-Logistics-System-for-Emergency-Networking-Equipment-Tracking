package com.healthcare.dto;

import com.healthcare.entity.CardType;
import java.time.LocalDateTime;
import java.util.List;

public class UserCardDTO {
    private Long id;
    private Long userId;
    private CardType cardType;
    private String cardNumber;
    private String provider;
    private String holderName;
    private String expiryDate;
    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private List<CardBenefitDTO> benefits;
    
    // Constructors
    public UserCardDTO() {}
    
    public UserCardDTO(Long id, Long userId, CardType cardType, String cardNumber, 
                      String provider, String holderName, Boolean isActive, Boolean isVerified) {
        this.id = id;
        this.userId = userId;
        this.cardType = cardType;
        this.cardNumber = maskCardNumber(cardNumber);
        this.provider = provider;
        this.holderName = holderName;
        this.isActive = isActive;
        this.isVerified = isVerified;
    }
    
    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return cardNumber;
        }
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public CardType getCardType() { return cardType; }
    public void setCardType(CardType cardType) { this.cardType = cardType; }
    
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    
    public String getHolderName() { return holderName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }
    
    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<CardBenefitDTO> getBenefits() { return benefits; }
    public void setBenefits(List<CardBenefitDTO> benefits) { this.benefits = benefits; }
}