package com.healthcare.repository;

import com.healthcare.entity.CardBenefit;
import com.healthcare.entity.CardType;
import com.healthcare.entity.BenefitType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardBenefitRepository extends JpaRepository<CardBenefit, Long> {
    
    List<CardBenefit> findByCardTypeAndIsActiveTrue(CardType cardType);
    
    List<CardBenefit> findByCardTypeInAndIsActiveTrue(List<CardType> cardTypes);
    
    @Query("SELECT cb FROM CardBenefit cb WHERE cb.cardType = :cardType AND cb.serviceType = :serviceType AND cb.isActive = true")
    List<CardBenefit> findByCardTypeAndServiceType(@Param("cardType") CardType cardType, @Param("serviceType") String serviceType);
    
    @Query("SELECT cb FROM CardBenefit cb WHERE cb.cardType IN :cardTypes AND cb.serviceType = :serviceType AND cb.isActive = true ORDER BY cb.priorityLevel DESC")
    List<CardBenefit> findBestBenefitsForService(@Param("cardTypes") List<CardType> cardTypes, @Param("serviceType") String serviceType);
    
    @Query("SELECT cb FROM CardBenefit cb WHERE cb.cardType IN :cardTypes AND cb.isActive = true ORDER BY cb.priorityLevel DESC, cb.cardType")
    List<CardBenefit> findAllBenefitsByCardTypes(@Param("cardTypes") List<CardType> cardTypes);
    
    List<CardBenefit> findByBenefitTypeAndIsActiveTrue(BenefitType benefitType);
}