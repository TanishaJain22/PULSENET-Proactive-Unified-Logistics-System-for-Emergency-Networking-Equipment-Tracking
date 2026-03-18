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
public class DoctorResponseDTO {
    private UUID id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private LocalDate hireDate;
    private List<String> specialties;
    private List<QualificationDTO> qualifications;
    private Integer yearsOfExperience;
    private AvailabilityStatus availabilityStatus;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private String notes;
    private Boolean isActive;
}