package com.healthcare.dto;

import java.util.List;

/**
 * Structured result for scheme eligibility - no ambiguity!
 */
public class SchemeEligibilityResult {
    private String schemeId;
    private String schemeName;
    private String eligibilityStatus; // ELIGIBLE, NOT_ELIGIBLE, PARTIALLY_ELIGIBLE
    private String coverage;
    private String description;
    private Integer eligibilityScore; // 0-100 confidence score
    private List<String> benefits;
    private String applicationProcess;
    private String recommendationReason;
    private String helplineNumber;
    private String websiteUrl;
    private List<String> requiredDocuments;
    private String estimatedProcessingTime;
    
    // Constructors
    public SchemeEligibilityResult() {}
    
    // Getters and Setters
    public String getSchemeId() { return schemeId; }
    public void setSchemeId(String schemeId) { this.schemeId = schemeId; }
    
    public String getSchemeName() { return schemeName; }
    public void setSchemeName(String schemeName) { this.schemeName = schemeName; }
    
    public String getEligibilityStatus() { return eligibilityStatus; }
    public void setEligibilityStatus(String eligibilityStatus) { this.eligibilityStatus = eligibilityStatus; }
    
    public String getCoverage() { return coverage; }
    public void setCoverage(String coverage) { this.coverage = coverage; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getEligibilityScore() { return eligibilityScore; }
    public void setEligibilityScore(Integer eligibilityScore) { this.eligibilityScore = eligibilityScore; }
    
    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }
    
    public String getApplicationProcess() { return applicationProcess; }
    public void setApplicationProcess(String applicationProcess) { this.applicationProcess = applicationProcess; }
    
    public String getRecommendationReason() { return recommendationReason; }
    public void setRecommendationReason(String recommendationReason) { this.recommendationReason = recommendationReason; }
    
    public String getHelplineNumber() { return helplineNumber; }
    public void setHelplineNumber(String helplineNumber) { this.helplineNumber = helplineNumber; }
    
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    
    public List<String> getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(List<String> requiredDocuments) { this.requiredDocuments = requiredDocuments; }
    
    public String getEstimatedProcessingTime() { return estimatedProcessingTime; }
    public void setEstimatedProcessingTime(String estimatedProcessingTime) { this.estimatedProcessingTime = estimatedProcessingTime; }
}