package com.healthcare.service;

import com.healthcare.dto.GovernmentSchemeChatRequest;
import com.healthcare.dto.GovernmentSchemeDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class GovernmentSchemeChatService {
    
    private static final Logger logger = LoggerFactory.getLogger(GovernmentSchemeChatService.class);
    
    @Autowired
    private GeminiAIService geminiAIService;
    
    public Map<String, Object> processGovernmentSchemeQuery(GovernmentSchemeChatRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long startTime = System.currentTimeMillis();
            
            String prompt = buildOptimizedPrompt(request);
            String aiResponse = geminiAIService.generateResponse(prompt);
            
            long processingTime = System.currentTimeMillis() - startTime;
            logger.info("Government scheme query processed in {}ms", processingTime);
            
            response.put("success", true);
            response.put("response", aiResponse);
            response.put("language", request.getLanguage());
            response.put("processingTime", processingTime);
            
        } catch (Exception e) {
            logger.error("Error processing government scheme query: ", e);
            response.put("success", false);
            response.put("response", getErrorMessage(request.getLanguage()));
        }
        
        return response;
    }
    
    private String buildOptimizedPrompt(GovernmentSchemeChatRequest request) {
        StringBuilder prompt = new StringBuilder();
        
        // Add language-specific optimization instructions for comprehensive responses
        if ("hi".equals(request.getLanguage())) {
            prompt.append("आप एक विशेषज्ञ सरकारी स्वास्थ्य योजना सहायक हैं। ");
            prompt.append("आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY) के बारे में विस्तृत, व्यापक और उपयोगी जानकारी प्रदान करें। ");
            prompt.append("कृपया अपना उत्तर पूरा करें और सभी महत्वपूर्ण बिंदुओं को शामिल करें। ");
            prompt.append("आवेदन प्रक्रिया, पात्रता, लाभ, और संपर्क विवरण दें। ");
            prompt.append("अपना उत्तर बीच में न छोड़ें। ");
        } else {
            prompt.append("As an expert Government Health Scheme Assistant, I am here to provide you with detailed, comprehensive, and helpful information regarding the Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY) and other government health schemes. ");
            prompt.append("Please provide complete responses with all important points and practical guidance. ");
            prompt.append("Cover application process, eligibility, benefits, and contact details thoroughly. ");
            prompt.append("Do not truncate your response - provide the full answer. ");
        }
        
        // Add comprehensive scheme information
        prompt.append("Available schemes:\n");
        
        for (GovernmentSchemeDTO scheme : request.getSchemes()) {
            if ("hi".equals(request.getLanguage())) {
                prompt.append("• ").append(scheme.getNameHindi()).append(":\n");
                prompt.append("  विवरण: ").append(scheme.getDescriptionHindi()).append("\n");
                prompt.append("  पात्रता: ").append(scheme.getEligibility()).append("\n");
                prompt.append("  लाभ: ").append(scheme.getBenefits()).append("\n");
                prompt.append("  हेल्पलाइन: ").append(scheme.getHelpline()).append("\n");
                prompt.append("  वेबसाइट: ").append(scheme.getWebsite()).append("\n\n");
            } else {
                prompt.append("• ").append(scheme.getName()).append(":\n");
                prompt.append("  Description: ").append(scheme.getDescription()).append("\n");
                prompt.append("  Eligibility: ").append(scheme.getEligibility()).append("\n");
                prompt.append("  Benefits: ").append(scheme.getBenefits()).append("\n");
                prompt.append("  Helpline: ").append(scheme.getHelpline()).append("\n");
                prompt.append("  Website: ").append(scheme.getWebsite()).append("\n\n");
            }
        }
        
        prompt.append("User Question: ").append(request.getMessage()).append("\n\n");
        
        if ("hi".equals(request.getLanguage())) {
            prompt.append("कृपया विस्तृत, व्यापक उत्तर दें जिसमें शामिल हो:\n");
            prompt.append("1. मुख्य जानकारी और लाभ\n");
            prompt.append("2. पात्रता मानदंड\n");
            prompt.append("3. आवेदन प्रक्रिया के चरण\n");
            prompt.append("4. आवश्यक दस्तावेज\n");
            prompt.append("5. संपर्क विवरण और हेल्पलाइन\n");
            prompt.append("6. उपयोगी टिप्स और सुझाव\n");
            prompt.append("\nकृपया अपना उत्तर पूरा करें और बीच में न छोड़ें।");
        } else {
            prompt.append("Please provide a detailed, comprehensive answer that includes:\n");
            prompt.append("1. Key information and benefits\n");
            prompt.append("2. Eligibility criteria\n");
            prompt.append("3. Step-by-step application process\n");
            prompt.append("4. Required documents\n");
            prompt.append("5. Contact details and helplines\n");
            prompt.append("6. Helpful tips and suggestions\n");
            prompt.append("\nPlease ensure your response is complete and not truncated. Provide the full answer with all details.");
        }
        
        return prompt.toString();
    }
    
    private String getErrorMessage(String language) {
        if ("hi".equals(language)) {
            return "क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें या हेल्पलाइन नंबर पर कॉल करें।";
        } else {
            return "I apologize, but I encountered an error. Please try again or call the helpline number.";
        }
    }
}