package com.healthcare.controller;

import com.healthcare.entity.UserCard;
import com.healthcare.entity.CardType;
import com.healthcare.dto.UserCardDTO;
import com.healthcare.dto.CardBenefitDTO;
import com.healthcare.service.UserCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/user-cards")
@CrossOrigin(origins = "*")
public class UserCardController {
    
    @Autowired
    private UserCardService userCardService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserCards(@PathVariable Long userId) {
        try {
            List<UserCardDTO> cards = userCardService.getUserCards(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cards", cards);
            response.put("totalCards", cards.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> addUserCard(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> cardData) {
        try {
            UserCard card = new UserCard();
            card.setUserId(userId);
            card.setCardType(CardType.valueOf((String) cardData.get("cardType")));
            card.setCardNumber((String) cardData.get("cardNumber"));
            card.setProvider((String) cardData.get("provider"));
            card.setHolderName((String) cardData.get("holderName"));
            card.setExpiryDate((String) cardData.get("expiryDate"));
            
            UserCardDTO savedCard = userCardService.addUserCard(card);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Card added successfully");
            response.put("card", savedCard);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{userId}/{cardId}")
    public ResponseEntity<Map<String, Object>> removeUserCard(
            @PathVariable Long userId,
            @PathVariable Long cardId) {
        try {
            userCardService.removeUserCard(userId, cardId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Card removed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{userId}/benefits")
    public ResponseEntity<Map<String, Object>> getUserBenefits(@PathVariable Long userId) {
        try {
            Map<String, Object> benefits = userCardService.getUserBenefits(userId);
            benefits.put("success", true);
            return ResponseEntity.ok(benefits);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{userId}/benefits/{serviceType}")
    public ResponseEntity<Map<String, Object>> getBenefitsForService(
            @PathVariable Long userId,
            @PathVariable String serviceType) {
        try {
            List<CardBenefitDTO> benefits = userCardService.getBenefitsForService(userId, serviceType);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("benefits", benefits);
            response.put("serviceType", serviceType);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{userId}/{cardId}/verify")
    public ResponseEntity<Map<String, Object>> verifyCard(
            @PathVariable Long userId,
            @PathVariable Long cardId,
            @RequestBody Map<String, String> verificationData) {
        try {
            String verificationCode = verificationData.get("verificationCode");
            UserCardDTO verifiedCard = userCardService.verifyCard(userId, cardId, verificationCode);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Card verified successfully");
            response.put("card", verifiedCard);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/card-types")
    public ResponseEntity<Map<String, Object>> getAvailableCardTypes() {
        try {
            Map<String, String> cardTypes = new HashMap<>();
            for (CardType type : CardType.values()) {
                cardTypes.put(type.name(), type.getDisplayName());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cardTypes", cardTypes);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}