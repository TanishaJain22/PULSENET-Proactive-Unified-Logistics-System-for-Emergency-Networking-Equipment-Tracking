package com.healthcare.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class SpecialistAvailabilityService {
    
    // Temporarily disabled due to Lombok annotation processing issues
    // Will be re-enabled once Lombok is properly configured
    
    public void updateSummaryForHospital(UUID hospitalId) {
        // Mock implementation
    }
    
    public String test() {
        return "Specialist Availability Service is working!";
    }
}