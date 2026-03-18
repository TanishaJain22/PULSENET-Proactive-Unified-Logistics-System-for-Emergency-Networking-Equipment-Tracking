package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "hospital_infrastructure")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalInfrastructure {

    @Id
    @Column(name = "hospital_id")
    private UUID hospitalId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    @MapsId
    private Hospital hospital;

    @Column(name = "icu_beds")
    private Integer icuBeds;

    @Column(name = "general_beds")
    private Integer generalBeds;

    @Column(name = "emergency_beds")
    private Integer emergencyBeds;

    private Integer ventilators;

    @Column(name = "operating_rooms")
    private Integer operatingRooms;
}