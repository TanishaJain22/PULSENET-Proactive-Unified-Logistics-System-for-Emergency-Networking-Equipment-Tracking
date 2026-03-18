package com.healthcare.service;

import com.healthcare.entity.Hospital;
import com.healthcare.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class MLModelMappingService {

    private final HospitalRepository hospitalRepository;
    
    // Cache for UUID to ML ID mapping (0-4)
    private final Map<UUID, Integer> uuidToMlIdCache = new ConcurrentHashMap<>();
    private final Map<Integer, UUID> mlIdToUuidCache = new ConcurrentHashMap<>();
    
    // Specialty encoding for ML model (as per your training data)
    private static final Map<String, Integer> SPECIALTY_ENCODING = Map.of(
        "cardiology", 0,
        "neurology", 1,
        "emergency medicine", 2,
        "surgery", 3,
        "pediatrics", 4,
        "orthopedics", 5,
        "oncology", 6,
        "other", 7
    );

    // Traffic encoding for ML model
    private static final Map<String, Integer> TRAFFIC_ENCODING = Map.of(
        "LIGHT", 0,
        "MODERATE", 1,
        "HEAVY", 2,
        "SEVERE", 3
    );

    /**
     * Initialize hospital ID mapping for ML model (0-4)
     * Call this on application startup or when hospitals are added/removed
     */
    public void initializeHospitalMapping() {
        log.info("Initializing hospital ID mapping for ML model");
        
        List<Hospital> hospitals = hospitalRepository.findAll();
        
        // Sort hospitals by creation date for consistent mapping
        hospitals.sort(Comparator.comparing(Hospital::getCreatedAt));
        
        // Clear existing cache
        uuidToMlIdCache.clear();
        mlIdToUuidCache.clear();
        
        // Map first 5 hospitals to ML IDs 0-4
        for (int i = 0; i < Math.min(hospitals.size(), 5); i++) {
            Hospital hospital = hospitals.get(i);
            uuidToMlIdCache.put(hospital.getId(), i);
            mlIdToUuidCache.put(i, hospital.getId());
            
            log.info("Mapped hospital {} ({}) to ML ID {}", 
                    hospital.getName(), hospital.getId(), i);
        }
        
        log.info("Hospital mapping initialized with {} hospitals", uuidToMlIdCache.size());
    }

    /**
     * Convert hospital UUID to ML model ID (0-4)
     */
    public Integer getMLHospitalId(UUID hospitalUuid) {
        if (hospitalUuid == null) return null;
        
        Integer mlId = uuidToMlIdCache.get(hospitalUuid);
        if (mlId == null) {
            // Try to initialize mapping if cache is empty (lazy initialization)
            if (uuidToMlIdCache.isEmpty()) {
                log.info("ML mapping cache is empty, attempting lazy initialization");
                initializeHospitalMapping();
                mlId = uuidToMlIdCache.get(hospitalUuid);
            }
            
            // If still not found, auto-assign next available ID if cache is not full
            if (mlId == null && uuidToMlIdCache.size() < 5) {
                mlId = uuidToMlIdCache.size();
                uuidToMlIdCache.put(hospitalUuid, mlId);
                mlIdToUuidCache.put(mlId, hospitalUuid);
                log.info("Auto-assigned ML ID {} to hospital {}", mlId, hospitalUuid);
            } else if (mlId == null) {
                // Only log warning if we can't auto-assign (cache is full)
                log.debug("Hospital UUID {} not found in ML mapping and cache is full", hospitalUuid);
            }
        }
        
        return mlId;
    }

    /**
     * Convert ML model ID (0-4) to hospital UUID
     */
    public UUID getHospitalUUID(Integer mlHospitalId) {
        if (mlHospitalId == null || mlHospitalId < 0 || mlHospitalId > 4) {
            return null;
        }
        
        return mlIdToUuidCache.get(mlHospitalId);
    }

    /**
     * Encode specialty for ML model
     */
    public Integer encodeSpecialty(String specialty) {
        if (specialty == null) return SPECIALTY_ENCODING.get("other");
        return SPECIALTY_ENCODING.getOrDefault(specialty.toLowerCase(), SPECIALTY_ENCODING.get("other"));
    }

    /**
     * Encode traffic condition for ML model
     */
    public Integer encodeTrafficCondition(String trafficCondition) {
        if (trafficCondition == null) return TRAFFIC_ENCODING.get("MODERATE");
        return TRAFFIC_ENCODING.getOrDefault(trafficCondition.toUpperCase(), TRAFFIC_ENCODING.get("MODERATE"));
    }

    /**
     * Encode consciousness level for ML model (AVPU scale)
     */
    public Integer encodeConsciousnessLevel(String consciousnessLevel) {
        if (consciousnessLevel == null) return 0; // Default to ALERT
        
        switch (consciousnessLevel.toUpperCase()) {
            case "ALERT": return 0;      // Fully alert
            case "VOICE": return 1;      // Responds to voice
            case "PAIN": return 2;       // Responds only to pain
            case "UNRESPONSIVE": return 3; // Unresponsive
            default: return 0;           // Default to alert
        }
    }

    /**
     * Get all hospital mappings for debugging
     */
    public Map<String, Object> getHospitalMappings() {
        Map<String, Object> mappings = new HashMap<>();
        
        for (Map.Entry<UUID, Integer> entry : uuidToMlIdCache.entrySet()) {
            UUID uuid = entry.getKey();
            Integer mlId = entry.getValue();
            
            Optional<Hospital> hospital = hospitalRepository.findById(uuid);
            String hospitalName = hospital.map(Hospital::getName).orElse("Unknown");
            
            mappings.put("ML_ID_" + mlId, Map.of(
                "uuid", uuid.toString(),
                "name", hospitalName,
                "mlId", mlId
            ));
        }
        
        return mappings;
    }

    /**
     * Force refresh of hospital mappings (useful after hospitals are added/removed)
     */
    public void refreshHospitalMapping() {
        log.info("Refreshing hospital ID mapping for ML model");
        initializeHospitalMapping();
    }

    /**
     * Get current cache size for monitoring
     */
    public int getCacheSize() {
        return uuidToMlIdCache.size();
    }

    /**
     * Validate that we have exactly 5 hospitals mapped (as required by ML model)
     */
    public boolean isValidMapping() {
        return uuidToMlIdCache.size() == 5;
    }

    /**
     * Get specialty encoding map for reference
     */
    public Map<String, Integer> getSpecialtyEncodingMap() {
        return new HashMap<>(SPECIALTY_ENCODING);
    }

    /**
     * Get traffic encoding map for reference
     */
    public Map<String, Integer> getTrafficEncodingMap() {
        return new HashMap<>(TRAFFIC_ENCODING);
    }
}