package com.healthcare.controller;

import com.healthcare.entity.Emergency;
import com.healthcare.entity.enums.EmergencyStatus;
import com.healthcare.service.EmergencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emergencies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmergencyController {

    private final EmergencyService emergencyService;

    @PostMapping
    public ResponseEntity<Emergency> createEmergency(@RequestBody Emergency emergency) {
        return ResponseEntity.ok(emergencyService.createEmergency(emergency));
    }

    @GetMapping
    public ResponseEntity<Page<Emergency>> getEmergencies(
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) EmergencyStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        if (status != null) {
            return ResponseEntity.ok(emergencyService.getEmergenciesByHospitalAndStatus(
                hospitalId, status, PageRequest.of(page, size)));
        }
        
        return ResponseEntity.ok(Page.empty());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Emergency>> getActiveEmergencies(@RequestParam UUID hospitalId) {
        return ResponseEntity.ok(emergencyService.getActiveEmergencies(hospitalId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Emergency> getEmergency(@PathVariable UUID id) {
        return ResponseEntity.ok(emergencyService.getEmergencyById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Emergency> updateStatus(
            @PathVariable UUID id,
            @RequestParam EmergencyStatus status) {
        return ResponseEntity.ok(emergencyService.updateEmergencyStatus(id, status));
    }
}
