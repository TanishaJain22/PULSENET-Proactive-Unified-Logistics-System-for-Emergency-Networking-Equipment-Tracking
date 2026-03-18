package com.healthcare.service;

import com.healthcare.dto.CreatePatientDTO;
import com.healthcare.dto.PatientDTO;
import com.healthcare.entity.Patient;
import com.healthcare.entity.enums.PatientStatus;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientService {
    
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    
    /**
     * Create a new patient
     */
    public PatientDTO createPatient(CreatePatientDTO createPatientDTO) {
        log.info("Creating new patient: {} {}", createPatientDTO.getFirstName(), createPatientDTO.getLastName());
        
        // Validate unique constraints
        validateUniqueFields(createPatientDTO);
        
        // Create patient entity
        Patient patient = mapToEntity(createPatientDTO);
        
        // Generate medical record number and QR code ID
        patient.setMedicalRecordNumber(generateMedicalRecordNumber());
        patient.setQrCodeId(generateQrCodeId());
        patient.setStatus(PatientStatus.ACTIVE);
        
        // Save patient
        Patient savedPatient = patientRepository.save(patient);
        
        log.info("Patient created successfully with ID: {}", savedPatient.getId());
        return mapToDTO(savedPatient);
    }
    
    /**
     * Get patient by ID
     */
    @Transactional(readOnly = true)
    public Optional<PatientDTO> getPatientById(UUID id) {
        return patientRepository.findById(id)
                .map(this::mapToDTO);
    }
    
    /**
     * Get patient by medical record number
     */
    @Transactional(readOnly = true)
    public Optional<PatientDTO> getPatientByMedicalRecordNumber(String medicalRecordNumber) {
        return patientRepository.findByMedicalRecordNumber(medicalRecordNumber)
                .map(this::mapToDTO);
    }
    
    /**
     * Get patient by QR code ID (for emergency access)
     */
    @Transactional(readOnly = true)
    public Optional<PatientDTO> getPatientByQrCode(String qrCodeId) {
        return patientRepository.findByQrCodeId(qrCodeId)
                .map(this::mapToDTO);
    }
    
    /**
     * Update patient information
     */
    public PatientDTO updatePatient(UUID id, CreatePatientDTO updatePatientDTO) {
        log.info("Updating patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
        
        // Validate unique constraints (excluding current patient)
        validateUniqueFieldsForUpdate(updatePatientDTO, id);
        
        // Update patient fields
        updatePatientFields(patient, updatePatientDTO);
        
        Patient updatedPatient = patientRepository.save(patient);
        
        log.info("Patient updated successfully: {}", id);
        return mapToDTO(updatedPatient);
    }
    
    /**
     * Get all patients with pagination
     */
    @Transactional(readOnly = true)
    public Page<PatientDTO> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable)
                .map(this::mapToDTO);
    }
    
    /**
     * Search patients
     */
    @Transactional(readOnly = true)
    public Page<PatientDTO> searchPatients(String searchTerm, Pageable pageable) {
        return patientRepository.searchPatients(searchTerm, pageable)
                .map(this::mapToDTO);
    }
    
    /**
     * Get patients by status
     */
    @Transactional(readOnly = true)
    public Page<PatientDTO> getPatientsByStatus(PatientStatus status, Pageable pageable) {
        return patientRepository.findByStatus(status, pageable)
                .map(this::mapToDTO);
    }
    
    /**
     * Get patients with emergency access enabled
     */
    @Transactional(readOnly = true)
    public List<PatientDTO> getPatientsWithEmergencyAccess() {
        return patientRepository.findByIsEmergencyAccessEnabledTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Deactivate patient (soft delete)
     */
    public void deactivatePatient(UUID id) {
        log.info("Deactivating patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
        
        patient.setStatus(PatientStatus.INACTIVE);
        patientRepository.save(patient);
        
        log.info("Patient deactivated successfully: {}", id);
    }
    
    /**
     * Reactivate patient
     */
    public void reactivatePatient(UUID id) {
        log.info("Reactivating patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
        
        patient.setStatus(PatientStatus.ACTIVE);
        patientRepository.save(patient);
        
        log.info("Patient reactivated successfully: {}", id);
    }
    
    /**
     * Get patient statistics
     */
    @Transactional(readOnly = true)
    public PatientStatisticsDTO getPatientStatistics() {
        PatientStatisticsDTO stats = new PatientStatisticsDTO();
        
        stats.setTotalPatients(patientRepository.count());
        stats.setActivePatients(patientRepository.countByStatus(PatientStatus.ACTIVE));
        stats.setInactivePatients(patientRepository.countByStatus(PatientStatus.INACTIVE));
        stats.setEmergencyAccessEnabled((long) patientRepository.findByIsEmergencyAccessEnabledTrue().size());
        
        return stats;
    }
    
    // Private helper methods
    
    private void validateUniqueFields(CreatePatientDTO dto) {
        if (dto.getPhoneNumber() != null && patientRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists: " + dto.getPhoneNumber());
        }
        
        if (dto.getEmail() != null && patientRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists: " + dto.getEmail());
        }
        
        if (dto.getNationalId() != null && patientRepository.existsByNationalId(dto.getNationalId())) {
            throw new RuntimeException("National ID already exists: " + dto.getNationalId());
        }
    }
    
    private void validateUniqueFieldsForUpdate(CreatePatientDTO dto, UUID currentPatientId) {
        if (dto.getPhoneNumber() != null) {
            patientRepository.findByPhoneNumber(dto.getPhoneNumber())
                    .ifPresent(patient -> {
                        if (!patient.getId().equals(currentPatientId)) {
                            throw new RuntimeException("Phone number already exists: " + dto.getPhoneNumber());
                        }
                    });
        }
        
        if (dto.getEmail() != null) {
            patientRepository.findByEmail(dto.getEmail())
                    .ifPresent(patient -> {
                        if (!patient.getId().equals(currentPatientId)) {
                            throw new RuntimeException("Email already exists: " + dto.getEmail());
                        }
                    });
        }
        
        if (dto.getNationalId() != null) {
            patientRepository.findByNationalId(dto.getNationalId())
                    .ifPresent(patient -> {
                        if (!patient.getId().equals(currentPatientId)) {
                            throw new RuntimeException("National ID already exists: " + dto.getNationalId());
                        }
                    });
        }
    }
    
    private String generateMedicalRecordNumber() {
        // Generate unique medical record number
        String prefix = "MRN";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int) (Math.random() * 1000));
        return prefix + timestamp.substring(timestamp.length() - 8) + random;
    }
    
    private String generateQrCodeId() {
        // Generate unique QR code ID for emergency access
        return "QR" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
    
    private Patient mapToEntity(CreatePatientDTO dto) {
        Patient patient = new Patient();
        
        // Basic Demographics
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodType(dto.getBloodType());
        
        // Contact Information
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());
        patient.setCity(dto.getCity());
        patient.setState(dto.getState());
        patient.setZipCode(dto.getZipCode());
        patient.setCountry(dto.getCountry());
        
        // Identification
        patient.setNationalId(dto.getNationalId());
        
        // Emergency Contact
        patient.setEmergencyContactName(dto.getEmergencyContactName());
        patient.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        patient.setEmergencyContactRelation(dto.getEmergencyContactRelation());
        
        // Medical Information
        patient.setAllergies(dto.getAllergies());
        patient.setChronicConditions(dto.getChronicConditions());
        patient.setCurrentMedications(dto.getCurrentMedications());
        patient.setMedicalNotes(dto.getMedicalNotes());
        
        // Insurance Information
        patient.setInsuranceProvider(dto.getInsuranceProvider());
        patient.setInsurancePolicyNumber(dto.getInsurancePolicyNumber());
        patient.setInsuranceGroupNumber(dto.getInsuranceGroupNumber());
        
        // System Fields
        patient.setIsEmergencyAccessEnabled(dto.getIsEmergencyAccessEnabled());
        
        return patient;
    }
    
    private void updatePatientFields(Patient patient, CreatePatientDTO dto) {
        // Basic Demographics
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodType(dto.getBloodType());
        
        // Contact Information
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());
        patient.setCity(dto.getCity());
        patient.setState(dto.getState());
        patient.setZipCode(dto.getZipCode());
        patient.setCountry(dto.getCountry());
        
        // Identification
        patient.setNationalId(dto.getNationalId());
        
        // Emergency Contact
        patient.setEmergencyContactName(dto.getEmergencyContactName());
        patient.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        patient.setEmergencyContactRelation(dto.getEmergencyContactRelation());
        
        // Medical Information
        patient.setAllergies(dto.getAllergies());
        patient.setChronicConditions(dto.getChronicConditions());
        patient.setCurrentMedications(dto.getCurrentMedications());
        patient.setMedicalNotes(dto.getMedicalNotes());
        
        // Insurance Information
        patient.setInsuranceProvider(dto.getInsuranceProvider());
        patient.setInsurancePolicyNumber(dto.getInsurancePolicyNumber());
        patient.setInsuranceGroupNumber(dto.getInsuranceGroupNumber());
        
        // System Fields
        patient.setIsEmergencyAccessEnabled(dto.getIsEmergencyAccessEnabled());
    }
    
    private PatientDTO mapToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        
        dto.setId(patient.getId());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setBloodType(patient.getBloodType());
        
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setEmail(patient.getEmail());
        dto.setAddress(patient.getAddress());
        dto.setCity(patient.getCity());
        dto.setState(patient.getState());
        dto.setZipCode(patient.getZipCode());
        dto.setCountry(patient.getCountry());
        
        dto.setNationalId(patient.getNationalId());
        dto.setMedicalRecordNumber(patient.getMedicalRecordNumber());
        
        dto.setEmergencyContactName(patient.getEmergencyContactName());
        dto.setEmergencyContactPhone(patient.getEmergencyContactPhone());
        dto.setEmergencyContactRelation(patient.getEmergencyContactRelation());
        
        dto.setAllergies(patient.getAllergies());
        dto.setChronicConditions(patient.getChronicConditions());
        dto.setCurrentMedications(patient.getCurrentMedications());
        dto.setMedicalNotes(patient.getMedicalNotes());
        
        dto.setInsuranceProvider(patient.getInsuranceProvider());
        dto.setInsurancePolicyNumber(patient.getInsurancePolicyNumber());
        dto.setInsuranceGroupNumber(patient.getInsuranceGroupNumber());
        
        dto.setStatus(patient.getStatus());
        dto.setIsEmergencyAccessEnabled(patient.getIsEmergencyAccessEnabled());
        dto.setQrCodeId(patient.getQrCodeId());
        
        // Computed fields
        dto.setFullName(patient.getFullName());
        dto.setAge(patient.getAge());
        dto.setFormattedAddress(patient.getFormattedAddress());
        
        dto.setCreatedAt(patient.getCreatedAt());
        dto.setUpdatedAt(patient.getUpdatedAt());
        dto.setCreatedBy(patient.getCreatedBy());
        dto.setUpdatedBy(patient.getUpdatedBy());
        
        // Add visit statistics
        Long visitCount = visitRepository.countByPatientId(patient.getId());
        dto.setTotalVisits(visitCount);
        
        return dto;
    }

    /**
     * Get patient entity by QR code (for internal use)
     */
    public Optional<Patient> getPatientEntityByQrCode(String qrCodeId) {
        return patientRepository.findByQrCodeId(qrCodeId);
    }

    /**
     * Get patient entity by ID (for internal use)
     */
    public Optional<Patient> getPatientEntityById(UUID id) {
        return patientRepository.findById(id);
    }
    
    // Inner class for statistics
    public static class PatientStatisticsDTO {
        private Long totalPatients;
        private Long activePatients;
        private Long inactivePatients;
        private Long emergencyAccessEnabled;
        
        // Getters and Setters
        public Long getTotalPatients() {
            return totalPatients;
        }
        
        public void setTotalPatients(Long totalPatients) {
            this.totalPatients = totalPatients;
        }
        
        public Long getActivePatients() {
            return activePatients;
        }
        
        public void setActivePatients(Long activePatients) {
            this.activePatients = activePatients;
        }
        
        public Long getInactivePatients() {
            return inactivePatients;
        }
        
        public void setInactivePatients(Long inactivePatients) {
            this.inactivePatients = inactivePatients;
        }
        
        public Long getEmergencyAccessEnabled() {
            return emergencyAccessEnabled;
        }
        
        public void setEmergencyAccessEnabled(Long emergencyAccessEnabled) {
            this.emergencyAccessEnabled = emergencyAccessEnabled;
        }
    }
}