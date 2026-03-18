package com.healthcare.service;

import com.healthcare.dto.AuthResponseDTO;
import com.healthcare.entity.User;
import com.healthcare.entity.enums.UserRole;
import com.healthcare.repository.UserRepository;
import com.healthcare.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    public AuthResponseDTO hospitalLogin(String identity, String password, String otp) {
        // Find user by email
        User user = userRepository.findByEmail(identity)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Check if user is hospital admin
        if (user.getRole() != UserRole.HOSPITAL_ADMIN) {
            throw new RuntimeException("Invalid credentials");
        }

        // Validate password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Validate OTP
        if (!otpService.validateOtp(identity, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name(), 
            user.getHospitalId()
        );

        // Return response
        AuthResponseDTO response = new AuthResponseDTO();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setHospitalId(user.getHospitalId());
        response.setToken(token);

        return response;
    }

    public AuthResponseDTO adminLogin(String identity, String password) {
        // Find user by email
        User user = userRepository.findByEmail(identity)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Check if user is system admin
        if (user.getRole() != UserRole.SYSTEM_ADMIN) {
            throw new RuntimeException("Invalid credentials");
        }

        // Validate password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name(), 
            null
        );

        // Return response
        AuthResponseDTO response = new AuthResponseDTO();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setToken(token);

        return response;
    }

    public AuthResponseDTO userLogin(String identity, String password) {
        // Find user by email
        User user = userRepository.findByEmail(identity)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Check if user is regular user
        if (user.getRole() != UserRole.USER) {
            throw new RuntimeException("Invalid credentials");
        }

        // Check if user account is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Account not activated. Please verify your email with the OTP sent during registration.");
        }

        // Validate password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name(), 
            null
        );

        // Return response
        AuthResponseDTO response = new AuthResponseDTO();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setToken(token);

        return response;
    }

    public void userRegister(String firstName, String lastName, String email, String phone, String password) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with this email already exists");
        }

        // Create new user (inactive until OTP verification)
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(UserRole.USER);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phone);
        user.setIsActive(false); // Will be activated after OTP verification
        
        userRepository.save(user);

        // Send OTP for verification
        otpService.generateAndSendOtp(email);
    }

    public AuthResponseDTO verifyUserRegistration(String email, String otp) {
        // Find user by email
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is already active
        if (user.getIsActive()) {
            throw new RuntimeException("User is already verified");
        }

        // Validate OTP
        if (!otpService.validateOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Activate user
        user.setIsActive(true);
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name(), 
            null
        );

        // Return response
        AuthResponseDTO response = new AuthResponseDTO();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setToken(token);

        return response;
    }

    // Manual activation method for testing/admin purposes
    public void activateUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsActive(true);
        userRepository.save(user);
    }
}