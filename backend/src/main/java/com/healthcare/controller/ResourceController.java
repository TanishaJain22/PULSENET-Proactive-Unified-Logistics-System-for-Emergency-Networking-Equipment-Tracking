package com.healthcare.controller;

import com.healthcare.dto.CreateResourceDTO;
import com.healthcare.dto.ResourceDTO;
import com.healthcare.dto.UpdateResourceDTO;
import com.healthcare.entity.enums.ResourceType;
import com.healthcare.service.ResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/hospitals/{hospitalId}/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getResources(@PathVariable UUID hospitalId,
                                                         @RequestParam(required = false) String type,
                                                         @RequestParam(required = false) String search) {
        try {
            List<ResourceDTO> resources;
            
            if (search != null && !search.trim().isEmpty()) {
                resources = resourceService.searchResources(hospitalId, search.trim());
            } else if (type != null) {
                // Handle special case for ML dashboard - return all resources
                if ("ml-dashboard".equalsIgnoreCase(type)) {
                    resources = resourceService.getHospitalResources(hospitalId);
                } else {
                    ResourceType resourceType = ResourceType.valueOf(type.toUpperCase());
                    resources = resourceService.getResourcesByType(hospitalId, resourceType);
                }
            } else {
                resources = resourceService.getHospitalResources(hospitalId);
            }
            
            return ResponseEntity.ok(resources);
        } catch (IllegalArgumentException e) {
            log.error("Invalid resource type '{}' for hospital {}: {}", type, hospitalId, e.getMessage());
            // Return all resources if invalid type is provided
            List<ResourceDTO> resources = resourceService.getHospitalResources(hospitalId);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            log.error("Error fetching resources for hospital {}: {}", hospitalId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/critical")
    public ResponseEntity<List<ResourceDTO>> getCriticalResources(@PathVariable UUID hospitalId) {
        try {
            List<ResourceDTO> resources = resourceService.getCriticalResources(hospitalId);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            log.error("Error fetching critical resources for hospital {}: {}", hospitalId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getResourceSummary(@PathVariable UUID hospitalId) {
        try {
            List<ResourceDTO> allResources = resourceService.getHospitalResources(hospitalId);
            List<ResourceDTO> criticalResources = resourceService.getCriticalResources(hospitalId);
            Double totalValue = resourceService.getTotalInventoryValue(hospitalId);
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalResources", allResources.size());
            summary.put("criticalCount", criticalResources.size());
            summary.put("totalInventoryValue", totalValue);
            
            // Calculate utilization
            double totalCapacity = allResources.stream().mapToInt(ResourceDTO::getTotalCapacity).sum();
            double totalAvailable = allResources.stream().mapToInt(ResourceDTO::getAvailableCount).sum();
            double utilizationRate = totalCapacity > 0 ? ((totalCapacity - totalAvailable) / totalCapacity) * 100 : 0;
            summary.put("utilizationRate", Math.round(utilizationRate * 100.0) / 100.0);
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error fetching resource summary for hospital {}: {}", hospitalId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createResource(@PathVariable UUID hospitalId,
                                          @RequestBody CreateResourceDTO dto) {
        try {
            dto.setHospitalId(hospitalId);
            ResourceDTO resource = resourceService.createResource(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resource created successfully");
            response.put("resource", resource);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating resource for hospital {}: {}", hospitalId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create resource: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<?> getResource(@PathVariable UUID hospitalId,
                                       @PathVariable UUID resourceId) {
        try {
            ResourceDTO resource = resourceService.getResourceById(resourceId);
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            log.error("Error fetching resource {}: {}", resourceId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Resource not found: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{resourceId}")
    public ResponseEntity<?> updateResource(@PathVariable UUID hospitalId,
                                          @PathVariable UUID resourceId,
                                          @RequestBody UpdateResourceDTO dto) {
        try {
            ResourceDTO resource = resourceService.updateResource(resourceId, dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resource updated successfully");
            response.put("resource", resource);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating resource {}: {}", resourceId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update resource: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<?> deleteResource(@PathVariable UUID hospitalId,
                                          @PathVariable UUID resourceId) {
        try {
            resourceService.deleteResource(resourceId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resource deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting resource {}: {}", resourceId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete resource: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/ml-snapshot")
    public ResponseEntity<?> getMLSnapshot(@PathVariable UUID hospitalId) {
        try {
            // This would typically call HospitalSnapshotService.getLatestSnapshot()
            // For now, we'll create a mock response based on current resources
            List<ResourceDTO> resources = resourceService.getHospitalResources(hospitalId);
            
            Map<String, Object> snapshot = new HashMap<>();
            
            // Calculate resource counts by type
            int icuBeds = resources.stream()
                .filter(r -> "ICU_BED".equals(r.getType().toString()))
                .mapToInt(ResourceDTO::getAvailableCount)
                .sum();
                
            int generalBeds = resources.stream()
                .filter(r -> "GENERAL_BED".equals(r.getType().toString()))
                .mapToInt(ResourceDTO::getAvailableCount)
                .sum();
                
            int ventilators = resources.stream()
                .filter(r -> "VENTILATOR".equals(r.getType().toString()))
                .mapToInt(ResourceDTO::getAvailableCount)
                .sum();
                
            int operatingRooms = resources.stream()
                .filter(r -> "OPERATING_ROOM".equals(r.getType().toString()))
                .mapToInt(ResourceDTO::getAvailableCount)
                .sum();
            
            boolean ctScannerAvailable = resources.stream()
                .anyMatch(r -> "CT_SCANNER".equals(r.getType().toString()) && r.getAvailableCount() > 0);
                
            boolean mriAvailable = resources.stream()
                .anyMatch(r -> "MRI_MACHINE".equals(r.getType().toString()) && r.getAvailableCount() > 0);
                
            boolean dialysisAvailable = resources.stream()
                .anyMatch(r -> "DIALYSIS_MACHINE".equals(r.getType().toString()) && r.getAvailableCount() > 0);
            
            // Calculate hospital load
            double totalCapacity = resources.stream().mapToInt(ResourceDTO::getTotalCapacity).sum();
            double totalAvailable = resources.stream().mapToInt(ResourceDTO::getAvailableCount).sum();
            double hospitalLoad = totalCapacity > 0 ? ((totalCapacity - totalAvailable) / totalCapacity) * 100 : 0;
            
            snapshot.put("icuBedsAvailable", icuBeds);
            snapshot.put("generalBedsAvailable", generalBeds);
            snapshot.put("ventilatorsAvailable", ventilators);
            snapshot.put("operatingRoomsAvailable", operatingRooms);
            snapshot.put("ctScannerAvailable", ctScannerAvailable);
            snapshot.put("mriAvailable", mriAvailable);
            snapshot.put("dialysisAvailable", dialysisAvailable);
            snapshot.put("specialistCount", 12); // Mock data - would come from DoctorService
            snapshot.put("hospitalLoadPercentage", Math.round(hospitalLoad * 100.0) / 100.0);
            snapshot.put("specialistScore", 4); // Mock data
            snapshot.put("mlHospitalId", 0); // Mock data - would come from MLModelMappingService
            snapshot.put("isAcceptingTransfers", hospitalLoad < 95.0);
            snapshot.put("lastUpdated", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(snapshot);
        } catch (Exception e) {
            log.error("Error fetching ML snapshot for hospital {}: {}", hospitalId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch ML snapshot: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}