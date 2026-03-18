package com.healthcare.service;

import com.healthcare.entity.CardBenefit;
import com.healthcare.entity.CardType;
import com.healthcare.entity.BenefitType;
import com.healthcare.repository.CardBenefitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@ConditionalOnProperty(name = "app.data-seeding.enabled", havingValue = "true", matchIfMissing = true)
public class CardBenefitSeeder implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(CardBenefitSeeder.class);
    
    @Autowired
    private CardBenefitRepository cardBenefitRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (cardBenefitRepository.count() == 0) {
            seedCardBenefits();
            logger.info("Card benefits seeded successfully!");
        }
    }
    
    private void seedCardBenefits() {
        // Ayushman Bharat Benefits
        createBenefit(CardType.AYUSHMAN_BHARAT, BenefitType.FREE_SERVICE, "emergency", "100%", "₹5,00,000", 2);
        createBenefit(CardType.AYUSHMAN_BHARAT, BenefitType.FREE_SERVICE, "surgery", "100%", "₹5,00,000", 2);
        createBenefit(CardType.AYUSHMAN_BHARAT, BenefitType.FREE_SERVICE, "hospitalization", "100%", "₹5,00,000", 2);
        createBenefit(CardType.AYUSHMAN_BHARAT, BenefitType.PRIORITY_QUEUE, "all", "Skip queue", "", 1);
        createBenefit(CardType.AYUSHMAN_BHARAT, BenefitType.DIAGNOSTIC_FREE, "lab_tests", "100%", "₹10,000", 1);
        
        // RSBY Benefits
        createBenefit(CardType.RSBY, BenefitType.COVERAGE, "hospitalization", "100%", "₹30,000", 1);
        createBenefit(CardType.RSBY, BenefitType.FREE_SERVICE, "emergency", "100%", "₹30,000", 1);
        createBenefit(CardType.RSBY, BenefitType.MEDICINE_DISCOUNT, "prescribed", "50%", "₹5,000", 1);
        
        // JSY Benefits
        createBenefit(CardType.JSY, BenefitType.FREE_SERVICE, "maternity", "100%", "₹1,400", 2);
        createBenefit(CardType.JSY, BenefitType.TRANSPORT_ALLOWANCE, "maternity", "100%", "₹600", 1);
        createBenefit(CardType.JSY, BenefitType.PRIORITY_QUEUE, "maternity", "Skip queue", "", 2);
        
        // Credit Card Benefits
        createBenefit(CardType.CREDIT_CARD, BenefitType.DISCOUNT, "all", "10%", "₹50,000", 0);
        createBenefit(CardType.CREDIT_CARD, BenefitType.CASHBACK, "pharmacy", "5%", "₹5,000", 0);
        createBenefit(CardType.CREDIT_CARD, BenefitType.DISCOUNT, "diagnostic", "15%", "₹10,000", 0);
        
        // Insurance Card Benefits
        createBenefit(CardType.INSURANCE_CARD, BenefitType.COVERAGE, "hospitalization", "80%", "₹10,00,000", 1);
        createBenefit(CardType.INSURANCE_CARD, BenefitType.COVERAGE, "surgery", "90%", "₹5,00,000", 1);
        createBenefit(CardType.INSURANCE_CARD, BenefitType.DIAGNOSTIC_FREE, "annual_checkup", "100%", "₹15,000", 1);
        
        // Student Card Benefits
        createBenefit(CardType.STUDENT_CARD, BenefitType.DISCOUNT, "all", "20%", "₹25,000", 0);
        createBenefit(CardType.STUDENT_CARD, BenefitType.PRIORITY_QUEUE, "opd", "Student priority", "", 1);
        createBenefit(CardType.STUDENT_CARD, BenefitType.FREE_SERVICE, "mental_health", "100%", "₹5,000", 1);
        
        // Senior Citizen Benefits
        createBenefit(CardType.SENIOR_CITIZEN, BenefitType.DISCOUNT, "all", "30%", "₹1,00,000", 1);
        createBenefit(CardType.SENIOR_CITIZEN, BenefitType.PRIORITY_QUEUE, "all", "Senior priority", "", 2);
        createBenefit(CardType.SENIOR_CITIZEN, BenefitType.FREE_SERVICE, "regular_checkup", "100%", "₹10,000", 1);
        createBenefit(CardType.SENIOR_CITIZEN, BenefitType.MEDICINE_DISCOUNT, "chronic", "40%", "₹20,000", 1);
        
        // Disability Card Benefits
        createBenefit(CardType.DISABILITY_CARD, BenefitType.FREE_SERVICE, "all", "100%", "₹2,00,000", 2);
        createBenefit(CardType.DISABILITY_CARD, BenefitType.PRIORITY_QUEUE, "all", "Disability priority", "", 2);
        createBenefit(CardType.DISABILITY_CARD, BenefitType.TRANSPORT_ALLOWANCE, "all", "100%", "₹2,000", 1);
        
        // BPL Card Benefits
        createBenefit(CardType.BPL_CARD, BenefitType.FREE_SERVICE, "emergency", "100%", "₹50,000", 1);
        createBenefit(CardType.BPL_CARD, BenefitType.MEDICINE_DISCOUNT, "essential", "80%", "₹10,000", 1);
        createBenefit(CardType.BPL_CARD, BenefitType.DIAGNOSTIC_FREE, "basic", "100%", "₹5,000", 1);
        
        // Employee Health Card Benefits
        createBenefit(CardType.EMPLOYEE_CARD, BenefitType.COVERAGE, "all", "100%", "₹3,00,000", 1);
        createBenefit(CardType.EMPLOYEE_CARD, BenefitType.DIAGNOSTIC_FREE, "annual", "100%", "₹20,000", 1);
        createBenefit(CardType.EMPLOYEE_CARD, BenefitType.MEDICINE_DISCOUNT, "all", "25%", "₹15,000", 0);
    }
    
    private void createBenefit(CardType cardType, BenefitType benefitType, String serviceType, 
                              String benefitValue, String maxLimit, Integer priorityLevel) {
        CardBenefit benefit = new CardBenefit(cardType, benefitType, serviceType, benefitValue, maxLimit);
        benefit.setPriorityLevel(priorityLevel);
        cardBenefitRepository.save(benefit);
    }
}