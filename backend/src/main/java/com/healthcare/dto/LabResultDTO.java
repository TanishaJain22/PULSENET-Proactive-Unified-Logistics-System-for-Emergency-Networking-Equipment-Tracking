package com.healthcare.dto;

import com.healthcare.entity.enums.DocumentStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class LabResultDTO {
    private UUID id;
    private String title;
    private String description;
    private DocumentStatus status;
    private String fileName;
    private String mimeType;
    private String formattedFileSize;
    private String testName;
    private String results;
    private String interpretation;
    private String referenceRanges;
    private Boolean isAbnormal;
    private Boolean isCritical;
    private String orderingPhysician;
    private String performingLab;
    private LocalDateTime testDate;
    private LocalDateTime reportDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean requiresAttention;
    private String downloadUrl;
    private List<LabTestValueDTO> testValues;
}