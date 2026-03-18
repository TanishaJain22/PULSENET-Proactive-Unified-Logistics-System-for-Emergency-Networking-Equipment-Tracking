package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctor_specialties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSpecialty {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private Doctor doctor;

    @Column(name = "specialty_name", nullable = false)
    private String specialtyName;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "certification_date")
    private LocalDate certificationDate;

    @Column(name = "certification_body")
    private String certificationBody;

    @CreationTimestamp
    private LocalDateTime createdAt;
}