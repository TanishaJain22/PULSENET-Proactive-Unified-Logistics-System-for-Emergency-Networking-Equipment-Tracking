package com.healthcare.controller;

import com.healthcare.service.CloudStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*")
public class CloudStorageTestController {

    @Autowired
    private CloudStorageService cloudStorageService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testCloudStorage() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isAvailable = cloudStorageService.isCloudStorageAvailable();
            
            response.put("success", true);
            response.put("cloudStorageAvailable", isAvailable);
            response.put("storageType", isAvailable ? "Cloudflare R2" : "Local Storage");
            response.put("message", isAvailable ? 
                "Cloudflare R2 is connected and ready" : 
                "Using local storage fallback");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("storageType", "Local Storage (Fallback)");
            
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/upload-test")
    public ResponseEntity<Map<String, Object>> testUpload(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String fileUrl = cloudStorageService.uploadMedicalImage(file, 999L, "test");
            
            response.put("success", true);
            response.put("fileUrl", fileUrl);
            response.put("message", "File uploaded successfully");
            response.put("storageType", fileUrl.startsWith("r2://") ? "Cloudflare R2" : "Local Storage");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}