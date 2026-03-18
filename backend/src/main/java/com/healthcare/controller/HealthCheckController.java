package com.healthcare.controller;

import com.healthcare.service.VertexAIService;
import com.healthcare.service.CloudStorageService;
import com.healthcare.service.MLModelMappingService;
import com.healthcare.service.PythonAIService;
import com.healthcare.repository.HospitalRepository;
import com.healthcare.entity.Hospital;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/health-check")
@CrossOrigin(origins = "*")
public class HealthCheckController {

    @Autowired
    private CloudStorageService cloudStorageService;
    
    @Autowired
    private MLModelMappingService mlModelMappingService;
    
    @Autowired
    private HospitalRepository hospitalRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${ai.python.base-url:http://127.0.0.1:8000}")
    private String pythonAIBaseUrl;
    
    @Value("${ai.python.enabled:true}")
    private boolean aiEnabled;
    
    @Value("${ai.python.timeout:5000}")
    private int timeoutMs;

    @GetMapping("/ai-services")
    public ResponseEntity<Map<String, Object>> checkAIServices() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            // Check Google Cloud Storage
            boolean gcsAvailable = cloudStorageService.isCloudStorageAvailable();
            status.put("google_cloud_storage", gcsAvailable ? "ONLINE" : "OFFLINE");
            
            // Check Vertex AI (basic connectivity)
            status.put("vertex_ai", "CONFIGURED");
            
            // Check VAPI
            status.put("vapi", "CONFIGURED");
            
            // Overall status
            status.put("overall_status", gcsAvailable ? "HEALTHY" : "DEGRADED");
            status.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            status.put("error", e.getMessage());
            status.put("overall_status", "ERROR");
            return ResponseEntity.status(500).body(status);
        }
    }
    
    @GetMapping("/ml-mappings")
    public ResponseEntity<Map<String, Object>> checkMLMappings() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            status.put("cache_size", mlModelMappingService.getCacheSize());
            status.put("is_valid_mapping", mlModelMappingService.isValidMapping());
            status.put("hospital_mappings", mlModelMappingService.getHospitalMappings());
            status.put("specialty_encodings", mlModelMappingService.getSpecialtyEncodingMap());
            status.put("traffic_encodings", mlModelMappingService.getTrafficEncodingMap());
            status.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            status.put("error", e.getMessage());
            return ResponseEntity.status(500).body(status);
        }
    }
    
    @PostMapping("/ml-mappings/refresh")
    public ResponseEntity<Map<String, Object>> refreshMLMappings() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            mlModelMappingService.refreshHospitalMapping();
            
            result.put("success", true);
            result.put("message", "ML mappings refreshed successfully");
            result.put("cache_size", mlModelMappingService.getCacheSize());
            result.put("is_valid_mapping", mlModelMappingService.isValidMapping());
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @GetMapping("/ai-recommendations-debug")
    public ResponseEntity<Map<String, Object>> debugAIRecommendations() {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            // Check Python AI service connectivity
            String aiUrl = pythonAIBaseUrl + "/health";
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(aiUrl, String.class);
                debug.put("python_ai_status", "REACHABLE");
                debug.put("python_ai_response", response.getBody());
                debug.put("python_ai_status_code", response.getStatusCode().value());
            } catch (Exception e) {
                debug.put("python_ai_status", "UNREACHABLE");
                debug.put("python_ai_error", e.getMessage());
            }
            
            // Check hospital data availability
            var hospitals = hospitalRepository.findAll();
            debug.put("total_hospitals", hospitals.size());
            debug.put("hospital_names", hospitals.stream()
                    .map(Hospital::getName)
                    .collect(Collectors.toList()));
            
            // Check ML mappings
            debug.put("ml_cache_size", mlModelMappingService.getCacheSize());
            debug.put("ml_mappings_valid", mlModelMappingService.isValidMapping());
            debug.put("ml_mappings", mlModelMappingService.getHospitalMappings());
            
            // Check configuration
            debug.put("ai_enabled", aiEnabled);
            debug.put("ai_base_url", pythonAIBaseUrl);
            debug.put("ai_timeout", timeoutMs);
            
            // Overall diagnosis
            String diagnosis = "UNKNOWN";
            if (!aiEnabled) {
                diagnosis = "AI_DISABLED";
            } else if (debug.get("python_ai_status").equals("UNREACHABLE")) {
                diagnosis = "PYTHON_AI_UNREACHABLE";
            } else if ((Integer) debug.get("total_hospitals") == 0) {
                diagnosis = "NO_HOSPITAL_DATA";
            } else if (!(Boolean) debug.get("ml_mappings_valid")) {
                diagnosis = "ML_MAPPINGS_INVALID";
            } else {
                diagnosis = "HEALTHY";
            }
            
            debug.put("diagnosis", diagnosis);
            debug.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(debug);
            
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            debug.put("diagnosis", "SYSTEM_ERROR");
            return ResponseEntity.status(500).body(debug);
        }
    }
}