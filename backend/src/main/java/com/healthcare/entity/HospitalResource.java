package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.healthcare.entity.enums.ResourceType;
import com.healthcare.entity.enums.ResourceStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospital_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalResource {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private Hospital hospital;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity = 0;

    @Column(name = "available_count", nullable = false)
    private Integer availableCount = 0;

    @Column(name = "reserved_count", nullable = false)
    private Integer reservedCount = 0;

    @Column(name = "maintenance_count", nullable = false)
    private Integer maintenanceCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    @Column(name = "unit_cost")
    private Double unitCost;

    @Column(name = "reorder_level")
    private Integer reorderLevel;

    @Column(name = "supplier_info")
    private String supplierInfo;

    @Column(name = "location_info")
    private String locationInfo;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_by")
    private UUID updatedBy;

    // Helper methods
    public Integer getUsedCount() {
        int reserved = (reservedCount != null) ? reservedCount : 0;
        int maintenance = (maintenanceCount != null) ? maintenanceCount : 0;
        int available = (availableCount != null) ? availableCount : 0;
        int total = (totalCapacity != null) ? totalCapacity : 0;
        
        return total - available - reserved - maintenance;
    }

    public Double getUtilizationPercentage() {
        if (totalCapacity == null || totalCapacity == 0) return 0.0;
        return ((double) getUsedCount() / totalCapacity) * 100;
    }

    public Double getAvailabilityPercentage() {
        if (totalCapacity == null || totalCapacity == 0) return 0.0;
        int available = (availableCount != null) ? availableCount : 0;
        return ((double) available / totalCapacity) * 100;
    }

    public boolean isCriticalLevel() {
        if (reorderLevel == null || availableCount == null) return false;
        return availableCount <= reorderLevel;
    }
}