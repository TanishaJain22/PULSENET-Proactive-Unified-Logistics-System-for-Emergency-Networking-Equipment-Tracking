package com.healthcare.dto;

import java.util.List;

public class GovernmentSchemeDTO {
    private String id;
    private String name;
    private String nameHindi;
    private String description;
    private String descriptionHindi;
    private List<String> eligibility;
    private List<String> eligibilityHindi;
    private List<String> benefits;
    private List<String> benefitsHindi;
    private List<String> applicationProcess;
    private List<String> applicationProcessHindi;
    private List<String> documents;
    private List<String> documentsHindi;
    private String website;
    private String helpline;
    private String category;
    private String coverage;
    private String coverageHindi;

    // Constructors
    public GovernmentSchemeDTO() {}

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNameHindi() {
        return nameHindi;
    }

    public void setNameHindi(String nameHindi) {
        this.nameHindi = nameHindi;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescriptionHindi() {
        return descriptionHindi;
    }

    public void setDescriptionHindi(String descriptionHindi) {
        this.descriptionHindi = descriptionHindi;
    }

    public List<String> getEligibility() {
        return eligibility;
    }

    public void setEligibility(List<String> eligibility) {
        this.eligibility = eligibility;
    }

    public List<String> getEligibilityHindi() {
        return eligibilityHindi;
    }

    public void setEligibilityHindi(List<String> eligibilityHindi) {
        this.eligibilityHindi = eligibilityHindi;
    }

    public List<String> getBenefits() {
        return benefits;
    }

    public void setBenefits(List<String> benefits) {
        this.benefits = benefits;
    }

    public List<String> getBenefitsHindi() {
        return benefitsHindi;
    }

    public void setBenefitsHindi(List<String> benefitsHindi) {
        this.benefitsHindi = benefitsHindi;
    }

    public List<String> getApplicationProcess() {
        return applicationProcess;
    }

    public void setApplicationProcess(List<String> applicationProcess) {
        this.applicationProcess = applicationProcess;
    }

    public List<String> getApplicationProcessHindi() {
        return applicationProcessHindi;
    }

    public void setApplicationProcessHindi(List<String> applicationProcessHindi) {
        this.applicationProcessHindi = applicationProcessHindi;
    }

    public List<String> getDocuments() {
        return documents;
    }

    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }

    public List<String> getDocumentsHindi() {
        return documentsHindi;
    }

    public void setDocumentsHindi(List<String> documentsHindi) {
        this.documentsHindi = documentsHindi;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getHelpline() {
        return helpline;
    }

    public void setHelpline(String helpline) {
        this.helpline = helpline;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCoverage() {
        return coverage;
    }

    public void setCoverage(String coverage) {
        this.coverage = coverage;
    }

    public String getCoverageHindi() {
        return coverageHindi;
    }

    public void setCoverageHindi(String coverageHindi) {
        this.coverageHindi = coverageHindi;
    }
}