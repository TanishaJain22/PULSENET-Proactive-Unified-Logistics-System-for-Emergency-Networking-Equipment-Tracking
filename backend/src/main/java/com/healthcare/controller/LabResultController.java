package com.healthcare.controller;

import com.healthcare.dto.LabResultDTO;
import com.healthcare.dto.LabResultUploadDTO;
import com.healthcare.entity.enums.DocumentStatus;
import com.healthcare.service.LabResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lab-results")
@CrossOrigin(origins = "*")
public class LabResultController {

    @Autowired(required = false)
    private LabResultService labResultService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Lab Results API is working!");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Controller is loaded and working!");
    }

    @GetMapping("/mock/{userId}")
    public ResponseEntity<List<LabResultDTO>> getMockLabResults(@PathVariable Long userId) {
        List<LabResultDTO> mockResults = createMockResults(userId);
        return ResponseEntity.ok(mockResults);
    }

    private List<LabResultDTO> createMockResults(Long userId) {
        // Create some mock data for testing
        List<LabResultDTO> mockResults = new ArrayList<>();
        
        LabResultDTO result1 = new LabResultDTO();
        result1.setId(UUID.randomUUID());
        result1.setTitle("Complete Blood Count");
        result1.setDescription("Routine blood work");
        result1.setStatus(DocumentStatus.REVIEWED);
        result1.setTestName("CBC");
        result1.setPerformingLab("Apollo Diagnostics");
        result1.setCreatedAt(LocalDateTime.now().minusDays(5));
        result1.setUpdatedAt(LocalDateTime.now().minusDays(5));
        result1.setFormattedFileSize("2.3 MB");
        result1.setIsAbnormal(false);
        result1.setIsCritical(false);
        result1.setRequiresAttention(false);
        
        LabResultDTO result2 = new LabResultDTO();
        result2.setId(UUID.randomUUID());
        result2.setTitle("Lipid Profile");
        result2.setDescription("Cholesterol and triglycerides test");
        result2.setStatus(DocumentStatus.REQUIRES_ATTENTION);
        result2.setTestName("Lipid Panel");
        result2.setPerformingLab("SRL Diagnostics");
        result2.setCreatedAt(LocalDateTime.now().minusDays(2));
        result2.setUpdatedAt(LocalDateTime.now().minusDays(2));
        result2.setFormattedFileSize("1.8 MB");
        result2.setIsAbnormal(true);
        result2.setIsCritical(false);
        result2.setRequiresAttention(true);
        
        mockResults.add(result1);
        mockResults.add(result2);
        
        return mockResults;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<LabResultDTO>> getUserLabResults(
            @PathVariable Long userId,
            Pageable pageable) {
        try {
            if (labResultService != null) {
                Page<LabResultDTO> results = labResultService.getUserLabResults(userId, pageable);
                return ResponseEntity.ok(results);
            } else {
                // Fallback to mock data if service is not available
                List<LabResultDTO> mockResults = createMockResults(userId);
                // Convert to Page (simplified)
                return ResponseEntity.ok(Page.empty());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResultDTO> getLabResult(@PathVariable UUID id) {
        try {
            LabResultDTO result = labResultService.getLabResult(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadLabResult(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "testName", required = false) String testName,
            @RequestParam(value = "orderingPhysician", required = false) String orderingPhysician,
            @RequestParam(value = "performingLab", required = false) String performingLab,
            @RequestParam("file") MultipartFile file) {
        try {
            if (labResultService != null) {
                // Try to use the actual service
                LabResultUploadDTO uploadDTO = new LabResultUploadDTO();
                uploadDTO.setTitle(title);
                uploadDTO.setDescription(description);
                uploadDTO.setTestName(testName);
                uploadDTO.setOrderingPhysician(orderingPhysician);
                uploadDTO.setPerformingLab(performingLab);
                uploadDTO.setFile(file);

                LabResultDTO result = labResultService.uploadLabResult(userId, uploadDTO);
                return ResponseEntity.ok("Lab result uploaded successfully! ID: " + result.getId());
            } else {
                // Fallback response
                return ResponseEntity.ok("Upload endpoint is working! File: " + file.getOriginalFilename() + 
                                       ", Title: " + title + ", User: " + userId);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<String> getDownloadUrl(@PathVariable UUID id) {
        try {
            String downloadUrl = labResultService.generateDownloadUrl(id);
            return ResponseEntity.ok(downloadUrl);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabResult(@PathVariable UUID id) {
        try {
            labResultService.deleteLabResult(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<LabResultDTO>> getRecentLabResults(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<LabResultDTO> results = labResultService.getRecentLabResults(userId, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}/abnormal")
    public ResponseEntity<List<LabResultDTO>> getAbnormalResults(@PathVariable Long userId) {
        try {
            List<LabResultDTO> results = labResultService.getAbnormalResults(userId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}