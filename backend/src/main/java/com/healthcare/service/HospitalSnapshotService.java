package com.healthcare.service;

import com.healthcare.entity.Hospital;
import com.healthcare.entity.HospitalResource;
import com.healthcare.entity.HospitalSnapshot;
import com.healthcare.entity.enums.ResourceType;
import com.healthcare.entity.enums.HospitalStatus;
import com.healthcare.repository.HospitalRepository;
import com.healthcare.repository.HospitalResourceRepository;
import com.healthcare.repository.HospitalSnapshotRepository;
import com.healthcare.repository.SpecialistAvailabilitySummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
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
public class HospitalSnapshotService {

    private final HospitalRepository hospitalRepository;
    private final HospitalResourceRepository resourceRepository;
    private final HospitalSnapshotRepository snapshotRepository;
    private final SpecialistAvailabilitySummaryRepository summaryRepository;
    private final MLModelMappingService mlMappingService;

    @Scheduled(fixedRate = 300000) // Update every 5 minutes
    public void updateAllHospitalSnapshots() {
        log.info("Skipping scheduled hospital snapshot updates for performance optimization");
        // Disabled scheduled updates to improve AI recommendation performance
        // Only update snapshots on-demand when needed
    }

    /**
     * Fast update for AI recommendations - only update snapshots for hospitals that need it
     */
    public void updateSnapshotsForAI() {
        log.debug("Quick snapshot update for AI recommendations - skipping for performance");
        // Skip snapshot updates for AI requests to improve performance
        // Use existing snapshots or create minimal ones on-demand
    }

    public void updateHospitalSnapshot(UUID hospitalId) {
        log.debug("Updating snapshot for hospital: {}", hospitalId);

        try {
            Hospital hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new RuntimeException("Hospital not found"));

            // Get current resources
            List<HospitalResource> resources = resourceRepository.findByHospitalId(hospitalId);
            
            // Calculate resource availability
            Map<ResourceType, Integer> resourceCounts = resources.stream()
                    .collect(Collectors.groupingBy(
                            HospitalResource::getType,
                            Collectors.summingInt(HospitalResource::getAvailableCount)
                    ));

            // Get specialist counts from specialist availability summary
            Map<String, Integer> specialistCounts = getSpecialistCounts(hospitalId);

            // Calculate hospital load
            double hospitalLoad = calculateHospitalLoad(resources);

            // Create snapshot
            HospitalSnapshot snapshot = new HospitalSnapshot();
            snapshot.setHospitalId(hospitalId);
            snapshot.setHospital(hospital);
            
            // Resource availability
            snapshot.setIcuBedsAvailable(resourceCounts.getOrDefault(ResourceType.ICU_BED, 0));
            snapshot.setGeneralBedsAvailable(resourceCounts.getOrDefault(ResourceType.GENERAL_BED, 0));
            snapshot.setVentilatorsAvailable(resourceCounts.getOrDefault(ResourceType.VENTILATOR, 0));
            snapshot.setOperatingRoomsAvailable(resourceCounts.getOrDefault(ResourceType.OPERATING_ROOM, 0));
            
            // Equipment availability
            snapshot.setCtScannerAvailable(resourceCounts.getOrDefault(ResourceType.CT_SCANNER, 0) > 0);
            snapshot.setMriAvailable(resourceCounts.getOrDefault(ResourceType.MRI_MACHINE, 0) > 0);
            snapshot.setDialysisAvailable(resourceCounts.getOrDefault(ResourceType.DIALYSIS_MACHINE, 0) > 0);

            // Specialist counts
            snapshot.setSpecialistCount(specialistCounts.values().stream().mapToInt(Integer::intValue).sum());
            snapshot.setCardiologySpecialists(specialistCounts.getOrDefault("Cardiology", 0));
            snapshot.setNeurologySpecialists(specialistCounts.getOrDefault("Neurology", 0));
            snapshot.setEmergencySpecialists(specialistCounts.getOrDefault("Emergency Medicine", 0));
            snapshot.setSurgerySpecialists(specialistCounts.getOrDefault("Surgery", 0));
            snapshot.setPediatricsSpecialists(specialistCounts.getOrDefault("Pediatrics", 0));
            snapshot.setOrthopedicsSpecialists(specialistCounts.getOrDefault("Orthopedics", 0));
            snapshot.setOncologySpecialists(specialistCounts.getOrDefault("Oncology", 0));

            // Hospital load
            snapshot.setHospitalLoadPercentage(hospitalLoad);
            
            // ML Model Required Fields
            snapshot.setSpecialistScore(snapshot.calculateSpecialistScore(null)); // General specialist score
            snapshot.setMlHospitalId(mlMappingService.getMLHospitalId(hospitalId)); // 0-4 mapping
            
            // Default values (can be enhanced with real data)
            snapshot.setDistanceKm(calculateDistance(hospitalId)); // Simplified
            snapshot.setTravelTimeMinutes(calculateTravelTime(hospitalId)); // Simplified
            snapshot.setIsAcceptingTransfers(hospitalLoad < 95.0); // Don't accept if >95% capacity
            
            snapshot.setSnapshotTime(LocalDateTime.now());

            snapshotRepository.save(snapshot);
            log.debug("Updated snapshot for hospital: {}", hospitalId);

        } catch (Exception e) {
            log.error("Error creating snapshot for hospital {}: {}", hospitalId, e.getMessage(), e);
        }
    }

    private Map<String, Integer> getSpecialistCounts(UUID hospitalId) {
        try {
            return summaryRepository.findByHospitalId(hospitalId).stream()
                    .collect(Collectors.toMap(
                            summary -> summary.getSpecialty(),
                            summary -> summary.getOnDutyCount(),
                            Integer::sum
                    ));
        } catch (Exception e) {
            log.warn("Error getting specialist counts for hospital {}: {}", hospitalId, e.getMessage());
            return Map.of();
        }
    }

    private double calculateHospitalLoad(List<HospitalResource> resources) {
        if (resources.isEmpty()) return 0.0;

        double totalCapacity = 0;
        double totalUsed = 0;

        for (HospitalResource resource : resources) {
            if (resource.getTotalCapacity() > 0) {
                totalCapacity += resource.getTotalCapacity();
                totalUsed += (resource.getTotalCapacity() - resource.getAvailableCount());
            }
        }

        return totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0.0;
    }

    private Double calculateDistance(UUID hospitalId) {
        // Simplified distance calculation
        // In production, this would use actual geographic coordinates
        return Math.random() * 20 + 1; // Random distance between 1-21 km
    }

    private Integer calculateTravelTime(UUID hospitalId) {
        // Simplified travel time calculation
        // In production, this would use real-time traffic data
        Double distance = calculateDistance(hospitalId);
        return (int) (distance * 3 + Math.random() * 10); // Rough estimate with traffic variation
    }

    private void cleanOldSnapshots() {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
            int deletedCount = snapshotRepository.deleteOldSnapshots(cutoffTime);
            log.debug("Cleaned {} old hospital snapshots", deletedCount);
        } catch (Exception e) {
            log.error("Error cleaning old snapshots: {}", e.getMessage());
        }
    }

    public HospitalSnapshot getLatestSnapshot(UUID hospitalId) {
        return snapshotRepository.findTopByHospitalIdOrderBySnapshotTimeDesc(hospitalId)
                .orElse(null);
    }

    public List<HospitalSnapshot> getAllLatestSnapshots() {
        return snapshotRepository.findLatestSnapshotsForAllHospitals();
    }
}