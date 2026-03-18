package com.healthcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;

@Service
public class GeminiAIService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    private RestTemplate restTemplate;
    private HttpHeaders headers;
    
    @PostConstruct
    public void init() {
        // Configure RestTemplate for faster performance
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds connection timeout
        factory.setConnectionRequestTimeout(15000);   // 15 seconds read timeout
        
        this.restTemplate = new RestTemplate(factory);
        
        // Pre-configure headers to avoid recreation
        this.headers = new HttpHeaders();
        this.headers.set("Content-Type", "application/json");
        this.headers.set("User-Agent", "PulseNet-HealthBot/1.0");
    }
    
    public String generateResponse(String prompt) {
        try {
            long startTime = System.currentTimeMillis();
            logger.info("Starting Gemini API call for prompt length: {}", prompt.length());
            
            // Optimize prompt for faster response
            String optimizedPrompt = optimizePrompt(prompt);
            
            // Prepare optimized request body
            Map<String, Object> requestBody = createOptimizedRequestBody(optimizedPrompt);
            
            // Create HTTP entity with pre-configured headers
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make API call with pre-built URL
            String urlWithKey = apiUrl + "?key=" + apiKey;
            
            ResponseEntity<Map> response = restTemplate.exchange(
                urlWithKey, 
                HttpMethod.POST, 
                entity, 
                Map.class
            );
            
            long responseTime = System.currentTimeMillis() - startTime;
            logger.info("Gemini API response received in {}ms", responseTime);
            
            // Fast response extraction
            String result = extractResponseText(response.getBody());
            
            logger.info("Total processing time: {}ms", System.currentTimeMillis() - startTime);
            return result;
            
        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage());
            return getFallbackResponse();
        }
    }
    
    private String optimizePrompt(String originalPrompt) {
        // Add optimization instructions for comprehensive response
        StringBuilder optimized = new StringBuilder();
        optimized.append("Please provide a detailed, comprehensive answer. ");
        optimized.append("Include all relevant information and practical guidance. ");
        optimized.append("Structure your response clearly with key points. ");
        optimized.append("Provide actionable steps and helpful details. ");
        optimized.append("\n\nUser Question: ").append(originalPrompt);
        
        return optimized.toString();
    }
    
    private Map<String, Object> createOptimizedRequestBody(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // Create contents array
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        parts.add(part);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        // Add generation config for comprehensive, detailed responses
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("topK", 40);
        generationConfig.put("topP", 0.9);
        generationConfig.put("maxOutputTokens", 4000); // Allow much longer responses for comprehensive government scheme information
        generationConfig.put("stopSequences", new String[]{});
        
        requestBody.put("generationConfig", generationConfig);
        
        // Add safety settings for faster processing
        List<Map<String, Object>> safetySettings = new ArrayList<>();
        String[] categories = {
            "HARM_CATEGORY_HARASSMENT",
            "HARM_CATEGORY_HATE_SPEECH", 
            "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "HARM_CATEGORY_DANGEROUS_CONTENT"
        };
        
        for (String category : categories) {
            Map<String, Object> setting = new HashMap<>();
            setting.put("category", category);
            setting.put("threshold", "BLOCK_MEDIUM_AND_ABOVE");
            safetySettings.add(setting);
        }
        
        requestBody.put("safetySettings", safetySettings);
        
        return requestBody;
    }
    
    private String extractResponseText(Map<String, Object> responseBody) {
        if (responseBody == null) {
            return getFallbackResponse();
        }
        
        // Check for error first
        if (responseBody.containsKey("error")) {
            Map<String, Object> error = (Map<String, Object>) responseBody.get("error");
            logger.error("Gemini API error: {}", error.get("message"));
            return "I apologize, but there was an API error. Please try again.";
        }
        
        // Fast path for response extraction
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> contentObj = (Map<String, Object>) candidate.get("content");
                List<Map<String, Object>> partsObj = (List<Map<String, Object>>) contentObj.get("parts");
                
                if (partsObj != null && !partsObj.isEmpty()) {
                    String responseText = (String) partsObj.get(0).get("text");
                    return responseText != null ? responseText.trim() : getFallbackResponse();
                }
            }
        } catch (Exception e) {
            logger.error("Error extracting response: {}", e.getMessage());
        }
        
        return getFallbackResponse();
    }
    
    private String getFallbackResponse() {
        return "I apologize, but I'm having trouble processing your request right now. Please try again or contact support.";
    }
    
    // Async method for non-blocking calls (optional)
    public CompletableFuture<String> generateResponseAsync(String prompt) {
        return CompletableFuture.supplyAsync(() -> generateResponse(prompt));
    }
}