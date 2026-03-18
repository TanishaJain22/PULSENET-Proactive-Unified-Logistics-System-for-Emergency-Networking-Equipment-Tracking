package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.healthcare.entity.enums.AmbulanceStatus;
import com.healthcare.entity.enums.AmbulanceType;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ambulance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmbulanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    @JsonIgnore
    private Hospital hospital;

    @Column(name = "ambulance_id")
    private UUID ambulanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_id", insertable = false, updatable = false)
    @JsonIgnore
    private Ambulance ambulance;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_contact")
    private String patientContact;

    @Column(name = "pickup_location", nullable = false)
    private String pickupLocation;

    @Column(name = "pickup_latitude")
    private Double pickupLatitude;

    @Column(name = "pickup_longitude")
    private Double pickupLongitude;

    @Column(name = "destination_location")
    private String destinationLocation;

    @Column(name = "destination_latitude")
    private Double destinationLatitude;

    @Column(name = "destination_longitude")
    private Double destinationLongitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "ambulance_type_requested")
    private AmbulanceType ambulanceTypeRequested;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AmbulanceStatus status = AmbulanceStatus.DISPATCHED;

    @Column(name = "emergency_details")
    private String emergencyDetails;

    @Column(name = "estimated_arrival_time")
    private LocalDateTime estimatedArrivalTime;

    @Column(name = "actual_arrival_time")
    private LocalDateTime actualArrivalTime;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "request_time", nullable = false)
    private LocalDateTime requestTime = LocalDateTime.now();

    @Column(name = "approved_by_hospital")
    private Boolean approvedByHospital = false;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Helper methods
    public boolean isActive() {
        return status == AmbulanceStatus.DISPATCHED || 
               status == AmbulanceStatus.EN_ROUTE || 
               status == AmbulanceStatus.AT_SCENE ||
               status == AmbulanceStatus.PATIENT_PICKED;
    }

    public boolean isCompleted() {
        return completionTime != null;
    }

    public String getPickupLocationString() {
        if (pickupLatitude != null && pickupLongitude != null) {
            return String.format("%s (%.6f, %.6f)", pickupLocation, pickupLatitude, pickupLongitude);
        }
        return pickupLocation;
    }

    public String getDestinationLocationString() {
        if (destinationLatitude != null && destinationLongitude != null) {
            return String.format("%s (%.6f, %.6f)", destinationLocation, destinationLatitude, destinationLongitude);
        }
        return destinationLocation;
    }
}