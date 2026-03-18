package com.healthcare.dto;

import com.healthcare.entity.enums.AvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDoctorDTO {
    private UUID hospitalId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private List<String> specialties;
    private List<QualificationDTO> qualifications;
    private AvailabilityStatus initialStatus;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private String notes;
}