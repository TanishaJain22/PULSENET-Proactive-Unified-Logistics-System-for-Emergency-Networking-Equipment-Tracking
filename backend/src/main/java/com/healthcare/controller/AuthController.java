package com.healthcare.controller;

import com.healthcare.dto.*;
import com.healthcare.service.AuthService;
import com.healthcare.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Auth controller is working");
        response.put("endpoints", new String[]{
            "/api/auth/login/admin", 
            "/api/auth/login/hospital", 
            "/api/auth/login/user", 
            "/api/auth/register/user",
            "/api/auth/register/user/verify",
            "/api/auth/otp/send"
        });
        return response;
    }

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody OtpRequestDTO request) {
        try {
            otpService.generateAndSendOtp(request.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP sent successfully");
            response.put("email", request.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to send OTP: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login/hospital")
    public ResponseEntity<?> hospitalLogin(@Valid @RequestBody HospitalLoginDTO request) {
        try {
            AuthResponseDTO response = authService.hospitalLogin(
                request.getIdentity(), 
                request.getPassword(), 
                request.getOtp()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Login failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login/admin")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody AdminLoginDTO request) {
        try {
            AuthResponseDTO response = authService.adminLogin(
                request.getIdentity(), 
                request.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Login failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login/user")
    public ResponseEntity<?> userLogin(@Valid @RequestBody UserLoginDTO request) {
        try {
            AuthResponseDTO response = authService.userLogin(
                request.getIdentity(), 
                request.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Login failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/register/user")
    public ResponseEntity<?> userRegister(@Valid @RequestBody UserRegistrationDTO request) {
        try {
            authService.userRegister(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful. Please check your email for OTP verification.");
            response.put("email", request.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Registration failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/register/user/verify")
    public ResponseEntity<?> verifyUserRegistration(@Valid @RequestBody UserRegistrationVerificationDTO request) {
        try {
            AuthResponseDTO response = authService.verifyUserRegistration(
                request.getEmail(),
                request.getOtp()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Verification failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Manual user activation endpoint for testing
    @PostMapping("/activate-user")
    public ResponseEntity<?> activateUser(@RequestParam String email) {
        try {
            authService.activateUser(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User activated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Activation failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // For now, return mock data based on the hospital ID from URL
            // In production, you'd extract user info from JWT token
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                "id", "admin-123",
                "firstName", "Dr. Admin",
                "lastName", "Sharma",
                "email", "admin@hospital.com",
                "role", "HOSPITAL_ADMIN",
                "hospitalId", "hospital-123"
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get profile: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}