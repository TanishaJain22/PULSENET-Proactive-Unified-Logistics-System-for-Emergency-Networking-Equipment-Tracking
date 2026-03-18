package com.healthcare.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.healthcare.service.AIHealthService;
import com.healthcare.service.GovernmentSchemeChatService;
import com.healthcare.service.EnhancedGovernmentSchemeService;
import com.healthcare.service.GeminiAIService;
import com.healthcare.dto.AIAnalysisResultDTO;
import com.healthcare.dto.SymptomAnalysisDTO;
import com.healthcare.dto.VoiceAnalysisDTO;
import com.healthcare.dto.GovernmentSchemeChatRequest;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai-health")
@CrossOrigin(origins = "*")
public class AIHealthController {

    @Autowired
    private AIHealthService aiHealthService;

    @Autowired
    private GovernmentSchemeChatService governmentSchemeChatService;

    @Autowired
    private EnhancedGovernmentSchemeService enhancedGovernmentSchemeService;

    @Autowired
    private GeminiAIService geminiAIService;

    // Simple test endpoint to verify controller is working
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("AI Health Controller is working!");
    }

    @GetMapping("/test-government-service")
    public ResponseEntity<String> testGovernmentService() {
        try {
            if (governmentSchemeChatService != null) {
                return ResponseEntity.ok("Government Scheme Chat Service is available!");
            } else {
                return ResponseEntity.ok("Government Scheme Chat Service is NULL!");
            }
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }

    @PostMapping("/analyze-image")
    public ResponseEntity<AIAnalysisResultDTO> analyzeImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "specialty", defaultValue = "chest") String specialty,
            @RequestParam(value = "model_type", defaultValue = "base") String modelType) {
        try {
            AIAnalysisResultDTO result = aiHealthService.analyzeImage(image, userId, specialty, modelType);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Add logging to see the actual error
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/analyze-symptoms")
    public ResponseEntity<SymptomAnalysisDTO> analyzeSymptoms(
            @RequestBody SymptomAnalysisDTO request) {
        try {
            SymptomAnalysisDTO result = aiHealthService.analyzeSymptoms(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Add logging to see the actual error
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/voice-analysis")
    public ResponseEntity<VoiceAnalysisDTO> analyzeVoice(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam("userId") Long userId) {
        try {
            VoiceAnalysisDTO result = aiHealthService.analyzeVoice(audio, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Add logging to see the actual error
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/analysis-history/{userId}")
    public ResponseEntity<?> getAnalysisHistory(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(aiHealthService.getAnalysisHistory(userId));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging to see the actual error
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/test-gemini")
    public ResponseEntity<String> testGemini() {
        try {
            String testResponse = geminiAIService.generateResponse("Hello, please respond with 'Gemini API is working correctly!'");
            return ResponseEntity.ok("Gemini Test Response: " + testResponse);
        } catch (Exception e) {
            return ResponseEntity.ok("Gemini Test Error: " + e.getMessage());
        }
    }

    @GetMapping("/test-long-response")
    public ResponseEntity<String> testLongResponse() {
        try {
            String testPrompt = "Please provide a very detailed, comprehensive explanation about the Ayushman Bharat scheme including all benefits, eligibility criteria, application process, required documents, and contact information. Make sure to provide a complete response with at least 500 words.";
            String response = geminiAIService.generateResponse(testPrompt);
            return ResponseEntity.ok("Response length: " + response.length() + " characters. Response: " + response);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }

    @PostMapping("/government-scheme-chat")
    public ResponseEntity<Map<String, Object>> governmentSchemeChat(@RequestBody GovernmentSchemeChatRequest request) {
        try {
            Map<String, Object> result = governmentSchemeChatService.processGovernmentSchemeQuery(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Add logging to see the actual error
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/enhanced-scheme-chat")
    public ResponseEntity<Map<String, Object>> enhancedSchemeChat(@RequestBody Map<String, String> request) {
        try {
            String userQuery = request.get("message");
            String language = request.getOrDefault("language", "en");
            
            Map<String, Object> result = enhancedGovernmentSchemeService.processSchemeQuery(userQuery, language);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error processing scheme query: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}