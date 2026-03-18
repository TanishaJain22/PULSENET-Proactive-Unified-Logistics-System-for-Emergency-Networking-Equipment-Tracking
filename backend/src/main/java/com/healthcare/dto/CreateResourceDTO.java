package com.healthcare.dto;

import com.healthcare.entity.enums.ResourceType;
import com.healthcare.entity.enums.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateResourceDTO {
    private UUID hospitalId;
    private String name;
    private String description;
    private ResourceType type;
    private Integer totalCapacity;
    private Integer availableCount;
    private Integer reservedCount = 0;
    private Integer maintenanceCount = 0;
    private ResourceStatus status = ResourceStatus.AVAILABLE;
    private Double unitCost;
    private Integer reorderLevel;
    private String supplierInfo;
    private String locationInfo;
}