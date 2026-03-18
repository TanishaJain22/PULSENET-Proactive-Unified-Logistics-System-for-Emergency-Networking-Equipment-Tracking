package com.healthcare.controller;

import com.healthcare.dto.CreatePatientDTO;
import com.healthcare.dto.PatientDTO;
import com.healthcare.entity.enums.PatientStatus;
import com.healthcare.service.PatientService;
import com.healthcare.service.PatientPDFService;
import com.healthcare.service.QRCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PatientController {
    
    private final PatientService patientService;
    private final PatientPDFService patientPDFService;
    private final QRCodeService qrCodeService;
    
    /**
     * Create a new patient
     */
    @PostMapping
    public ResponseEntity<?> createPatient(@Valid @RequestBody CreatePatientDTO createPatientDTO) {
        try {
            log.info("Creating new patient: {} {}", createPatientDTO.getFirstName(), createPatientDTO.getLastName());
            PatientDTO patient = patientService.createPatient(createPatientDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(patient);
        } catch (RuntimeException e) {
            log.error("Error creating patient: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error creating patient: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating patient", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error occurred while creating patient");
        }
    }
    
    /**
     * Get all patients with pagination
     */
    @GetMapping
    public ResponseEntity<Page<PatientDTO>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<PatientDTO> patients = patientService.getAllPatients(pageable);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("Error fetching patients", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get patient by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable UUID id) {
        try {
            return patientService.getPatientById(id)
                    .map(patient -> ResponseEntity.ok(patient))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching patient with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching patient");
        }
    }
    
    /**
     * Get patient by medical record number
     */
    @GetMapping("/medical-record/{medicalRecordNumber}")
    public ResponseEntity<?> getPatientByMedicalRecordNumber(@PathVariable String medicalRecordNumber) {
        try {
            return patientService.getPatientByMedicalRecordNumber(medicalRecordNumber)
                    .map(patient -> ResponseEntity.ok(patient))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching patient with medical record number: {}", medicalRecordNumber, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching patient");
        }
    }
    
    /**
     * Get patient by QR code (for emergency access)
     */
    @GetMapping("/qr/{qrCodeId}")
    public ResponseEntity<?> getPatientByQrCode(@PathVariable String qrCodeId) {
        try {
            return patientService.getPatientByQrCode(qrCodeId)
                    .map(patient -> ResponseEntity.ok(patient))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching patient with QR code: {}", qrCodeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching patient");
        }
    }
    
    /**
     * Search patients
     */
    @GetMapping("/search")
    public ResponseEntity<Page<PatientDTO>> searchPatients(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
            Page<PatientDTO> patients = patientService.searchPatients(query, pageable);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("Error searching patients with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get patients by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<PatientDTO>> getPatientsByStatus(
            @PathVariable PatientStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
            Page<PatientDTO> patients = patientService.getPatientsByStatus(status, pageable);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("Error fetching patients with status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get patients with emergency access enabled
     */
    @GetMapping("/emergency-access")
    public ResponseEntity<List<PatientDTO>> getPatientsWithEmergencyAccess() {
        try {
            List<PatientDTO> patients = patientService.getPatientsWithEmergencyAccess();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("Error fetching patients with emergency access", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update patient
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePatientDTO updatePatientDTO) {
        
        try {
            PatientDTO updatedPatient = patientService.updatePatient(id, updatePatientDTO);
            return ResponseEntity.ok(updatedPatient);
        } catch (RuntimeException e) {
            log.error("Error updating patient with ID: {}", id, e);
            return ResponseEntity.badRequest().body("Error updating patient: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error updating patient with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error occurred while updating patient");
        }
    }
    
    /**
     * Deactivate patient (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivatePatient(@PathVariable UUID id) {
        try {
            patientService.deactivatePatient(id);
            return ResponseEntity.ok().body("Patient deactivated successfully");
        } catch (RuntimeException e) {
            log.error("Error deactivating patient with ID: {}", id, e);
            return ResponseEntity.badRequest().body("Error deactivating patient: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error deactivating patient with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error occurred while deactivating patient");
        }
    }
    
    /**
     * Reactivate patient
     */
    @PutMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivatePatient(@PathVariable UUID id) {
        try {
            patientService.reactivatePatient(id);
            return ResponseEntity.ok().body("Patient reactivated successfully");
        } catch (RuntimeException e) {
            log.error("Error reactivating patient with ID: {}", id, e);
            return ResponseEntity.badRequest().body("Error reactivating patient: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error reactivating patient with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error occurred while reactivating patient");
        }
    }
    
    /**
     * Get patient statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getPatientStatistics() {
        try {
            PatientService.PatientStatisticsDTO statistics = patientService.getPatientStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error fetching patient statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching patient statistics");
        }
    }

    /**
     * Generate and download patient PDF report by QR code
     */
    @GetMapping("/qr/{qrCodeId}/pdf")
    public ResponseEntity<byte[]> downloadPatientPDFByQrCode(@PathVariable String qrCodeId) {
        try {
            log.info("Generating PDF report for QR code: {}", qrCodeId);
            
            // Get patient by QR code
            return patientService.getPatientByQrCode(qrCodeId)
                    .map(patientDTO -> {
                        try {
                            // Convert DTO to entity for PDF generation
                            var patient = patientService.getPatientEntityByQrCode(qrCodeId)
                                    .orElseThrow(() -> new RuntimeException("Patient not found"));
                            
                            // Generate PDF
                            byte[] pdfBytes = patientPDFService.generatePatientReport(patient);
                            
                            // Set headers for PDF download
                            HttpHeaders headers = new HttpHeaders();
                            headers.setContentType(MediaType.APPLICATION_PDF);
                            headers.setContentDispositionFormData("attachment", 
                                "patient_report_" + patient.getMedicalRecordNumber() + ".pdf");
                            headers.setContentLength(pdfBytes.length);
                            
                            log.info("PDF report generated successfully for patient: {}", patient.getFullName());
                            return ResponseEntity.ok()
                                    .headers(headers)
                                    .body(pdfBytes);
                                    
                        } catch (Exception e) {
                            log.error("Error generating PDF for QR code: {}", qrCodeId, e);
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .<byte[]>build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            log.error("Error processing PDF request for QR code: {}", qrCodeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate and download patient PDF report by patient ID
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPatientPDF(@PathVariable UUID id) {
        try {
            log.info("Generating PDF report for patient ID: {}", id);
            
            return patientService.getPatientEntityById(id)
                    .map(patient -> {
                        try {
                            // Generate PDF
                            byte[] pdfBytes = patientPDFService.generatePatientReport(patient);
                            
                            // Set headers for PDF download
                            HttpHeaders headers = new HttpHeaders();
                            headers.setContentType(MediaType.APPLICATION_PDF);
                            headers.setContentDispositionFormData("attachment", 
                                "patient_report_" + patient.getMedicalRecordNumber() + ".pdf");
                            headers.setContentLength(pdfBytes.length);
                            
                            log.info("PDF report generated successfully for patient: {}", patient.getFullName());
                            return ResponseEntity.ok()
                                    .headers(headers)
                                    .body(pdfBytes);
                                    
                        } catch (Exception e) {
                            log.error("Error generating PDF for patient ID: {}", id, e);
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .<byte[]>build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            log.error("Error processing PDF request for patient ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate QR code image for patient
     */
    @GetMapping("/{id}/qr-image")
    public ResponseEntity<byte[]> getPatientQRCodeImage(@PathVariable UUID id) {
        try {
            return patientService.getPatientEntityById(id)
                    .map(patient -> {
                        try {
                            // Generate QR code image
                            byte[] qrCodeBytes = qrCodeService.generatePatientPDFQRCode(patient.getQrCodeId());
                            
                            // Set headers for image
                            HttpHeaders headers = new HttpHeaders();
                            headers.setContentType(MediaType.IMAGE_PNG);
                            headers.setContentDispositionFormData("inline", 
                                "qr_code_" + patient.getQrCodeId() + ".png");
                            headers.setContentLength(qrCodeBytes.length);
                            
                            return ResponseEntity.ok()
                                    .headers(headers)
                                    .body(qrCodeBytes);
                                    
                        } catch (Exception e) {
                            log.error("Error generating QR code for patient ID: {}", id, e);
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .<byte[]>build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            log.error("Error processing QR code request for patient ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate QR code image by QR code ID
     */
    @GetMapping("/qr/{qrCodeId}/image")
    public ResponseEntity<byte[]> getQRCodeImage(@PathVariable String qrCodeId) {
        try {
            return patientService.getPatientByQrCode(qrCodeId)
                    .map(patientDTO -> {
                        try {
                            // Generate QR code image
                            byte[] qrCodeBytes = qrCodeService.generatePatientPDFQRCode(qrCodeId);
                            
                            // Set headers for image
                            HttpHeaders headers = new HttpHeaders();
                            headers.setContentType(MediaType.IMAGE_PNG);
                            headers.setContentDispositionFormData("inline", 
                                "qr_code_" + qrCodeId + ".png");
                            headers.setContentLength(qrCodeBytes.length);
                            
                            return ResponseEntity.ok()
                                    .headers(headers)
                                    .body(qrCodeBytes);
                                    
                        } catch (Exception e) {
                            log.error("Error generating QR code for QR ID: {}", qrCodeId, e);
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .<byte[]>build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            log.error("Error processing QR code image request for QR ID: {}", qrCodeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}