package com.healthcare.service;

import com.healthcare.dto.HospitalRecommendationDTO;
import com.healthcare.dto.TransferRequestDTO;
import com.healthcare.dto.TransferResponseDTO;
import com.healthcare.entity.Transfer;
import com.healthcare.entity.enums.TransferStatus;
import com.healthcare.repository.TransferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransferService {

    private final TransferRepository transferRepository;
    private final AIHospitalRecommendationService aiRecommendationService;
    private final EmailService emailService;
    private final MLModelMappingService mlMappingService;
    // private final NotificationEventService notificationEventService; // Removed - service deleted
    private final com.healthcare.repository.HospitalRepository hospitalRepository;

    public List<HospitalRecommendationDTO> getHospitalRecommendations(TransferRequestDTO request) {
        log.info("Getting hospital recommendations for patient: {}", request.getPatientId());
        return aiRecommendationService.getTopHospitalRecommendations(request);
    }

    public TransferResponseDTO createTransferRequest(TransferRequestDTO request) {
        log.info("Creating transfer request for patient: {} from hospital: {}", 
                request.getPatientId(), request.getFromHospitalId());

        try {
            // Validate that fromHospital exists
            if (!hospitalRepository.existsById(request.getFromHospitalId())) {
                throw new RuntimeException("From hospital not found: " + request.getFromHospitalId());
            }
            
            // Validate that requestedHospital exists if provided
            if (request.getRequestedHospitalId() != null && 
                !hospitalRepository.existsById(request.getRequestedHospitalId())) {
                throw new RuntimeException("Requested hospital not found: " + request.getRequestedHospitalId());
            }
            
            // Create transfer entity
            Transfer transfer = new Transfer();
            transfer.setPatientId(request.getPatientId());
            transfer.setPatientName(request.getPatientName());
            transfer.setFromHospitalId(request.getFromHospitalId());
            transfer.setRequestedHospitalId(request.getRequestedHospitalId());
            transfer.setToHospitalId(request.getRequestedHospitalId());

            // Set patient vitals
            transfer.setHeartRate(request.getHeartRate());
            transfer.setOxygenLevel(request.getOxygenLevel());
            transfer.setTemperature(request.getTemperature());
            transfer.setBpSystolic(request.getBpSystolic());
            transfer.setBpDiastolic(request.getBpDiastolic());
            transfer.setRespiratoryRate(request.getRespiratoryRate());
            transfer.setSupplementalO2(request.getSupplementalO2());
            transfer.setConsciousnessLevel(request.getConsciousnessLevel());
            transfer.setSeverityLevel(request.getSeverityLevel());

            // Set transfer details
            transfer.setRequiredSpecialty(request.getRequiredSpecialty());
            transfer.setSpecialtyEncoded(mlMappingService.encodeSpecialty(request.getRequiredSpecialty()));
            transfer.setTrafficCondition(request.getTrafficCondition());
            transfer.setTrafficEncoded(mlMappingService.encodeTrafficCondition(request.getTrafficCondition().toString()));
            transfer.setEstimatedTravelTime(request.getEstimatedTravelTime());
            transfer.setTransferReason(request.getTransferReason());
            transfer.setReasonDescription(request.getReasonDescription());
            transfer.setNotes(request.getNotes());

            transfer.setStatus(TransferStatus.REQUESTED);
            transfer.setRequestedAt(LocalDateTime.now());

            // Calculate NEWS2 score if not provided
            if (transfer.getSeverityLevel() == null) {
                transfer.setSeverityLevel(transfer.calculateNEWS2Score());
            }

            // Save transfer
            transfer = transferRepository.save(transfer);

            // Send notification to receiving hospital
            if (request.getRequestedHospitalId() != null) {
                sendTransferNotification(transfer);
            }

            log.info("Created transfer request with ID: {}", transfer.getId());
            return convertToResponseDTO(transfer);

        } catch (Exception e) {
            log.error("Error creating transfer request: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create transfer request: " + e.getMessage());
        }
    }

    public Map<String, Object> prepareMLModelData(TransferRequestDTO request) {
        log.info("Preparing ML model data for transfer request");
        return aiRecommendationService.prepareMLModelData(request, 
                List.of()); // Will be populated by the AI service internally
    }

    public TransferResponseDTO acceptTransfer(UUID transferId, UUID reviewedBy, String notes) {
        log.info("Accepting transfer: {}", transferId);

        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));

        if (transfer.getStatus() != TransferStatus.REQUESTED) {
            throw new RuntimeException("Transfer cannot be accepted in current status: " + transfer.getStatus());
        }

        transfer.setStatus(TransferStatus.ACCEPTED);
        transfer.setAcceptedAt(LocalDateTime.now());
        transfer.setReviewedBy(reviewedBy);
        if (notes != null) {
            transfer.setNotes(transfer.getNotes() + "\nAcceptance Notes: " + notes);
        }

        // Set estimated arrival time
        if (transfer.getEstimatedTravelTime() != null) {
            transfer.setEstimatedArrival(LocalDateTime.now().plusMinutes(transfer.getEstimatedTravelTime()));
        }

        transfer = transferRepository.save(transfer);

        // Send confirmation notifications
        sendTransferAcceptanceNotification(transfer);

        log.info("Accepted transfer: {}", transferId);
        return convertToResponseDTO(transfer);
    }

    public TransferResponseDTO rejectTransfer(UUID transferId, UUID reviewedBy, String rejectionReason) {
        log.info("Rejecting transfer: {}", transferId);

        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));

        if (transfer.getStatus() != TransferStatus.REQUESTED) {
            throw new RuntimeException("Transfer cannot be rejected in current status: " + transfer.getStatus());
        }

        transfer.setStatus(TransferStatus.REJECTED);
        transfer.setRejectedAt(LocalDateTime.now());
        transfer.setReviewedBy(reviewedBy);
        transfer.setRejectionReason(rejectionReason);

        transfer = transferRepository.save(transfer);

        // Send rejection notification
        sendTransferRejectionNotification(transfer);

        log.info("Rejected transfer: {}", transferId);
        return convertToResponseDTO(transfer);
    }

    public TransferResponseDTO updateTransferStatus(UUID transferId, TransferStatus newStatus, String notes) {
        log.info("Updating transfer {} status to: {}", transferId, newStatus);

        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));

        TransferStatus oldStatus = transfer.getStatus();
        transfer.setStatus(newStatus);

        // Update timestamps based on status
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case AMBULANCE_DISPATCHED:
                transfer.setDispatchedAt(now);
                break;
            case ARRIVED:
                transfer.setArrivedAt(now);
                break;
            case COMPLETED:
                transfer.setCompletedAt(now);
                break;
        }

        if (notes != null) {
            transfer.setNotes(transfer.getNotes() + "\nStatus Update: " + notes);
        }

        transfer = transferRepository.save(transfer);

        log.info("Updated transfer {} status from {} to {}", transferId, oldStatus, newStatus);
        return convertToResponseDTO(transfer);
    }

    public List<TransferResponseDTO> getOutgoingTransfers(UUID hospitalId) {
        List<Transfer> transfers = transferRepository.findByFromHospitalIdOrderByRequestedAtDesc(hospitalId);
        return transfers.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public List<TransferResponseDTO> getIncomingTransfers(UUID hospitalId) {
        List<Transfer> transfers = transferRepository.findByToHospitalIdOrderByRequestedAtDesc(hospitalId);
        return transfers.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public List<TransferResponseDTO> getPendingIncomingTransfers(UUID hospitalId) {
        List<Transfer> transfers = transferRepository.findByToHospitalIdAndStatusOrderByRequestedAtDesc(
                hospitalId, TransferStatus.REQUESTED);
        return transfers.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public List<TransferResponseDTO> getAllTransfersForHospital(UUID hospitalId) {
        List<Transfer> transfers = transferRepository.findAllTransfersForHospital(hospitalId);
        return transfers.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public List<TransferResponseDTO> getActiveTransfersForHospital(UUID hospitalId) {
        List<Transfer> transfers = transferRepository.findActiveTransfersForHospital(hospitalId);
        return transfers.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public TransferResponseDTO getTransferById(UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));
        return convertToResponseDTO(transfer);
    }

    private TransferResponseDTO convertToResponseDTO(Transfer transfer) {
        // Safely get hospital names by loading from repository if needed
        String fromHospitalName = null;
        String toHospitalName = null;
        String contactPhone = null;
        String emergencyContact = null;
        
        if (transfer.getFromHospitalId() != null) {
            try {
                fromHospitalName = hospitalRepository.findById(transfer.getFromHospitalId())
                    .map(h -> h.getName())
                    .orElse(null);
            } catch (Exception e) {
                log.warn("Could not load from hospital: {}", e.getMessage());
            }
        }
        
        if (transfer.getToHospitalId() != null) {
            try {
                var toHospital = hospitalRepository.findById(transfer.getToHospitalId()).orElse(null);
                if (toHospital != null) {
                    toHospitalName = toHospital.getName();
                    contactPhone = toHospital.getContactPhone();
                    emergencyContact = toHospital.getContactPhone();
                }
            } catch (Exception e) {
                log.warn("Could not load to hospital: {}", e.getMessage());
            }
        }
        
        return TransferResponseDTO.builder()
                .id(transfer.getId())
                .patientId(transfer.getPatientId())
                .patientName(transfer.getPatientName())
                .fromHospitalId(transfer.getFromHospitalId())
                .fromHospitalName(fromHospitalName)
                .toHospitalId(transfer.getToHospitalId())
                .toHospitalName(toHospitalName)
                .status(transfer.getStatus())
                .statusDescription(getStatusDescription(transfer.getStatus()))
                .requiredSpecialty(transfer.getRequiredSpecialty())
                .severityLevel(transfer.getSeverityLevel())
                .transferReason(transfer.getTransferReason().toString())
                .reasonDescription(transfer.getReasonDescription())
                .aiRecommendationScore(transfer.getAiRecommendationScore())
                .aiReasoning(transfer.getAiReasoning())
                .requestedAt(transfer.getRequestedAt())
                .acceptedAt(transfer.getAcceptedAt())
                .dispatchedAt(transfer.getDispatchedAt())
                .estimatedArrival(transfer.getEstimatedArrival())
                .arrivedAt(transfer.getArrivedAt())
                .completedAt(transfer.getCompletedAt())
                .estimatedTravelTime(transfer.getEstimatedTravelTime())
                .ambulanceId(transfer.getAmbulanceId())
                .notes(transfer.getNotes())
                .rejectionReason(transfer.getRejectionReason())
                .contactPhone(contactPhone)
                .emergencyContact(emergencyContact)
                .build();
    }

    private String getStatusDescription(TransferStatus status) {
        switch (status) {
            case REQUESTED: return "Awaiting hospital response";
            case ACCEPTED: return "Transfer approved, preparing ambulance";
            case REJECTED: return "Transfer request declined";
            case AMBULANCE_DISPATCHED: return "Ambulance en route to pickup";
            case EN_ROUTE: return "Patient being transported";
            case ARRIVED: return "Patient arrived at destination";
            case COMPLETED: return "Transfer completed successfully";
            case CANCELLED: return "Transfer cancelled";
            default: return status.toString();
        }
    }

    private void sendTransferNotification(Transfer transfer) {
        try {
            // Load hospital names safely
            String fromHospitalName = hospitalRepository.findById(transfer.getFromHospitalId())
                .map(h -> h.getName())
                .orElse("Unknown Hospital");
            
            // Send notification to receiving hospital
            // notificationEventService.notifyTransferRequested( // Removed - service deleted
            //     transfer.getToHospitalId(),
            //     transfer.getPatientName(),
            //     fromHospitalName,
            //     transfer.getTransferReason().toString(),
            //     transfer.getId()
            // );
            
            log.info("Sent transfer notification for transfer: {}", transfer.getId());
        } catch (Exception e) {
            log.error("Error sending transfer notification: {}", e.getMessage());
        }
    }

    private void sendTransferAcceptanceNotification(Transfer transfer) {
        try {
            // Load hospital names safely
            String toHospitalName = hospitalRepository.findById(transfer.getToHospitalId())
                .map(h -> h.getName())
                .orElse("Unknown Hospital");
            
            // Send notification to requesting hospital
            // notificationEventService.notifyTransferApproved( // Removed - service deleted
            //     transfer.getFromHospitalId(),
            //     transfer.getPatientName(),
            //     toHospitalName,
            //     transfer.getId()
            // );
            
            log.info("Sent transfer acceptance notification for transfer: {}", transfer.getId());
        } catch (Exception e) {
            log.error("Error sending acceptance notification: {}", e.getMessage());
        }
    }

    private void sendTransferRejectionNotification(Transfer transfer) {
        try {
            // Load hospital names safely
            String fromHospitalName = hospitalRepository.findById(transfer.getFromHospitalId())
                .map(h -> h.getName())
                .orElse("Unknown Hospital");
            
            // Send rejection notification to requesting hospital
            // notificationEventService.notifyTransferRequested( // Removed - service deleted
            //     transfer.getFromHospitalId(),
            //     transfer.getPatientName(),
            //     fromHospitalName,
            //     "Transfer request rejected: " + transfer.getRejectionReason(),
            //     transfer.getId()
            // );
            
            log.info("Sent transfer rejection notification for transfer: {}", transfer.getId());
        } catch (Exception e) {
            log.error("Error sending rejection notification: {}", e.getMessage());
        }
    }
}