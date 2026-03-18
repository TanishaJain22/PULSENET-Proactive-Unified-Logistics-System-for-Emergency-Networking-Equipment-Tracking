package com.healthcare.dto;

import com.healthcare.entity.enums.AvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAvailabilityDTO {
    private AvailabilityStatus status;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private String notes;
}