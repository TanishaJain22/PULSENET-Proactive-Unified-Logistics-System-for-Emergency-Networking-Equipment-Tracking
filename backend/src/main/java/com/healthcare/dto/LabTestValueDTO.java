package com.healthcare.dto;

import lombok.Data;

@Data
public class LabTestValueDTO {
    private String testName;
    private String value;
    private String unit;
    private String referenceRange;
    private String status; // normal, high, low, critical
    private String interpretation;
}