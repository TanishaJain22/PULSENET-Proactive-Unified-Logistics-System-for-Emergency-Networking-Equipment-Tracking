package com.healthcare.service;

import com.healthcare.entity.OtpToken;
import com.healthcare.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    @Transactional
    public void generateAndSendOtp(String email) {
        // Clean up expired OTPs for this email
        otpTokenRepository.deleteByEmailAndExpiresAtBefore(email, LocalDateTime.now());
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Create OTP token
        OtpToken otpToken = new OtpToken();
        otpToken.setEmail(email);
        otpToken.setOtp(otp);
        otpToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        
        otpTokenRepository.save(otpToken);
        
        // Send OTP via email
        emailService.sendOtp(email, otp);
    }

    @Transactional
    public boolean validateOtp(String email, String otp) {
        return otpTokenRepository
            .findByEmailAndOtpAndUsedFalseAndExpiresAtAfter(email, otp, LocalDateTime.now())
            .map(otpToken -> {
                otpToken.setUsed(true);
                otpTokenRepository.save(otpToken);
                return true;
            })
            .orElse(false);
    }
}