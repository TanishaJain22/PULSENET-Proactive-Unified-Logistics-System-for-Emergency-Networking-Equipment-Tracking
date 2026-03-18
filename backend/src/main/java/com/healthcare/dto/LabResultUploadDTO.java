package com.healthcare.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LabResultUploadDTO {
    private String title;
    private String description;
    private String testName;
    private String orderingPhysician;
    private String performingLab;
    private LocalDateTime testDate;
    private LocalDateTime reportDate;
    private MultipartFile file;
    private List<LabTestValueDTO> testValues;
}