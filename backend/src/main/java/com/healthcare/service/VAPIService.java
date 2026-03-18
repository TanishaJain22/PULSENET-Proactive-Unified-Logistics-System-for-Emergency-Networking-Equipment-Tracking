package com.healthcare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.entity.mime.MultipartEntityBuilder;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class VAPIService {

    @Value("${vapi.private.key}")
    private String vapiPrivateKey;

    @Value("${vapi.public.key}")
    private String vapiPublicKey;

    private static final String VAPI_BASE_URL = "https://api.vapi.ai";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> processVoiceInput(byte[] audioData, Long userId) throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            
            // Step 1: Transcribe audio
            String transcription = transcribeAudio(httpClient, audioData);
            
            // Step 2: Generate AI response
            String aiResponse = generateHealthResponse(httpClient, transcription, userId);
            
            // Step 3: Create voice session
            String sessionId = UUID.randomUUID().toString();
            
            Map<String, Object> result = new HashMap<>();
            result.put("session_id", sessionId);
            result.put("transcription", transcription);
            result.put("ai_response", aiResponse);
            result.put("audio_url", null); // Will be set when audio is saved
            result.put("duration_seconds", estimateAudioDuration(audioData));
            
            return result;
            
        } catch (Exception e) {
            throw new IOException("Failed to process voice input with VAPI", e);
        }
    }

    public String createVoiceAssistant(String healthContext) throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            
            HttpPost request = new HttpPost(VAPI_BASE_URL + "/assistant");
            request.setHeader("Authorization", "Bearer " + vapiPrivateKey);
            request.setHeader("Content-Type", "application/json");
            
            Map<String, Object> assistantConfig = new HashMap<>();
            assistantConfig.put("name", "PulseNet Health Assistant");
            assistantConfig.put("model", createHealthModel(healthContext));
            assistantConfig.put("voice", createVoiceConfig());
            assistantConfig.put("firstMessage", "Hello! I'm your AI health assistant. How can I help you today?");
            
            String jsonBody = objectMapper.writeValueAsString(assistantConfig);
            request.setEntity(new StringEntity(jsonBody, ContentType.APPLICATION_JSON));
            
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                String responseBody = EntityUtils.toString(response.getEntity());
                JsonNode jsonResponse = objectMapper.readTree(responseBody);
                return jsonResponse.get("id").asText();
            }
            
        } catch (Exception e) {
            throw new IOException("Failed to create VAPI assistant", e);
        }
    }

    public Map<String, Object> startVoiceCall(String assistantId, String phoneNumber) throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            
            HttpPost request = new HttpPost(VAPI_BASE_URL + "/call");
            request.setHeader("Authorization", "Bearer " + vapiPrivateKey);
            request.setHeader("Content-Type", "application/json");
            
            Map<String, Object> callConfig = new HashMap<>();
            callConfig.put("assistantId", assistantId);
            callConfig.put("customer", Map.of("number", phoneNumber));
            callConfig.put("phoneNumberId", vapiPublicKey);
            
            String jsonBody = objectMapper.writeValueAsString(callConfig);
            request.setEntity(new StringEntity(jsonBody, ContentType.APPLICATION_JSON));
            
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                String responseBody = EntityUtils.toString(response.getEntity());
                return objectMapper.readValue(responseBody, Map.class);
            }
            
        } catch (Exception e) {
            throw new IOException("Failed to start VAPI call", e);
        }
    }

    private String transcribeAudio(CloseableHttpClient httpClient, byte[] audioData) throws IOException {
        // For now, simulate transcription - VAPI handles this automatically in real calls
        // In production, this would use VAPI's transcription service
        return simulateTranscription(audioData);
    }

    private String generateHealthResponse(CloseableHttpClient httpClient, String transcription, Long userId) throws IOException {
        // Create a health-focused AI response
        // In production, this would use VAPI's AI model with health context
        return generateHealthAIResponse(transcription);
    }

    private Map<String, Object> createHealthModel(String healthContext) {
        Map<String, Object> model = new HashMap<>();
        model.put("provider", "openai");
        model.put("model", "gpt-4");
        model.put("temperature", 0.7);
        model.put("systemMessage", createHealthSystemMessage(healthContext));
        model.put("maxTokens", 500);
        
        return model;
    }

    private Map<String, Object> createVoiceConfig() {
        Map<String, Object> voice = new HashMap<>();
        voice.put("provider", "11labs");
        voice.put("voiceId", "21m00Tcm4TlvDq8ikWAM"); // Professional female voice
        voice.put("stability", 0.5);
        voice.put("similarityBoost", 0.75);
        
        return voice;
    }

    private String createHealthSystemMessage(String healthContext) {
        return String.format("""
            You are a professional AI health assistant for PulseNet Healthcare Platform.
            
            Your role:
            - Provide helpful health information and guidance
            - Listen to patient concerns with empathy
            - Offer general health advice and wellness tips
            - Guide users to appropriate medical resources
            - NEVER provide specific medical diagnoses
            - ALWAYS recommend consulting healthcare professionals for medical concerns
            
            Patient Context: %s
            
            Guidelines:
            - Be warm, professional, and empathetic
            - Keep responses concise but informative
            - Ask clarifying questions when needed
            - Prioritize patient safety and well-being
            - Encourage preventive care and healthy lifestyle choices
            - If symptoms sound serious, recommend immediate medical attention
            
            Remember: You are an assistant, not a replacement for professional medical care.
            """, healthContext != null ? healthContext : "General health consultation");
    }

    private String simulateTranscription(byte[] audioData) {
        // Simulate realistic health-related transcriptions
        String[] sampleTranscriptions = {
            "I've been having headaches for the past few days and I'm feeling tired",
            "My throat is sore and I have a slight cough",
            "I'm experiencing some chest discomfort and shortness of breath",
            "I have a rash on my arm that appeared yesterday",
            "I've been having trouble sleeping and feeling anxious",
            "My blood pressure readings have been higher than usual",
            "I'm having digestive issues and stomach pain"
        };
        
        // In production, this would be actual transcription
        int index = (int) (Math.random() * sampleTranscriptions.length);
        return sampleTranscriptions[index];
    }

    private String generateHealthAIResponse(String transcription) {
        // Generate contextual health responses based on transcription
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("headache", "I understand you're experiencing headaches and fatigue. These symptoms can have various causes including stress, dehydration, or sleep issues. I recommend staying hydrated, getting adequate rest, and if symptoms persist or worsen, please consult with a healthcare provider.");
        responseMap.put("throat", "A sore throat and cough can be signs of a viral infection or other respiratory condition. Try warm liquids, throat lozenges, and rest. If symptoms persist for more than a few days or you develop fever, please see a doctor.");
        responseMap.put("chest", "Chest discomfort and shortness of breath are symptoms that should be taken seriously. I strongly recommend seeking immediate medical attention, especially if these symptoms are new or worsening.");
        responseMap.put("rash", "New skin rashes can have many causes including allergies, infections, or other conditions. I recommend having it examined by a healthcare provider, especially if it's spreading or accompanied by other symptoms.");
        responseMap.put("sleep", "Sleep troubles and anxiety often go hand in hand. Consider relaxation techniques, maintaining a regular sleep schedule, and limiting screen time before bed. If these issues persist, a healthcare provider can help identify underlying causes.");
        responseMap.put("pressure", "Higher than usual blood pressure readings are important to monitor. Please continue tracking your readings and share them with your healthcare provider. Consider lifestyle factors like diet, exercise, and stress management.");
        responseMap.put("digestive", "Digestive issues and stomach pain can be uncomfortable. Consider your recent diet, stress levels, and hydration. If pain is severe or persistent, or if you have other concerning symptoms, please consult a healthcare provider.");
        
        // Find the most relevant response
        String lowerTranscription = transcription.toLowerCase();
        for (Map.Entry<String, String> entry : responseMap.entrySet()) {
            if (lowerTranscription.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        // Default response
        return "Thank you for sharing your health concerns with me. While I can provide general information, I recommend discussing your specific symptoms with a qualified healthcare provider who can properly evaluate your condition and provide personalized medical advice.";
    }

    private int estimateAudioDuration(byte[] audioData) {
        // Rough estimation - in production, use proper audio analysis
        return Math.max(5, audioData.length / 16000); // Assume 16kHz sample rate
    }
}