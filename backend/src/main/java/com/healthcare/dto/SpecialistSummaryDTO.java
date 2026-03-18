package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistSummaryDTO {
    private String specialty;
    private Integer totalDoctors;
    private Integer onDutyCount;
    private Integer offDutyCount;
    private Integer onLeaveCount;
    private LocalDateTime lastCalculated;
}