package com.healthcare.repository;

import com.healthcare.entity.UserCard;
import com.healthcare.entity.CardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCardRepository extends JpaRepository<UserCard, Long> {
    
    List<UserCard> findByUserIdAndIsActiveTrue(Long userId);
    
    List<UserCard> findByUserId(Long userId);
    
    Optional<UserCard> findByUserIdAndCardTypeAndIsActiveTrue(Long userId, CardType cardType);
    
    @Query("SELECT uc FROM UserCard uc WHERE uc.cardNumber = :cardNumber AND uc.isActive = true")
    List<UserCard> findByCardNumberAndIsActiveTrue(@Param("cardNumber") String cardNumber);
    
    @Query("SELECT uc FROM UserCard uc WHERE uc.userId = :userId AND uc.cardType = :cardType AND uc.isActive = true")
    Optional<UserCard> findActiveCardByUserAndType(@Param("userId") Long userId, @Param("cardType") CardType cardType);
    
    @Query("SELECT COUNT(uc) FROM UserCard uc WHERE uc.userId = :userId AND uc.isActive = true")
    Long countActiveCardsByUser(@Param("userId") Long userId);
    
    @Query("SELECT uc FROM UserCard uc WHERE uc.userId = :userId AND uc.isVerified = true AND uc.isActive = true")
    List<UserCard> findVerifiedCardsByUser(@Param("userId") Long userId);
}