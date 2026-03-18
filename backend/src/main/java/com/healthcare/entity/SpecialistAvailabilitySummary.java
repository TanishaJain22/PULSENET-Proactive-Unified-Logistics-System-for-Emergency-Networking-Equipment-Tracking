package com.healthcare.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "specialist_availability_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistAvailabilitySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    @JsonIgnore
    private Hospital hospital;

    @Column(nullable = false)
    private String specialty;

    @Column(name = "total_doctors", nullable = false)
    private Integer totalDoctors;

    @Column(name = "on_duty_count", nullable = false)
    private Integer onDutyCount;

    @Column(name = "off_duty_count", nullable = false)
    private Integer offDutyCount;

    @Column(name = "on_leave_count", nullable = false)
    private Integer onLeaveCount;

    @Column(name = "last_calculated")
    private LocalDateTime lastCalculated;
}