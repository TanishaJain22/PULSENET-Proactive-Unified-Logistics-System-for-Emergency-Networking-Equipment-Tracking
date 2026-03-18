package com.healthcare.repository;

import com.healthcare.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findByEmailAndOtpAndUsedFalseAndExpiresAtAfter(
        String email, String otp, LocalDateTime currentTime);
    
    void deleteByEmailAndExpiresAtBefore(String email, LocalDateTime currentTime);
}