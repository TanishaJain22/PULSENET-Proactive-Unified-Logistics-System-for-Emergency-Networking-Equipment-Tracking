package com.healthcare.service;

import com.healthcare.entity.UserCard;
import com.healthcare.entity.CardType;
import com.healthcare.entity.CardBenefit;
import com.healthcare.dto.UserCardDTO;
import com.healthcare.dto.CardBenefitDTO;
import com.healthcare.repository.UserCardRepository;
import com.healthcare.repository.CardBenefitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@Transactional
public class UserCardService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserCardService.class);
    
    @Autowired
    private UserCardRepository userCardRepository;
    
    @Autowired
    private CardBenefitRepository cardBenefitRepository;
    
    public List<UserCardDTO> getUserCards(Long userId) {
        List<UserCard> cards = userCardRepository.findByUserIdAndIsActiveTrue(userId);
        return cards.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    public UserCardDTO addUserCard(UserCard card) {
        try {
            // Check if user already has this card type
            Optional<UserCard> existingCard = userCardRepository
                .findActiveCardByUserAndType(card.getUserId(), card.getCardType());
            
            if (existingCard.isPresent()) {
                throw new RuntimeException("User already has an active " + card.getCardType().getDisplayName() + " card");
            }
            
            // Auto-detect provider based on card type
            if (card.getProvider() == null || card.getProvider().isEmpty()) {
                card.setProvider(detectProvider(card.getCardType(), card.getCardNumber()));
            }
            
            UserCard savedCard = userCardRepository.save(card);
            logger.info("Added new card for user {}: {} - {}", 
                       card.getUserId(), card.getCardType(), card.getProvider());
            
            return convertToDTO(savedCard);
            
        } catch (Exception e) {
            logger.error("Error adding card for user {}: {}", card.getUserId(), e.getMessage());
            throw new RuntimeException("Failed to add card: " + e.getMessage());
        }
    }
    
    public void removeUserCard(Long userId, Long cardId) {
        Optional<UserCard> card = userCardRepository.findById(cardId);
        if (card.isPresent() && card.get().getUserId().equals(userId)) {
            card.get().setIsActive(false);
            userCardRepository.save(card.get());
            logger.info("Deactivated card {} for user {}", cardId, userId);
        } else {
            throw new RuntimeException("Card not found or access denied");
        }
    }
    
    public Map<String, Object> getUserBenefits(Long userId) {
        List<UserCard> userCards = userCardRepository.findVerifiedCardsByUser(userId);
        List<CardType> cardTypes = userCards.stream()
                                           .map(UserCard::getCardType)
                                           .collect(Collectors.toList());
        
        List<CardBenefit> benefits = cardBenefitRepository.findAllBenefitsByCardTypes(cardTypes);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalCards", userCards.size());
        result.put("verifiedCards", userCards.size());
        result.put("totalBenefits", benefits.size());
        result.put("cards", userCards.stream().map(this::convertToDTO).collect(Collectors.toList()));
        result.put("benefits", benefits.stream().map(this::convertBenefitToDTO).collect(Collectors.toList()));
        result.put("benefitsByService", groupBenefitsByService(benefits));
        
        return result;
    }
    
    public List<CardBenefitDTO> getBenefitsForService(Long userId, String serviceType) {
        List<UserCard> userCards = userCardRepository.findVerifiedCardsByUser(userId);
        List<CardType> cardTypes = userCards.stream()
                                           .map(UserCard::getCardType)
                                           .collect(Collectors.toList());
        
        List<CardBenefit> benefits = cardBenefitRepository.findBestBenefitsForService(cardTypes, serviceType);
        return benefits.stream()
                      .map(this::convertBenefitToDTO)
                      .collect(Collectors.toList());
    }
    
    public UserCardDTO verifyCard(Long userId, Long cardId, String verificationCode) {
        Optional<UserCard> cardOpt = userCardRepository.findById(cardId);
        if (cardOpt.isPresent() && cardOpt.get().getUserId().equals(userId)) {
            UserCard card = cardOpt.get();
            
            // Simple verification logic (in real app, this would call external APIs)
            boolean isValid = performCardVerification(card, verificationCode);
            
            if (isValid) {
                card.setIsVerified(true);
                UserCard savedCard = userCardRepository.save(card);
                logger.info("Verified card {} for user {}", cardId, userId);
                return convertToDTO(savedCard);
            } else {
                throw new RuntimeException("Card verification failed");
            }
        } else {
            throw new RuntimeException("Card not found or access denied");
        }
    }
    
    private UserCardDTO convertToDTO(UserCard card) {
        UserCardDTO dto = new UserCardDTO(
            card.getId(),
            card.getUserId(),
            card.getCardType(),
            card.getCardNumber(),
            card.getProvider(),
            card.getHolderName(),
            card.getIsActive(),
            card.getIsVerified()
        );
        dto.setCreatedAt(card.getCreatedAt());
        dto.setExpiryDate(card.getExpiryDate());
        
        // Add benefits for this card type
        List<CardBenefit> benefits = cardBenefitRepository.findByCardTypeAndIsActiveTrue(card.getCardType());
        dto.setBenefits(benefits.stream().map(this::convertBenefitToDTO).collect(Collectors.toList()));
        
        return dto;
    }
    
    private CardBenefitDTO convertBenefitToDTO(CardBenefit benefit) {
        return new CardBenefitDTO(
            benefit.getId(),
            benefit.getCardType(),
            benefit.getBenefitType(),
            benefit.getServiceType(),
            benefit.getBenefitValue(),
            benefit.getMaxLimit(),
            benefit.getPriorityLevel()
        );
    }
    
    private String detectProvider(CardType cardType, String cardNumber) {
        switch (cardType) {
            case AYUSHMAN_BHARAT:
                return "Government of India";
            case RSBY:
                return "Ministry of Health";
            case JSY:
                return "National Health Mission";
            case CREDIT_CARD:
                return detectCreditCardProvider(cardNumber);
            default:
                return "Unknown";
        }
    }
    
    private String detectCreditCardProvider(String cardNumber) {
        if (cardNumber.startsWith("4")) return "VISA";
        if (cardNumber.startsWith("5")) return "MasterCard";
        if (cardNumber.startsWith("3")) return "American Express";
        return "Unknown Bank";
    }
    
    private boolean performCardVerification(UserCard card, String verificationCode) {
        // Mock verification logic
        // In real implementation, this would call government APIs or bank APIs
        switch (card.getCardType()) {
            case AYUSHMAN_BHARAT:
                return verificationCode.length() == 6; // Mock OTP verification
            case CREDIT_CARD:
                return verificationCode.length() == 3; // Mock CVV verification
            default:
                return true; // Auto-verify for demo
        }
    }
    
    private Map<String, List<CardBenefitDTO>> groupBenefitsByService(List<CardBenefit> benefits) {
        return benefits.stream()
                      .map(this::convertBenefitToDTO)
                      .collect(Collectors.groupingBy(CardBenefitDTO::getServiceType));
    }
}