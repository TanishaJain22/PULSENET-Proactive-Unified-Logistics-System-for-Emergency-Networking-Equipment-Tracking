package com.healthcare.service;

import com.healthcare.dto.*;
import com.healthcare.entity.Ambulance;
import com.healthcare.entity.AmbulanceLocation;
import com.healthcare.entity.AmbulanceRequest;
import com.healthcare.entity.enums.AmbulanceStatus;
import com.healthcare.entity.enums.AmbulanceType;
import com.healthcare.repository.AmbulanceRepository;
import com.healthcare.repository.AmbulanceLocationRepository;
import com.healthcare.repository.AmbulanceRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final AmbulanceLocationRepository ambulanceLocationRepository;
    private final AmbulanceRequestRepository ambulanceRequestRepository;
    // private final NotificationEventService notificationEventService; // Removed - service deleted

    public List<AmbulanceDTO> getAmbulancesByHospital(UUID hospitalId) {
        log.info("Getting ambulances for hospital: {}", hospitalId);
        List<Ambulance> ambulances = ambulanceRepository.findByHospitalId(hospitalId);
        return ambulances.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AmbulanceDTO> getAmbulancesByHospitalAndStatus(UUID hospitalId, AmbulanceStatus status) {
        log.info("Getting ambulances for hospital: {} with status: {}", hospitalId, status);
        List<Ambulance> ambulances = ambulanceRepository.findByHospitalIdAndStatus(hospitalId, status);
        return ambulances.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<AmbulanceDTO> getAmbulanceById(UUID ambulanceId) {
        log.info("Getting ambulance by ID: {}", ambulanceId);
        return ambulanceRepository.findById(ambulanceId)
                .map(this::convertToDTO);
    }

    public Optional<AmbulanceDTO> getAmbulanceByVehicleNumber(String vehicleNumber) {
        log.info("Getting ambulance by vehicle number: {}", vehicleNumber);
        return ambulanceRepository.findByVehicleNumber(vehicleNumber)
                .map(this::convertToDTO);
    }

    @Transactional
    public AmbulanceLocationDTO updateAmbulanceLocation(UpdateAmbulanceLocationDTO updateDTO) {
        log.info("Updating location for ambulance: {}", updateDTO.getAmbulanceId());
        
        // Verify ambulance exists
        Ambulance ambulance = ambulanceRepository.findById(updateDTO.getAmbulanceId())
                .orElseThrow(() -> new RuntimeException("Ambulance not found: " + updateDTO.getAmbulanceId()));

        // Create new location record
        AmbulanceLocation location = new AmbulanceLocation();
        location.setAmbulanceId(updateDTO.getAmbulanceId());
        location.setLatitude(updateDTO.getLatitude());
        location.setLongitude(updateDTO.getLongitude());
        location.setSpeed(updateDTO.getSpeed());
        location.setHeading(updateDTO.getHeading());
        location.setAccuracy(updateDTO.getAccuracy());
        location.setTimestamp(LocalDateTime.now());

        AmbulanceLocation savedLocation = ambulanceLocationRepository.save(location);

        // Update ambulance's current location
        ambulance.setCurrentLatitude(updateDTO.getLatitude());
        ambulance.setCurrentLongitude(updateDTO.getLongitude());
        ambulance.setLastLocationUpdate(LocalDateTime.now());
        ambulanceRepository.save(ambulance);

        log.info("Location updated successfully for ambulance: {}", updateDTO.getAmbulanceId());
        return convertLocationToDTO(savedLocation);
    }

    public List<AmbulanceLocationDTO> getAmbulanceLocationHistory(UUID ambulanceId, int hours) {
        log.info("Getting location history for ambulance: {} for last {} hours", ambulanceId, hours);
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<AmbulanceLocation> locations = ambulanceLocationRepository
                .findByAmbulanceIdAndTimestampAfter(ambulanceId, since);
        
        return locations.stream()
                .map(this::convertLocationToDTO)
                .collect(Collectors.toList());
    }

    public Optional<AmbulanceLocationDTO> getLatestAmbulanceLocation(UUID ambulanceId) {
        log.info("Getting latest location for ambulance: {}", ambulanceId);
        return ambulanceLocationRepository.findLatestByAmbulanceId(ambulanceId)
                .map(this::convertLocationToDTO);
    }

    @Transactional
    public AmbulanceRequestDTO createAmbulanceRequest(CreateAmbulanceRequestDTO createDTO) {
        log.info("Creating ambulance request for hospital: {}", createDTO.getHospitalId());
        
        AmbulanceRequest request = new AmbulanceRequest();
        request.setHospitalId(createDTO.getHospitalId());
        request.setPatientName(createDTO.getPatientName());
        request.setPatientContact(createDTO.getPatientContact());
        request.setPickupLocation(createDTO.getPickupLocation());
        request.setPickupLatitude(createDTO.getPickupLatitude());
        request.setPickupLongitude(createDTO.getPickupLongitude());
        request.setDestinationLocation(createDTO.getDestinationLocation());
        request.setDestinationLatitude(createDTO.getDestinationLatitude());
        request.setDestinationLongitude(createDTO.getDestinationLongitude());
        request.setAmbulanceTypeRequested(createDTO.getAmbulanceTypeRequested());
        request.setEmergencyDetails(createDTO.getEmergencyDetails());
        request.setStatus(AmbulanceStatus.DISPATCHED);
        request.setRequestTime(LocalDateTime.now());

        AmbulanceRequest savedRequest = ambulanceRequestRepository.save(request);
        log.info("Ambulance request created successfully: {}", savedRequest.getId());
        
        // Generate notification for ambulance request
        try {
            // notificationEventService.notifyAmbulanceRequested( // Removed - service deleted
            //     createDTO.getHospitalId(),
            //     createDTO.getPatientName(),
            //     createDTO.getPickupLocation(),
            //     savedRequest.getId()
            // );
        } catch (Exception e) {
            log.warn("Failed to create notification for ambulance request: {}", savedRequest.getId(), e);
        }
        
        return convertRequestToDTO(savedRequest);
    }

    @Transactional
    public AmbulanceRequestDTO approveAmbulanceRequest(UUID requestId) {
        log.info("Approving ambulance request: {}", requestId);
        
        AmbulanceRequest request = ambulanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Ambulance request not found: " + requestId));

        request.setApprovedByHospital(true);
        request.setApprovedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        AmbulanceRequest savedRequest = ambulanceRequestRepository.save(request);
        log.info("Ambulance request approved successfully: {}", requestId);
        
        return convertRequestToDTO(savedRequest);
    }

    public List<AmbulanceRequestDTO> getAmbulanceRequestsByHospital(UUID hospitalId) {
        log.info("Getting ambulance requests for hospital: {}", hospitalId);
        List<AmbulanceRequest> requests = ambulanceRequestRepository.findByHospitalId(hospitalId);
        return requests.stream()
                .map(this::convertRequestToDTO)
                .collect(Collectors.toList());
    }

    public List<AmbulanceRequestDTO> getPendingAmbulanceRequests(UUID hospitalId) {
        log.info("Getting pending ambulance requests for hospital: {}", hospitalId);
        List<AmbulanceRequest> requests = ambulanceRequestRepository
                .findByHospitalIdAndApprovedByHospital(hospitalId, false);
        return requests.stream()
                .map(this::convertRequestToDTO)
                .collect(Collectors.toList());
    }

    public List<AmbulanceRequestDTO> getActiveAmbulanceRequests(UUID hospitalId) {
        log.info("Getting active ambulance requests for hospital: {}", hospitalId);
        List<AmbulanceStatus> activeStatuses = List.of(
                AmbulanceStatus.DISPATCHED,
                AmbulanceStatus.EN_ROUTE,
                AmbulanceStatus.AT_SCENE,
                AmbulanceStatus.PATIENT_PICKED
        );
        List<AmbulanceRequest> requests = ambulanceRequestRepository
                .findByHospitalIdAndStatusIn(hospitalId, activeStatuses);
        return requests.stream()
                .map(this::convertRequestToDTO)
                .collect(Collectors.toList());
    }

    // Helper methods for DTO conversion
    private AmbulanceDTO convertToDTO(Ambulance ambulance) {
        AmbulanceDTO dto = new AmbulanceDTO();
        dto.setId(ambulance.getId());
        dto.setVehicleNumber(ambulance.getVehicleNumber());
        dto.setHospitalId(ambulance.getHospitalId());
        dto.setType(ambulance.getType());
        dto.setStatus(ambulance.getStatus());
        dto.setDriverName(ambulance.getDriverName());
        dto.setDriverContact(ambulance.getDriverContact());
        dto.setCurrentLatitude(ambulance.getCurrentLatitude());
        dto.setCurrentLongitude(ambulance.getCurrentLongitude());
        dto.setCurrentLocationString(ambulance.getLocationString());
        dto.setLastLocationUpdate(ambulance.getLastLocationUpdate());
        dto.setCreatedAt(ambulance.getCreatedAt());
        dto.setUpdatedAt(ambulance.getUpdatedAt());
        dto.setActive(ambulance.isActive());

        // Get latest location
        ambulanceLocationRepository.findLatestByAmbulanceId(ambulance.getId())
                .ifPresent(location -> dto.setCurrentLocation(convertLocationToDTO(location)));

        // Get active request
        List<AmbulanceRequest> activeRequests = ambulanceRequestRepository
                .findActiveRequestsByAmbulanceId(ambulance.getId());
        if (!activeRequests.isEmpty()) {
            dto.setActiveRequest(convertRequestToDTO(activeRequests.get(0)));
        }

        return dto;
    }

    private AmbulanceLocationDTO convertLocationToDTO(AmbulanceLocation location) {
        AmbulanceLocationDTO dto = new AmbulanceLocationDTO();
        dto.setId(location.getId());
        dto.setAmbulanceId(location.getAmbulanceId());
        dto.setLatitude(location.getLatitude());
        dto.setLongitude(location.getLongitude());
        dto.setSpeed(location.getSpeed());
        dto.setHeading(location.getHeading());
        dto.setAccuracy(location.getAccuracy());
        dto.setTimestamp(location.getTimestamp());
        dto.setLocationString(location.getLocationString());
        dto.setRecentLocation(location.isRecentLocation(10)); // 10 minutes threshold
        return dto;
    }

    private AmbulanceRequestDTO convertRequestToDTO(AmbulanceRequest request) {
        AmbulanceRequestDTO dto = new AmbulanceRequestDTO();
        dto.setId(request.getId());
        dto.setHospitalId(request.getHospitalId());
        dto.setAmbulanceId(request.getAmbulanceId());
        dto.setPatientName(request.getPatientName());
        dto.setPatientContact(request.getPatientContact());
        dto.setPickupLocation(request.getPickupLocation());
        dto.setPickupLatitude(request.getPickupLatitude());
        dto.setPickupLongitude(request.getPickupLongitude());
        dto.setDestinationLocation(request.getDestinationLocation());
        dto.setDestinationLatitude(request.getDestinationLatitude());
        dto.setDestinationLongitude(request.getDestinationLongitude());
        dto.setAmbulanceTypeRequested(request.getAmbulanceTypeRequested());
        dto.setStatus(request.getStatus());
        dto.setEmergencyDetails(request.getEmergencyDetails());
        dto.setEstimatedArrivalTime(request.getEstimatedArrivalTime());
        dto.setActualArrivalTime(request.getActualArrivalTime());
        dto.setCompletionTime(request.getCompletionTime());
        dto.setDistanceKm(request.getDistanceKm());
        dto.setRequestTime(request.getRequestTime());
        dto.setApprovedByHospital(request.getApprovedByHospital());
        dto.setApprovedAt(request.getApprovedAt());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setPickupLocationString(request.getPickupLocationString());
        dto.setDestinationLocationString(request.getDestinationLocationString());
        dto.setActive(request.isActive());
        dto.setCompleted(request.isCompleted());

        // Calculate elapsed time
        if (request.getRequestTime() != null) {
            long elapsedMinutes = ChronoUnit.MINUTES.between(request.getRequestTime(), LocalDateTime.now());
            dto.setElapsedTimeMinutes(elapsedMinutes);
        }

        return dto;
    }

    // Enhanced methods for Phase 2 Real-Time Tracking

    public List<AmbulanceDTO> getAllAmbulances() {
        log.info("Getting all ambulances");
        List<Ambulance> ambulances = ambulanceRepository.findAll();
        return ambulances.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AmbulanceDTO createAmbulance(CreateAmbulanceDTO createDTO) {
        log.info("Creating new ambulance: {}", createDTO.getVehicleNumber());
        
        // Check if vehicle number already exists
        if (ambulanceRepository.existsByVehicleNumber(createDTO.getVehicleNumber())) {
            throw new RuntimeException("Ambulance with vehicle number " + createDTO.getVehicleNumber() + " already exists");
        }
        
        Ambulance ambulance = new Ambulance();
        ambulance.setVehicleNumber(createDTO.getVehicleNumber());
        ambulance.setHospitalId(createDTO.getHospitalId());
        ambulance.setType(createDTO.getType());
        ambulance.setStatus(AmbulanceStatus.AVAILABLE);
        ambulance.setDriverName(createDTO.getDriverName());
        ambulance.setDriverContact(createDTO.getDriverContact());
        ambulance.setCurrentLatitude(createDTO.getCurrentLatitude());
        ambulance.setCurrentLongitude(createDTO.getCurrentLongitude());
        
        Ambulance saved = ambulanceRepository.save(ambulance);
        log.info("Created ambulance with ID: {}", saved.getId());
        
        return convertToDTO(saved);
    }

    @Transactional
    public AmbulanceDTO updateAmbulanceStatus(UUID ambulanceId, AmbulanceStatus status) {
        log.info("Updating status for ambulance: {} to {}", ambulanceId, status);
        
        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new RuntimeException("Ambulance not found with ID: " + ambulanceId));
        
        ambulance.setStatus(status);
        ambulance.setUpdatedAt(LocalDateTime.now());
        
        Ambulance saved = ambulanceRepository.save(ambulance);
        log.info("Updated ambulance status successfully");
        
        return convertToDTO(saved);
    }
}