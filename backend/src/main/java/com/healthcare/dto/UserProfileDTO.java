package com.healthcare.dto;

/**
 * Structured user profile for accurate scheme eligibility checking
 * No more guessing - everything is structured data!
 */
public class UserProfileDTO {
    private Long userId;
    private String name;
    private Integer age;
    private String gender; // MALE, FEMALE, OTHER
    private String state;
    private String district;
    private Boolean isRural;
    private Integer annualIncome;
    private String category; // BPL, APL, STUDENT, SENIOR_CITIZEN, DISABLED
    private String caste; // GENERAL, OBC, SC, ST
    private String occupation;
    private String medicalNeed; // EMERGENCY, SURGERY, MATERNITY, REGULAR_CHECKUP
    private Boolean hasExistingInsurance;
    private String familySize;
    
    // Constructors
    public UserProfileDTO() {}
    
    public UserProfileDTO(Long userId, String name, Integer age, String gender, String state, 
                         Boolean isRural, Integer annualIncome, String category) {
        this.userId = userId;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.state = state;
        this.isRural = isRural;
        this.annualIncome = annualIncome;
        this.category = category;
    }
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    
    public Boolean getIsRural() { return isRural; }
    public void setIsRural(Boolean isRural) { this.isRural = isRural; }
    
    public Integer getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(Integer annualIncome) { this.annualIncome = annualIncome; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getCaste() { return caste; }
    public void setCaste(String caste) { this.caste = caste; }
    
    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }
    
    public String getMedicalNeed() { return medicalNeed; }
    public void setMedicalNeed(String medicalNeed) { this.medicalNeed = medicalNeed; }
    
    public Boolean getHasExistingInsurance() { return hasExistingInsurance; }
    public void setHasExistingInsurance(Boolean hasExistingInsurance) { this.hasExistingInsurance = hasExistingInsurance; }
    
    public String getFamilySize() { return familySize; }
    public void setFamilySize(String familySize) { this.familySize = familySize; }
}