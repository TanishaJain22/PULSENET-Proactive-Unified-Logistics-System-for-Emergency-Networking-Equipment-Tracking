package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ambulance_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmbulanceLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "ambulance_id", nullable = false)
    private UUID ambulanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_id", insertable = false, updatable = false)
    private Ambulance ambulance;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "speed")
    private Double speed; // km/h

    @Column(name = "heading")
    private Double heading; // degrees

    @Column(name = "accuracy")
    private Double accuracy; // meters

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Helper methods
    public String getLocationString() {
        return String.format("%.6f, %.6f", latitude, longitude);
    }

    public boolean isRecentLocation(int minutesThreshold) {
        return timestamp.isAfter(LocalDateTime.now().minusMinutes(minutesThreshold));
    }
}