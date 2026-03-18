package com.healthcare.service;

import com.healthcare.dto.CreateResourceDTO;
import com.healthcare.dto.ResourceDTO;
import com.healthcare.dto.UpdateResourceDTO;
import com.healthcare.entity.Hospital;
import com.healthcare.entity.HospitalResource;
import com.healthcare.entity.enums.ResourceStatus;
import com.healthcare.entity.enums.ResourceType;
import com.healthcare.repository.HospitalRepository;
import com.healthcare.repository.HospitalResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final HospitalResourceRepository resourceRepository;
    private final HospitalRepository hospitalRepository;

    public List<ResourceDTO> getHospitalResources(UUID hospitalId) {
        // Validate hospital exists before querying resources
        if (!hospitalRepository.existsById(hospitalId)) {
            log.error("❌ Hospital not found with ID: {}", hospitalId);
            throw new IllegalArgumentException(
                String.format("Hospital with ID %s does not exist", hospitalId)
            );
        }
        
        List<HospitalResource> resources = resourceRepository.findByHospitalId(hospitalId);
        log.info("✅ Found {} resources for hospital: {}", resources.size(), hospitalId);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getResourcesByType(UUID hospitalId, ResourceType type) {
        // Validate hospital exists
        if (!hospitalRepository.existsById(hospitalId)) {
            log.error("❌ Hospital not found with ID: {}", hospitalId);
            throw new IllegalArgumentException(
                String.format("Hospital with ID %s does not exist", hospitalId)
            );
        }
        
        List<HospitalResource> resources = resourceRepository.findByHospitalIdAndType(hospitalId, type);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getCriticalResources(UUID hospitalId) {
        // Validate hospital exists
        if (!hospitalRepository.existsById(hospitalId)) {
            log.error("❌ Hospital not found with ID: {}", hospitalId);
            throw new IllegalArgumentException(
                String.format("Hospital with ID %s does not exist", hospitalId)
            );
        }
        
        List<HospitalResource> resources = resourceRepository.findCriticalResources(hospitalId);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> searchResources(UUID hospitalId, String search) {
        // Validate hospital exists
        if (!hospitalRepository.existsById(hospitalId)) {
            log.error("❌ Hospital not found with ID: {}", hospitalId);
            throw new IllegalArgumentException(
                String.format("Hospital with ID %s does not exist", hospitalId)
            );
        }
        
        List<HospitalResource> resources = resourceRepository.searchResources(hospitalId, search);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public ResourceDTO createResource(CreateResourceDTO dto) {
        log.info("Creating resource: {} for hospital: {}", dto.getName(), dto.getHospitalId());

        // CRITICAL: Validate hospital exists BEFORE attempting to create resource
        if (dto.getHospitalId() == null) {
            log.error("❌ Hospital ID is null");
            throw new IllegalArgumentException("Hospital ID is required");
        }

        // PRODUCTION-GRADE: Verify hospital exists in database with fresh query
        boolean hospitalExists = hospitalRepository.existsById(dto.getHospitalId());
        
        if (!hospitalExists) {
            log.error("❌ Hospital not found with ID: {}", dto.getHospitalId());
            log.error("❌ Attempted to query hospital but existsById returned false");
            throw new IllegalArgumentException(
                String.format("Hospital with ID %s does not exist. Please provide a valid hospital ID.", 
                dto.getHospitalId())
            );
        }
        
        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> {
                    log.error("❌ Hospital exists check passed but findById failed for ID: {}", dto.getHospitalId());
                    return new IllegalArgumentException(
                        String.format("Hospital with ID %s could not be loaded.", dto.getHospitalId())
                    );
                });
        
        log.info("✅ Hospital verified: {} (ID: {})", hospital.getName(), hospital.getId());

        try {
            HospitalResource resource = new HospitalResource();
            resource.setHospitalId(dto.getHospitalId());
            resource.setName(dto.getName());
            resource.setDescription(dto.getDescription());
            resource.setType(dto.getType());
            resource.setTotalCapacity(dto.getTotalCapacity() != null ? dto.getTotalCapacity() : 0);
            
            // Ensure null-safe defaults for all count fields
            resource.setAvailableCount(dto.getAvailableCount() != null ? dto.getAvailableCount() : 0);
            resource.setReservedCount(dto.getReservedCount() != null ? dto.getReservedCount() : 0);
            resource.setMaintenanceCount(dto.getMaintenanceCount() != null ? dto.getMaintenanceCount() : 0);
            resource.setStatus(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.AVAILABLE);
            
            resource.setUnitCost(dto.getUnitCost());
            resource.setReorderLevel(dto.getReorderLevel() != null ? dto.getReorderLevel() : 5); // Default reorder level
            resource.setSupplierInfo(dto.getSupplierInfo());
            resource.setLocationInfo(dto.getLocationInfo());
            resource.setCreatedAt(LocalDateTime.now());
            resource.setLastUpdated(LocalDateTime.now());

            // Auto-set status based on availability
            updateResourceStatus(resource);

            resource = resourceRepository.save(resource);
            log.info("✅ Created resource with ID: {} for hospital: {}", resource.getId(), hospital.getName());

            return convertToDTO(resource);
            
        } catch (Exception e) {
            log.error("❌ Error creating resource: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create resource: " + e.getMessage(), e);
        }
    }

    public ResourceDTO updateResource(UUID resourceId, UpdateResourceDTO dto) {
        log.info("Updating resource: {}", resourceId);

        HospitalResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (dto.getAvailableCount() != null) {
            resource.setAvailableCount(dto.getAvailableCount());
        }
        if (dto.getReservedCount() != null) {
            resource.setReservedCount(dto.getReservedCount());
        }
        if (dto.getMaintenanceCount() != null) {
            resource.setMaintenanceCount(dto.getMaintenanceCount());
        }
        if (dto.getStatus() != null) {
            resource.setStatus(dto.getStatus());
        }
        if (dto.getLocationInfo() != null) {
            resource.setLocationInfo(dto.getLocationInfo());
        }

        resource.setLastUpdated(LocalDateTime.now());

        // Ensure no null values before updating status
        if (resource.getAvailableCount() == null) {
            resource.setAvailableCount(0);
        }
        if (resource.getReservedCount() == null) {
            resource.setReservedCount(0);
        }
        if (resource.getMaintenanceCount() == null) {
            resource.setMaintenanceCount(0);
        }

        // Auto-update status based on new counts
        updateResourceStatus(resource);

        resource = resourceRepository.save(resource);
        log.info("Updated resource: {}", resourceId);

        return convertToDTO(resource);
    }

    public void deleteResource(UUID resourceId) {
        log.info("Deleting resource: {}", resourceId);
        resourceRepository.deleteById(resourceId);
    }

    public ResourceDTO getResourceById(UUID resourceId) {
        HospitalResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return convertToDTO(resource);
    }

    public Double getTotalInventoryValue(UUID hospitalId) {
        Double value = resourceRepository.getTotalInventoryValue(hospitalId);
        return value != null ? value : 0.0;
    }

    public Long getCriticalResourceCount(UUID hospitalId) {
        return resourceRepository.getCriticalResourceCount(hospitalId);
    }

    private void updateResourceStatus(HospitalResource resource) {
        // Ensure availableCount is not null
        Integer availableCount = resource.getAvailableCount();
        if (availableCount == null) {
            availableCount = 0;
            resource.setAvailableCount(0);
        }
        
        if (availableCount == 0) {
            resource.setStatus(ResourceStatus.DEPLETED);
        } else if (resource.isCriticalLevel()) {
            resource.setStatus(ResourceStatus.CRITICAL_LOW);
        } else if (availableCount > 0) {
            resource.setStatus(ResourceStatus.AVAILABLE);
        }
    }

    private ResourceDTO convertToDTO(HospitalResource resource) {
        return ResourceDTO.builder()
                .id(resource.getId())
                .hospitalId(resource.getHospitalId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .totalCapacity(resource.getTotalCapacity() != null ? resource.getTotalCapacity() : 0)
                .availableCount(resource.getAvailableCount() != null ? resource.getAvailableCount() : 0)
                .reservedCount(resource.getReservedCount() != null ? resource.getReservedCount() : 0)
                .maintenanceCount(resource.getMaintenanceCount() != null ? resource.getMaintenanceCount() : 0)
                .usedCount(resource.getUsedCount())
                .status(resource.getStatus())
                .unitCost(resource.getUnitCost())
                .reorderLevel(resource.getReorderLevel())
                .supplierInfo(resource.getSupplierInfo())
                .locationInfo(resource.getLocationInfo())
                .lastUpdated(resource.getLastUpdated())
                .createdAt(resource.getCreatedAt())
                .updatedBy(resource.getUpdatedBy())
                .utilizationPercentage(resource.getUtilizationPercentage())
                .availabilityPercentage(resource.getAvailabilityPercentage())
                .isCriticalLevel(resource.isCriticalLevel())
                .build();
    }
}