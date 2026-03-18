package com.healthcare.dto;

import com.healthcare.entity.enums.ResourceType;
import com.healthcare.entity.enums.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDTO {
    private UUID id;
    private UUID hospitalId;
    private String name;
    private String description;
    private ResourceType type;
    private Integer totalCapacity;
    private Integer availableCount;
    private Integer reservedCount;
    private Integer maintenanceCount;
    private Integer usedCount;
    private ResourceStatus status;
    private Double unitCost;
    private Integer reorderLevel;
    private String supplierInfo;
    private String locationInfo;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    private UUID updatedBy;
    private Double utilizationPercentage;
    private Double availabilityPercentage;
    private Boolean isCriticalLevel;
}