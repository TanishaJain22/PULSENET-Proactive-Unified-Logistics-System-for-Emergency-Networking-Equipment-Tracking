package com.healthcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.from:pulsenethealth@gmail.com}")
    private String fromEmail;

    public void sendOtp(String toEmail, String otp) {
        try {
            log.info("📧 Sending OTP to hospital email: {}", toEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("PulseNet - Your Login OTP Code");
            
            String emailBody = String.format(
                "Dear Hospital Administrator,\n\n" +
                "You have requested to log into your PulseNet hospital account.\n\n" +
                "Your One-Time Password (OTP) is: %s\n\n" +
                "This OTP is valid for 10 minutes only.\n\n" +
                "If you did not request this OTP, please ignore this email or contact our support team.\n\n" +
                "For security reasons:\n" +
                "• Do not share this OTP with anyone\n" +
                "• Use this OTP only on the official PulseNet login page\n" +
                "• This OTP will expire automatically after 10 minutes\n\n" +
                "Best regards,\n" +
                "The PulseNet Security Team\n\n" +
                "---\n" +
                "This is an automated security message. Please do not reply to this email.\n" +
                "For support, contact: support@pulsenet.com",
                otp
            );
            
            message.setText(emailBody);
            message.setFrom(fromEmail);
            
            log.info("📤 OTP Email details:");
            log.info("   From: {}", fromEmail);
            log.info("   To: {}", toEmail);
            log.info("   OTP: {}", otp);
            log.info("   Subject: {}", message.getSubject());
            
            mailSender.send(message);
            log.info("✅ OTP sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send OTP email to: {}. Error: {}", toEmail, e.getMessage(), e);
            log.info("📧 OTP for {} (fallback): {}", toEmail, otp);
            
            // Don't throw exception - log the OTP for testing if email fails
        }
    }

    public void sendHospitalRegistrationConfirmation(String toEmail, String hospitalName, String hospitalId) {
        try {
            // Skip email sending if not properly configured
            if (fromEmail == null || fromEmail.isEmpty() || fromEmail.equals("noreply@pulsenet.com")) {
                log.warn("⚠️ Email not configured properly. Skipping email to: {}", toEmail);
                log.info("📧 Would have sent registration confirmation to: {} for hospital: {}", toEmail, hospitalName);
                return;
            }
            
            log.info("📧 Attempting to send registration confirmation email to: {}", toEmail);
            log.info("📧 Using sender email: {}", fromEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("PulseNet - Hospital Registration Received");
            
            String emailBody = String.format(
                "Dear %s Team,\n\n" +
                "Thank you for registering with PulseNet!\n\n" +
                "We have successfully received your hospital registration application.\n\n" +
                "Registration Details:\n" +
                "• Hospital Name: %s\n" +
                "• Registration ID: %s\n" +
                "• Status: Pending Verification\n\n" +
                "What happens next?\n" +
                "Our verification team will review your application and supporting documents within 2-3 business days. " +
                "You will receive an email notification once the verification process is complete.\n\n" +
                "During the verification process, our team will:\n" +
                "• Verify your hospital license and certifications\n" +
                "• Review your infrastructure and capacity details\n" +
                "• Validate your contact information\n\n" +
                "If you have any questions or need assistance, please contact our support team.\n\n" +
                "Thank you for joining the PulseNet healthcare network!\n\n" +
                "Best regards,\n" +
                "The PulseNet Team\n\n" +
                "---\n" +
                "This is an automated message. Please do not reply to this email.\n" +
                "For support, contact: support@pulsenet.com",
                hospitalName, hospitalName, hospitalId
            );
            
            message.setText(emailBody);
            message.setFrom(fromEmail);
            
            log.info("📤 Email details:");
            log.info("   From: {}", fromEmail);
            log.info("   To: {}", toEmail);
            log.info("   Subject: {}", message.getSubject());
            log.info("   Body length: {} characters", emailBody.length());
            
            mailSender.send(message);
            log.info("✅ Registration confirmation email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send registration confirmation email to: {}. Error: {}", toEmail, e.getMessage(), e);
            
            // Detailed error logging
            log.error("📧 Email configuration - From: {}, To: {}", fromEmail, toEmail);
            log.error("📧 Full error stack trace:", e);
            
            // Check specific error types
            if (e.getMessage().contains("Authentication failed")) {
                log.error("🔐 Authentication Error: Check Gmail app password");
            } else if (e.getMessage().contains("Connection refused")) {
                log.error("🌐 Connection Error: Check SMTP host and port");
            } else if (e.getMessage().contains("timeout")) {
                log.error("⏰ Timeout Error: Check network connectivity");
            }
            
            // Fallback: Log the email content for testing
            log.info("📧 EMAIL CONTENT (fallback logging):");
            log.info("📧 To: {}", toEmail);
            log.info("📧 Subject: PulseNet - Hospital Registration Received");
            log.info("📧 Hospital: {} (ID: {})", hospitalName, hospitalId);
            log.info("📧 Message: Your hospital registration has been received and will be verified within 2-3 business days.");
            
            // Don't throw exception - email failure shouldn't break registration
        }
    }
    
    public void testEmailConnection() {
        try {
            log.info("🔧 Testing email connection...");
            log.info("🔧 SMTP Host: smtp.gmail.com");
            log.info("🔧 SMTP Port: 587");
            log.info("🔧 From Email: {}", fromEmail);
            
            SimpleMailMessage testMessage = new SimpleMailMessage();
            testMessage.setTo(fromEmail); // Send test email to self
            testMessage.setSubject("PulseNet - Email Configuration Test");
            testMessage.setText("This is a test email to verify PulseNet email configuration is working correctly.\n\nTimestamp: " + java.time.LocalDateTime.now());
            testMessage.setFrom(fromEmail);
            
            log.info("📤 Sending test email to: {}", fromEmail);
            mailSender.send(testMessage);
            log.info("✅ Test email sent successfully!");
            
        } catch (Exception e) {
            log.error("❌ Email connection test failed: {}", e.getMessage(), e);
            
            // Provide specific troubleshooting info
            if (e.getMessage().contains("Authentication failed")) {
                log.error("🔐 Gmail Authentication Issue:");
                log.error("   1. Verify app password is correct: rdmj vkio shye nypc");
                log.error("   2. Check if 2FA is enabled on Gmail account");
                log.error("   3. Verify 'Less secure app access' is not needed (should use app password)");
            } else if (e.getMessage().contains("Connection")) {
                log.error("🌐 Network/Connection Issue:");
                log.error("   1. Check internet connectivity");
                log.error("   2. Verify SMTP host: smtp.gmail.com");
                log.error("   3. Verify SMTP port: 587");
                log.error("   4. Check firewall settings");
            }
            
            throw new RuntimeException("Email test failed: " + e.getMessage(), e);
        }
    }

    public void sendEmergencyAlert(String toEmail, String subject, String body) {
        try {
            log.warn("🚨 Sending emergency alert email to: {}", toEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            log.warn("🚨 Emergency alert email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send emergency alert email to: {}. Error: {}", toEmail, e.getMessage());
            // Log the alert content for fallback
            log.warn("🚨 EMERGENCY ALERT (fallback logging):");
            log.warn("🚨 To: {}", toEmail);
            log.warn("🚨 Subject: {}", subject);
            log.warn("🚨 Body: {}", body);
        }
    }
}
