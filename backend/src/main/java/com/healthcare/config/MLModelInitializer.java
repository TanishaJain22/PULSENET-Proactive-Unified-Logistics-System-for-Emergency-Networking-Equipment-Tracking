package com.healthcare.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import com.healthcare.service.MLModelMappingService;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.ml-initialization.enabled", havingValue = "true", matchIfMissing = false)
@Order(2) // Run after DataSeeder (which should be Order(1))
public class MLModelInitializer implements ApplicationRunner {

    private final MLModelMappingService mlMappingService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Initializing ML model mappings...");
        
        try {
            // Add a small delay to ensure DataSeeder has completed
            Thread.sleep(2000);
            
            // Initialize hospital ID mappings for ML model
            mlMappingService.initializeHospitalMapping();
            
            // Validate mapping
            if (mlMappingService.isValidMapping()) {
                log.info("✅ ML model initialization successful - 5 hospitals mapped");
            } else {
                log.warn("⚠️ ML model mapping incomplete - only {} hospitals mapped", 
                        mlMappingService.getHospitalMappings().size());
                log.info("💡 Lazy initialization will handle missing mappings during runtime");
            }
            
            // Log mappings for debugging
            log.info("Hospital mappings: {}", mlMappingService.getHospitalMappings());
            log.info("Specialty encodings: {}", mlMappingService.getSpecialtyEncodingMap());
            log.info("Traffic encodings: {}", mlMappingService.getTrafficEncodingMap());
            
        } catch (Exception e) {
            log.error("Failed to initialize ML model mappings: {}", e.getMessage(), e);
            log.info("💡 Lazy initialization will handle mappings during runtime");
        }
    }
}