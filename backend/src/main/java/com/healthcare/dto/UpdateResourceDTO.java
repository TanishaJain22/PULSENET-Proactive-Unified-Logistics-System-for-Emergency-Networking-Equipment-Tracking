package com.healthcare.dto;

import com.healthcare.entity.enums.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResourceDTO {
    private Integer availableCount;
    private Integer reservedCount;
    private Integer maintenanceCount;
    private ResourceStatus status;
    private String locationInfo;
    private String notes;
}