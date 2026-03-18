package com.healthcare.dto;

import java.util.List;

public class GovernmentSchemeChatRequest {
    private String message;
    private String language;
    private List<GovernmentSchemeDTO> schemes;

    // Constructors
    public GovernmentSchemeChatRequest() {}

    public GovernmentSchemeChatRequest(String message, String language, List<GovernmentSchemeDTO> schemes) {
        this.message = message;
        this.language = language;
        this.schemes = schemes;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public List<GovernmentSchemeDTO> getSchemes() {
        return schemes;
    }

    public void setSchemes(List<GovernmentSchemeDTO> schemes) {
        this.schemes = schemes;
    }
}