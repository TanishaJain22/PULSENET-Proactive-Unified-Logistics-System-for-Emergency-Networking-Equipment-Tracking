package com.healthcare.controller;

import com.healthcare.dto.HospitalRecommendationDTO;
import com.healthcare.dto.TransferRequestDTO;
import com.healthcare.dto.TransferResponseDTO;
import com.healthcare.entity.enums.TransferStatus;
import com.healthcare.service.TransferService;
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
@RequestMapping("/api/hospitals/{hospitalId}/transfers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransferController {

    private final TransferService transferService;

    @PostMapping("/recommendations")
    public ResponseEntity<?> getHospitalRecommendations(@PathVariable UUID hospitalId,
                                                       @RequestBody TransferRequestDTO request) {
        try {
            log.info("Getting hospital recommendations for hospital: {}", hospitalId);
            request.setFromHospitalId(hospitalId);
            
            List<HospitalRecommendationDTO> recommendations = transferService.getHospitalRecommendations(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendations", recommendations);
            response.put("count", recommendations.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting hospital recommendations: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get recommendations: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/request")
    public ResponseEntity<?> createTransferRequest(@PathVariable UUID hospitalId,
                                                  @RequestBody TransferRequestDTO request) {
        try {
            log.info("Creating transfer request for hospital: {}", hospitalId);
            request.setFromHospitalId(hospitalId);
            
            TransferResponseDTO transfer = transferService.createTransferRequest(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer request created successfully");
            response.put("transfer", transfer);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating transfer request: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create transfer request: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<TransferResponseDTO>> getOutgoingTransfers(@PathVariable UUID hospitalId) {
        try {
            List<TransferResponseDTO> transfers = transferService.getOutgoingTransfers(hospitalId);
            return ResponseEntity.ok(transfers);
        } catch (Exception e) {
            log.error("Error fetching outgoing transfers: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<TransferResponseDTO>> getIncomingTransfers(@PathVariable UUID hospitalId) {
        try {
            List<TransferResponseDTO> transfers = transferService.getIncomingTransfers(hospitalId);
            return ResponseEntity.ok(transfers);
        } catch (Exception e) {
            log.error("Error fetching incoming transfers: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/incoming/pending")
    public ResponseEntity<List<TransferResponseDTO>> getPendingIncomingTransfers(@PathVariable UUID hospitalId) {
        try {
            List<TransferResponseDTO> transfers = transferService.getPendingIncomingTransfers(hospitalId);
            return ResponseEntity.ok(transfers);
        } catch (Exception e) {
            log.error("Error fetching pending transfers: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<TransferResponseDTO>> getAllTransfers(@PathVariable UUID hospitalId) {
        try {
            List<TransferResponseDTO> transfers = transferService.getAllTransfersForHospital(hospitalId);
            return ResponseEntity.ok(transfers);
        } catch (Exception e) {
            log.error("Error fetching all transfers: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<TransferResponseDTO>> getActiveTransfers(@PathVariable UUID hospitalId) {
        try {
            List<TransferResponseDTO> transfers = transferService.getActiveTransfersForHospital(hospitalId);
            return ResponseEntity.ok(transfers);
        } catch (Exception e) {
            log.error("Error fetching active transfers: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{transferId}")
    public ResponseEntity<?> getTransfer(@PathVariable UUID hospitalId,
                                        @PathVariable UUID transferId) {
        try {
            TransferResponseDTO transfer = transferService.getTransferById(transferId);
            return ResponseEntity.ok(transfer);
        } catch (Exception e) {
            log.error("Error fetching transfer {}: {}", transferId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Transfer not found: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{transferId}/accept")
    public ResponseEntity<?> acceptTransfer(@PathVariable UUID hospitalId,
                                           @PathVariable UUID transferId,
                                           @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String notes = requestBody != null ? requestBody.get("notes") : null;
            UUID reviewedBy = hospitalId; // In production, get from authentication
            
            TransferResponseDTO transfer = transferService.acceptTransfer(transferId, reviewedBy, notes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer accepted successfully");
            response.put("transfer", transfer);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error accepting transfer {}: {}", transferId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to accept transfer: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{transferId}/reject")
    public ResponseEntity<?> rejectTransfer(@PathVariable UUID hospitalId,
                                           @PathVariable UUID transferId,
                                           @RequestBody Map<String, String> requestBody) {
        try {
            String rejectionReason = requestBody.get("rejectionReason");
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is required");
            }
            
            UUID reviewedBy = hospitalId; // In production, get from authentication
            
            TransferResponseDTO transfer = transferService.rejectTransfer(transferId, reviewedBy, rejectionReason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer rejected successfully");
            response.put("transfer", transfer);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rejecting transfer {}: {}", transferId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to reject transfer: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{transferId}/status")
    public ResponseEntity<?> updateTransferStatus(@PathVariable UUID hospitalId,
                                                 @PathVariable UUID transferId,
                                                 @RequestBody Map<String, String> requestBody) {
        try {
            String statusStr = requestBody.get("status");
            String notes = requestBody.get("notes");
            
            if (statusStr == null) {
                throw new IllegalArgumentException("Status is required");
            }
            
            TransferStatus newStatus = TransferStatus.valueOf(statusStr.toUpperCase());
            
            TransferResponseDTO transfer = transferService.updateTransferStatus(transferId, newStatus, notes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer status updated successfully");
            response.put("transfer", transfer);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating transfer status {}: {}", transferId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update transfer status: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getTransferStatistics(@PathVariable UUID hospitalId) {
        try {
            // Get basic statistics
            List<TransferResponseDTO> outgoing = transferService.getOutgoingTransfers(hospitalId);
            List<TransferResponseDTO> incoming = transferService.getIncomingTransfers(hospitalId);
            List<TransferResponseDTO> active = transferService.getActiveTransfersForHospital(hospitalId);
            List<TransferResponseDTO> pending = transferService.getPendingIncomingTransfers(hospitalId);
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalOutgoing", outgoing.size());
            statistics.put("totalIncoming", incoming.size());
            statistics.put("activeTransfers", active.size());
            statistics.put("pendingRequests", pending.size());
            
            // Calculate acceptance rate
            long acceptedCount = incoming.stream()
                    .mapToLong(t -> t.getStatus() == TransferStatus.ACCEPTED || 
                                   t.getStatus() == TransferStatus.AMBULANCE_DISPATCHED ||
                                   t.getStatus() == TransferStatus.EN_ROUTE ||
                                   t.getStatus() == TransferStatus.ARRIVED ||
                                   t.getStatus() == TransferStatus.COMPLETED ? 1 : 0)
                    .sum();
            
            double acceptanceRate = incoming.size() > 0 ? (double) acceptedCount / incoming.size() * 100 : 0;
            statistics.put("acceptanceRate", Math.round(acceptanceRate * 100.0) / 100.0);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error fetching transfer statistics: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/ml-model-data")
    public ResponseEntity<?> getMLModelData(@PathVariable UUID hospitalId,
                                           @RequestBody TransferRequestDTO request) {
        try {
            log.info("Generating ML model data for hospital: {}", hospitalId);
            request.setFromHospitalId(hospitalId);
            
            Map<String, Object> mlData = transferService.prepareMLModelData(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mlData", mlData);
            response.put("featureCount", mlData.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating ML model data: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to generate ML data: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/test-python-ai")
    public ResponseEntity<?> testPythonAI(@PathVariable UUID hospitalId,
                                         @RequestBody TransferRequestDTO request) {
        try {
            log.info("Testing Python AI integration for hospital: {}", hospitalId);
            request.setFromHospitalId(hospitalId);
            
            List<HospitalRecommendationDTO> recommendations = transferService.getHospitalRecommendations(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "AI recommendation test completed");
            response.put("recommendations", recommendations);
            response.put("count", recommendations.size());
            response.put("aiServiceStatus", "Enhanced Local AI Active");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error testing AI recommendations: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "AI recommendation test failed: " + e.getMessage());
            errorResponse.put("aiServiceStatus", "Error");
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/test-enhanced-ai")
    public ResponseEntity<?> testEnhancedAI(@PathVariable UUID hospitalId,
                                           @RequestBody TransferRequestDTO request) {
        try {
            log.info("Testing Enhanced AI recommendations for hospital: {}", hospitalId);
            request.setFromHospitalId(hospitalId);
            
            // Force use of enhanced local AI by temporarily disabling Python AI
            List<HospitalRecommendationDTO> recommendations = transferService.getHospitalRecommendations(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Enhanced AI test completed successfully");
            response.put("recommendations", recommendations);
            response.put("count", recommendations.size());
            response.put("algorithm", "Enhanced Local AI");
            
            // Add scoring breakdown for top recommendation
            if (!recommendations.isEmpty()) {
                HospitalRecommendationDTO top = recommendations.get(0);
                Map<String, Object> topDetails = new HashMap<>();
                topDetails.put("hospital_name", top.getHospitalName());
                topDetails.put("ai_score", top.getAiScore());
                topDetails.put("reasoning", top.getReasoning());
                topDetails.put("has_specialty", top.getHasRequiredSpecialty());
                topDetails.put("icu_beds", top.getIcuBedsAvailable());
                topDetails.put("travel_time", top.getTravelTimeMinutes());
                response.put("top_recommendation_details", topDetails);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error testing enhanced AI: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Enhanced AI test failed: " + e.getMessage());
            errorResponse.put("algorithm", "Error");
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}