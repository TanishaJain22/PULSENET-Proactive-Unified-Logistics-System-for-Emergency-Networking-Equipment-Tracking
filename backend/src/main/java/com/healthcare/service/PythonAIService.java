package com.healthcare.service;

import com.healthcare.dto.TransferRequestDTO;
import com.healthcare.dto.HospitalRecommendationDTO;
import com.healthcare.entity.HospitalSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PythonAIService {

    private final RestTemplate restTemplate;
    private final MLModelMappingService mlMappingService;

    @Value("${ai.python.base-url:http://127.0.0.1:8000}")
    private String pythonAIBaseUrl;

    @Value("${ai.python.enabled:true}")
    private boolean aiEnabled;

    @Value("${ai.python.timeout:5000}")
    private int timeoutMs;

    /**
     * Call Python FastAPI to get AI-powered hospital recommendations
     */
    public List<HospitalRecommendationDTO> getAIHospitalRecommendations(
            TransferRequestDTO request, 
            List<HospitalSnapshot> availableHospitals) {
        
        if (!aiEnabled) {
            log.info("Python AI service is disabled, using fallback recommendations");
            return getFallbackRecommendations(availableHospitals, request);
        }

        try {
            log.info("Calling Python AI service for patient: {}", request.getPatientId());
            log.info("Available hospitals for AI recommendation: {}", 
                    availableHospitals.stream()
                            .map(h -> h.getHospital() != null ? h.getHospital().getName() : "Unknown")
                            .collect(Collectors.toList()));

            // Prepare the request payload for Python API
            Map<String, Object> aiRequest = buildAIRequest(request, availableHospitals);
            log.debug("AI request payload size: {} hospitals", availableHospitals.size());

            // Set up HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "PulseNet-SpringBoot/1.0");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);

            // Call Python FastAPI
            String url = pythonAIBaseUrl + "/get_top_hospitals";
            log.info("Calling Python AI at: {} with timeout: {}ms", url, timeoutMs);

            long startTime = System.currentTimeMillis();
            ResponseEntity<AIResponse> response = restTemplate.postForEntity(
                url, entity, AIResponse.class);
            long endTime = System.currentTimeMillis();

            log.info("Python AI call completed in {}ms", (endTime - startTime));

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Python AI returned {} recommendations", response.getBody().getRecommendations().size());
                return convertAIResponseToRecommendations(response.getBody(), availableHospitals);
            } else {
                log.warn("Python AI returned non-OK status: {}", response.getStatusCode());
                return getFallbackRecommendations(availableHospitals, request);
            }

        } catch (ResourceAccessException e) {
            log.error("Python AI service is not reachable: {}", e.getMessage());
            log.info("Using fallback recommendation algorithm");
            return getFallbackRecommendations(availableHospitals, request);
        } catch (Exception e) {
            log.error("Error calling Python AI service: {}", e.getMessage(), e);
            log.info("Using fallback recommendation algorithm");
            return getFallbackRecommendations(availableHospitals, request);
        }
    }

    /**
     * Build the request payload that matches your Python FastAPI expectations
     */
    private Map<String, Object> buildAIRequest(TransferRequestDTO request, List<HospitalSnapshot> hospitals) {
        Map<String, Object> aiRequest = new HashMap<>();

        // Patient vitals (as per your Python API)
        aiRequest.put("heart_rate", request.getHeartRate());
        aiRequest.put("oxygen_level", request.getOxygenLevel());
        aiRequest.put("temperature", request.getTemperature());
        aiRequest.put("bp_systolic", request.getBpSystolic());
        aiRequest.put("bp_diastolic", request.getBpDiastolic());
        aiRequest.put("respiratory_rate", request.getRespiratoryRate());
        aiRequest.put("supplemental_o2", request.getSupplementalO2() ? 1 : 0);
        aiRequest.put("consciousness_level", encodeConsciousness(request.getConsciousnessLevel()));
        aiRequest.put("severity_level", request.getSeverityLevel());
        aiRequest.put("estimated_travel_time", request.getEstimatedTravelTime().doubleValue());

        // Encodings
        aiRequest.put("specialty_encoded", mlMappingService.encodeSpecialty(request.getRequiredSpecialty()));
        aiRequest.put("traffic_encoded", mlMappingService.encodeTrafficCondition(request.getTrafficCondition().toString()));
        
        // Additional patient demographics (required by XGBoost model)
        aiRequest.put("patient_age", 50); // Default age - could be added to TransferRequestDTO later
        aiRequest.put("patient_gender", 0); // Default male - could be added to TransferRequestDTO later  
        aiRequest.put("patient_weight", 70.0); // Default weight - could be added to TransferRequestDTO later
        aiRequest.put("emergency_level", Math.min(request.getSeverityLevel(), 10)); // Map severity to emergency level

        // Hospital data (ensure exactly 5 hospitals as per your model)
        List<Map<String, Object>> hospitalData = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Map<String, Object> hospitalInfo = new HashMap<>();
            
            if (i < hospitals.size()) {
                HospitalSnapshot hospital = hospitals.get(i);
                // Use sequential hospital_id (0-4) for Python API, store original ML ID for mapping back
                hospitalInfo.put("hospital_id", i);
                hospitalInfo.put("icu_beds", hospital.getIcuBedsAvailable());
                hospitalInfo.put("general_beds", hospital.getGeneralBedsAvailable());
                hospitalInfo.put("ventilator", hospital.getVentilatorsAvailable());
                hospitalInfo.put("specialist", hospital.getSpecialistScore() != null ? hospital.getSpecialistScore() : 0);
                hospitalInfo.put("load", hospital.getHospitalLoadPercentage());
                hospitalInfo.put("distance", hospital.getDistanceKm());
                hospitalInfo.put("rating", 4.0); // Default rating - could be added to HospitalSnapshot later
            } else {
                // Fill with default values for missing hospitals
                hospitalInfo.put("hospital_id", i);
                hospitalInfo.put("icu_beds", 0);
                hospitalInfo.put("general_beds", 0);
                hospitalInfo.put("ventilator", 0);
                hospitalInfo.put("specialist", 0);
                hospitalInfo.put("load", 100.0);
                hospitalInfo.put("distance", 999.0);
                hospitalInfo.put("rating", 1.0); // Low rating for placeholder hospitals
            }
            
            hospitalData.add(hospitalInfo);
        }

        aiRequest.put("hospitals", hospitalData);
        aiRequest.put("patient_id", request.getPatientId());

        log.debug("Built AI request with {} hospitals for patient {}", hospitalData.size(), request.getPatientId());
        return aiRequest;
    }

    /**
     * Convert Python AI response to our DTO format
     */
    private List<HospitalRecommendationDTO> convertAIResponseToRecommendations(
            AIResponse aiResponse, List<HospitalSnapshot> hospitals) {
        
        List<HospitalRecommendationDTO> recommendations = new ArrayList<>();

        if (aiResponse.getRecommendations() != null) {
            log.debug("Processing {} AI recommendations from Python service", aiResponse.getRecommendations().size());
            log.info("Available hospitals for mapping: {}", 
                    hospitals.stream()
                            .map(h -> String.format("Index %d: %s (ID: %s)", 
                                    hospitals.indexOf(h),
                                    h.getHospital() != null ? h.getHospital().getName() : "Unknown",
                                    h.getHospitalId()))
                            .collect(Collectors.toList()));
            
            for (AIHospitalRecommendation aiRec : aiResponse.getRecommendations()) {
                // Map sequential hospital ID (0-4) back to actual hospital snapshot
                // Python returns hospital_id 0-4, we need to map to hospitals[0-3] (since we have 4 hospitals)
                int hospitalIndex = aiRec.getHospitalId();
                
                if (hospitalIndex >= 0 && hospitalIndex < hospitals.size()) {
                    HospitalSnapshot hospital = hospitals.get(hospitalIndex);
                    
                    log.debug("Mapped Python hospital ID {} to hospital: {}", hospitalIndex, 
                             hospital.getHospital() != null ? hospital.getHospital().getName() : "Unknown");
                    
                    HospitalRecommendationDTO recommendation = HospitalRecommendationDTO.builder()
                            .hospitalId(hospital.getHospitalId())
                            .hospitalName(hospital.getHospital() != null ? hospital.getHospital().getName() : "Hospital " + hospitalIndex)
                            .distanceKm(hospital.getDistanceKm())
                            .travelTimeMinutes(hospital.getTravelTimeMinutes())
                            .aiScore(aiRec.getAiScore())
                            .reasoning(aiRec.getReasoning())
                            .icuBedsAvailable(hospital.getIcuBedsAvailable())
                            .generalBedsAvailable(hospital.getGeneralBedsAvailable())
                            .ventilatorsAvailable(hospital.getVentilatorsAvailable())
                            .specialistAvailable(hospital.getSpecialistScore() != null && hospital.getSpecialistScore() > 0)
                            .isAcceptingTransfers(hospital.getIsAcceptingTransfers())
                            .hospitalLoadPercentage(hospital.getHospitalLoadPercentage())
                            .loadStatus(getLoadStatus(hospital.getHospitalLoadPercentage()))
                            .hasRequiredSpecialty(aiRec.getHasRequiredSpecialty())
                            .specialistCount(hospital.getSpecialistScore())
                            .hasRequiredEquipment(aiRec.getHasRequiredEquipment())
                            .isHospitalFull(hospital.isHospitalFull())
                            .criticalNoICU(aiRec.getCriticalNoICU())
                            .contactPhone(hospital.getHospital() != null ? hospital.getHospital().getContactPhone() : null)
                            .emergencyContact(hospital.getHospital() != null ? hospital.getHospital().getContactPhone() : null)
                            .build();
                    
                    recommendations.add(recommendation);
                } else {
                    log.debug("Skipping Python hospital ID {} (placeholder hospital with no real data)", hospitalIndex);
                }
            }
        }

        log.info("Converted {} AI recommendations to DTOs", recommendations.size());
        return recommendations;
    }

    /**
     * Fallback recommendations when Python AI is unavailable
     */
    private List<HospitalRecommendationDTO> getFallbackRecommendations(
            List<HospitalSnapshot> hospitals, TransferRequestDTO request) {
        
        log.info("Using fallback recommendation algorithm");
        
        return hospitals.stream()
                .filter(h -> h.getIsAcceptingTransfers())
                .map(hospital -> HospitalRecommendationDTO.builder()
                        .hospitalId(hospital.getHospitalId())
                        .hospitalName(hospital.getHospital() != null ? hospital.getHospital().getName() : "Unknown Hospital")
                        .distanceKm(hospital.getDistanceKm())
                        .travelTimeMinutes(hospital.getTravelTimeMinutes())
                        .aiScore(calculateFallbackScore(hospital, request))
                        .reasoning("Fallback algorithm - Python AI unavailable")
                        .icuBedsAvailable(hospital.getIcuBedsAvailable())
                        .generalBedsAvailable(hospital.getGeneralBedsAvailable())
                        .ventilatorsAvailable(hospital.getVentilatorsAvailable())
                        .specialistAvailable(hospital.hasSpecialtyMatch(request.getRequiredSpecialty()))
                        .isAcceptingTransfers(hospital.getIsAcceptingTransfers())
                        .hospitalLoadPercentage(hospital.getHospitalLoadPercentage())
                        .loadStatus(getLoadStatus(hospital.getHospitalLoadPercentage()))
                        .hasRequiredSpecialty(hospital.hasSpecialtyMatch(request.getRequiredSpecialty()))
                        .specialistCount(hospital.getSpecialistScore())
                        .hasRequiredEquipment(true)
                        .isHospitalFull(hospital.isHospitalFull())
                        .criticalNoICU(hospital.hasCriticalNoICU(request.getSeverityLevel()))
                        .contactPhone(hospital.getHospital() != null ? hospital.getHospital().getContactPhone() : null)
                        .emergencyContact(hospital.getHospital() != null ? hospital.getHospital().getContactPhone() : null)
                        .build())
                .sorted((a, b) -> Double.compare(b.getAiScore(), a.getAiScore()))
                .limit(5)
                .toList();
    }

    private HospitalSnapshot findHospitalByMLId(List<HospitalSnapshot> hospitals, Integer mlId) {
        log.debug("Looking for hospital with ML ID {} in {} snapshots", mlId, hospitals.size());
        
        for (HospitalSnapshot hospital : hospitals) {
            log.debug("Hospital snapshot: ID={}, ML_ID={}, Name={}", 
                     hospital.getHospitalId(), 
                     hospital.getMlHospitalId(),
                     hospital.getHospital() != null ? hospital.getHospital().getName() : "Unknown");
        }
        
        HospitalSnapshot found = hospitals.stream()
                .filter(h -> Objects.equals(h.getMlHospitalId(), mlId))
                .findFirst()
                .orElse(null);
                
        if (found != null) {
            log.debug("Found hospital for ML ID {}: {}", mlId, 
                     found.getHospital() != null ? found.getHospital().getName() : "Unknown");
        } else {
            log.debug("No hospital found for ML ID {}", mlId);
        }
        
        return found;
    }

    private int encodeConsciousness(com.healthcare.entity.enums.ConsciousnessLevel level) {
        if (level == null) return 0;
        switch (level) {
            case ALERT: return 0;
            case VOICE: return 1;
            case PAIN: return 2;
            case UNRESPONSIVE: return 3;
            default: return 0;
        }
    }

    private double calculateFallbackScore(HospitalSnapshot hospital, TransferRequestDTO request) {
        double score = 50.0;
        
        if (hospital.hasSpecialtyMatch(request.getRequiredSpecialty())) score += 20;
        if (hospital.getIcuBedsAvailable() > 0) score += 15;
        if (hospital.getHospitalLoadPercentage() < 80) score += 10;
        if (hospital.getDistanceKm() != null) score -= hospital.getDistanceKm() * 2;
        
        return Math.max(0, Math.min(100, score));
    }

    private String getLoadStatus(Double loadPercentage) {
        if (loadPercentage == null) return "Unknown";
        if (loadPercentage > 90) return "Critical";
        if (loadPercentage > 75) return "High";
        return "Normal";
    }

    // Inner classes for AI response mapping
    public static class AIResponse {
        private List<AIHospitalRecommendation> recommendations;
        private String status;
        private String message;

        // Getters and setters
        public List<AIHospitalRecommendation> getRecommendations() { return recommendations; }
        public void setRecommendations(List<AIHospitalRecommendation> recommendations) { this.recommendations = recommendations; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class AIHospitalRecommendation {
        @JsonProperty("hospital_id")
        private Integer hospitalId;
        
        @JsonProperty("ai_score")
        private Double aiScore;
        
        private String reasoning;
        
        @JsonProperty("has_required_specialty")
        private Boolean hasRequiredSpecialty;
        
        @JsonProperty("has_required_equipment")
        private Boolean hasRequiredEquipment;
        
        @JsonProperty("critical_no_icu")
        private Boolean criticalNoICU;

        // Getters and setters
        public Integer getHospitalId() { return hospitalId; }
        public void setHospitalId(Integer hospitalId) { this.hospitalId = hospitalId; }
        public Double getAiScore() { return aiScore; }
        public void setAiScore(Double aiScore) { this.aiScore = aiScore; }
        public String getReasoning() { return reasoning; }
        public void setReasoning(String reasoning) { this.reasoning = reasoning; }
        public Boolean getHasRequiredSpecialty() { return hasRequiredSpecialty; }
        public void setHasRequiredSpecialty(Boolean hasRequiredSpecialty) { this.hasRequiredSpecialty = hasRequiredSpecialty; }
        public Boolean getHasRequiredEquipment() { return hasRequiredEquipment; }
        public void setHasRequiredEquipment(Boolean hasRequiredEquipment) { this.hasRequiredEquipment = hasRequiredEquipment; }
        public Boolean getCriticalNoICU() { return criticalNoICU; }
        public void setCriticalNoICU(Boolean criticalNoICU) { this.criticalNoICU = criticalNoICU; }
    }
}