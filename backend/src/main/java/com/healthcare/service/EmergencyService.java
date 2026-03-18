package com.healthcare.service;

import com.healthcare.entity.Emergency;
import com.healthcare.entity.enums.EmergencyStatus;
import com.healthcare.repository.EmergencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmergencyService {

    private final EmergencyRepository emergencyRepository;

    public Emergency createEmergency(Emergency emergency) {
        emergency.setCreatedAt(LocalDateTime.now());
        emergency.setUpdatedAt(LocalDateTime.now());
        return emergencyRepository.save(emergency);
    }

    public Page<Emergency> getEmergenciesByHospitalAndStatus(UUID hospitalId, EmergencyStatus status, Pageable pageable) {
        return emergencyRepository.findByHospitalIdAndStatus(hospitalId, status, pageable);
    }

    public List<Emergency> getActiveEmergencies(UUID hospitalId) {
        return emergencyRepository.findByHospitalIdAndStatusIn(
            hospitalId, 
            List.of(EmergencyStatus.INCOMING, EmergencyStatus.DISPATCHED)
        );
    }

    public Emergency getEmergencyById(UUID id) {
        return emergencyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Emergency not found"));
    }

    @Transactional
    public Emergency updateEmergencyStatus(UUID id, EmergencyStatus status) {
        Emergency emergency = getEmergencyById(id);
        emergency.setStatus(status);
        emergency.setUpdatedAt(LocalDateTime.now());
        
        if (status == EmergencyStatus.ARRIVED) {
            emergency.setArrivalTime(LocalDateTime.now());
        }
        
        return emergencyRepository.save(emergency);
    }

    public long countByStatus(UUID hospitalId, EmergencyStatus status) {
        return emergencyRepository.countByHospitalIdAndStatus(hospitalId, status);
    }
}
