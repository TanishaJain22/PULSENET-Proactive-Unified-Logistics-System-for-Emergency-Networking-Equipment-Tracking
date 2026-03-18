package com.healthcare.entity.enums;

public enum ResourceType {
    // Main Categories (used by frontend)
    EQUIPMENT,
    SUPPLY,
    STAFF,
    
    // Specific Equipment Types
    MEDICAL_EQUIPMENT,
    ICU_BED,
    GENERAL_BED,
    EMERGENCY_BED,
    OPERATING_ROOM,
    VENTILATOR,
    DEFIBRILLATOR,
    DIALYSIS_MACHINE,
    CT_SCANNER,
    MRI_MACHINE,
    X_RAY_MACHINE,
    ULTRASOUND,
    
    // Specific Supply Types
    MEDICAL_SUPPLY,
    PHARMACEUTICAL,
    BLOOD_PRODUCT,
    SURGICAL_INSTRUMENT,
    
    // Specific Staff Types
    NURSING_STAFF,
    SUPPORT_STAFF,
    TECHNICIAN,
    
    // Other Resources
    AMBULANCE,
    WHEELCHAIR,
    OXYGEN_SUPPLY,
    OTHER
}