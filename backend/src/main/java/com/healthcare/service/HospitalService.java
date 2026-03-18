package com.healthcare.service;

import com.healthcare.dto.HospitalRegistrationDTO;
import com.healthcare.entity.*;
import com.healthcare.entity.enums.UserRole;
import com.healthcare.repository.HospitalRepository;
import com.healthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public Hospital registerHospital(HospitalRegistrationDTO dto, 
                                   MultipartFile licenseFile,
                                   MultipartFile clinicalFile,
                                   MultipartFile accreditationFile) {
        
        log.info("🏥 Starting hospital registration process");
        log.info("📋 DTO received: name={}, type={}, ownership={}, email={}", 
                dto.getName(), dto.getType(), dto.getOwnership(), dto.getEmail());
        log.info("📍 Location: address={}, city={}, state={}, postalCode={}", 
                dto.getAddress(), dto.getCity(), dto.getState(), dto.getPostalCode());
        log.info("👤 Admin: email={}, name={}", dto.getAdminEmail(), dto.getAdminName());
        
        // Let's try to understand what combinations are allowed by testing different values
        log.info("🔍 Testing combination: type={}, ownership={}", dto.getType(), dto.getOwnership());
        
        // Validate required fields
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            log.error("❌ Hospital name is required");
            throw new RuntimeException("Hospital name is required");
        }
        if (dto.getAdminEmail() == null || dto.getAdminEmail().trim().isEmpty()) {
            log.error("❌ Admin email is required");
            throw new RuntimeException("Admin email is required");
        }
        if (dto.getAdminPassword() == null || dto.getAdminPassword().trim().isEmpty()) {
            log.error("❌ Admin password is required");
            throw new RuntimeException("Admin password is required");
        }
        
        // Set default ownership based on hospital type if not provided
        if (dto.getOwnership() == null && dto.getType() != null) {
            switch (dto.getType()) {
                case GOVERNMENT:
                    dto.setOwnership(com.healthcare.entity.enums.OwnershipType.PUBLIC);
                    log.info("🔧 Auto-set ownership to PUBLIC for GOVERNMENT hospital");
                    break;
                case PRIVATE:
                    dto.setOwnership(com.healthcare.entity.enums.OwnershipType.PRIVATE);
                    log.info("🔧 Auto-set ownership to PRIVATE for PRIVATE hospital");
                    break;
                case TRUST:
                    dto.setOwnership(com.healthcare.entity.enums.OwnershipType.PRIVATE);
                    log.info("🔧 Auto-set ownership to PRIVATE for TRUST hospital");
                    break;
                case NGO:
                    dto.setOwnership(com.healthcare.entity.enums.OwnershipType.PRIVATE);
                    log.info("🔧 Auto-set ownership to PRIVATE for NGO hospital");
                    break;
            }
        }
        
        // Validate business logic: Hospital type and ownership combinations
        if (dto.getType() != null && dto.getOwnership() != null) {
            boolean isValidCombination = false;
            
            switch (dto.getType()) {
                case GOVERNMENT:
                    // Government hospitals must be publicly owned
                    isValidCombination = dto.getOwnership() == com.healthcare.entity.enums.OwnershipType.PUBLIC;
                    break;
                case PRIVATE:
                    // Private hospitals must be privately owned
                    isValidCombination = dto.getOwnership() == com.healthcare.entity.enums.OwnershipType.PRIVATE;
                    break;
                case TRUST:
                    // Trust hospitals can have any ownership type
                    isValidCombination = true;
                    break;
                case NGO:
                    // NGO hospitals can have any ownership type
                    isValidCombination = true;
                    break;
            }
            
            if (!isValidCombination) {
                log.error("❌ Invalid combination: {} hospital cannot have {} ownership", 
                         dto.getType(), dto.getOwnership());
                throw new RuntimeException(String.format("Invalid combination: %s hospital cannot have %s ownership", 
                                                       dto.getType(), dto.getOwnership()));
            }
        }
        
        // Check if registration number already exists (only if provided)
        if (dto.getRegistrationNo() != null && hospitalRepository.existsByRegistrationNo(dto.getRegistrationNo())) {
            log.error("❌ Registration number already exists: {}", dto.getRegistrationNo());
            throw new RuntimeException("Hospital with this registration number already exists");
        }
        
        // Generate registration number if not provided
        if (dto.getRegistrationNo() == null || dto.getRegistrationNo().trim().isEmpty()) {
            String generatedRegNo = generateRegistrationNumber();
            dto.setRegistrationNo(generatedRegNo);
            log.info("🔧 Auto-generated registration number: {}", generatedRegNo);
        }

        // Check if admin email already exists
        if (userRepository.existsByEmail(dto.getAdminEmail())) {
            log.error("❌ Admin email already exists: {}", dto.getAdminEmail());
            throw new RuntimeException("User with this email already exists");
        }

        log.info("✅ Validation passed, creating hospital entity");
        
        // Create hospital entity
        Hospital hospital = new Hospital();
        hospital.setName(dto.getName());
        hospital.setRegistrationNo(dto.getRegistrationNo());
        hospital.setType(dto.getType());
        hospital.setEstablishedYear(dto.getEstYear());
        hospital.setOwnership(dto.getOwnership());

        // Save hospital first to get ID
        hospital = hospitalRepository.save(hospital);
        log.info("✅ Hospital entity saved with ID: {}", hospital.getId());

        // Create location
        HospitalLocation location = new HospitalLocation();
        location.setHospitalId(hospital.getId());
        location.setAddress(dto.getAddress());
        location.setCity(dto.getCity());
        location.setState(dto.getState());
        location.setPostalCode(dto.getPostalCode());
        location.setLat(dto.getLat());
        location.setLng(dto.getLng());
        location.setHospital(hospital); // Set the bidirectional relationship
        hospital.setLocation(location);

        // Create infrastructure
        HospitalInfrastructure infrastructure = new HospitalInfrastructure();
        infrastructure.setHospitalId(hospital.getId());
        infrastructure.setIcuBeds(dto.getIcuBeds());
        infrastructure.setGeneralBeds(dto.getGeneralBeds());
        infrastructure.setEmergencyBeds(dto.getEmergencyBeds());
        infrastructure.setVentilators(dto.getVentilators());
        infrastructure.setOperatingRooms(dto.getOperatingRooms());
        infrastructure.setHospital(hospital); // Set the bidirectional relationship
        hospital.setInfrastructure(infrastructure);

        // Create specialties
        List<HospitalSpecialty> specialties = new ArrayList<>();
        if (dto.getSpecialties() != null) {
            for (String specialtyName : dto.getSpecialties()) {
                HospitalSpecialty specialty = new HospitalSpecialty();
                specialty.setHospitalId(hospital.getId());
                specialty.setSpecialtyName(specialtyName);
                specialty.setHospital(hospital); // Set the bidirectional relationship
                specialties.add(specialty);
            }
        }
        hospital.setSpecialties(specialties);

        // Handle file uploads and create documents
        List<HospitalDocument> documents = new ArrayList<>();
        
        if (licenseFile != null && !licenseFile.isEmpty()) {
            String fileUrl = saveFile(licenseFile, hospital.getId(), "license");
            HospitalDocument doc = new HospitalDocument();
            doc.setHospitalId(hospital.getId());
            doc.setDocType(com.healthcare.entity.enums.DocumentType.LICENSE);
            doc.setFileUrl(fileUrl);
            doc.setHospital(hospital); // Set the bidirectional relationship
            documents.add(doc);
        }

        if (clinicalFile != null && !clinicalFile.isEmpty()) {
            String fileUrl = saveFile(clinicalFile, hospital.getId(), "clinical");
            HospitalDocument doc = new HospitalDocument();
            doc.setHospitalId(hospital.getId());
            doc.setDocType(com.healthcare.entity.enums.DocumentType.CLINICAL_CERT);
            doc.setFileUrl(fileUrl);
            doc.setHospital(hospital); // Set the bidirectional relationship
            documents.add(doc);
        }

        if (accreditationFile != null && !accreditationFile.isEmpty()) {
            String fileUrl = saveFile(accreditationFile, hospital.getId(), "accreditation");
            HospitalDocument doc = new HospitalDocument();
            doc.setHospitalId(hospital.getId());
            doc.setDocType(com.healthcare.entity.enums.DocumentType.ACCREDITATION);
            doc.setFileUrl(fileUrl);
            doc.setHospital(hospital); // Set the bidirectional relationship
            documents.add(doc);
        }

        hospital.setDocuments(documents);

        // Create admin user
        User adminUser = new User();
        adminUser.setEmail(dto.getAdminEmail());
        adminUser.setPasswordHash(passwordEncoder.encode(dto.getAdminPassword()));
        adminUser.setRole(UserRole.HOSPITAL_ADMIN);
        adminUser.setHospitalId(hospital.getId());
        adminUser.setHospital(hospital); // Set the bidirectional relationship

        userRepository.save(adminUser);

        // Save hospital with all relationships
        Hospital savedHospital = hospitalRepository.save(hospital);
        
        // Send registration confirmation email
        try {
            log.info("📧 Sending registration confirmation email to: {}", dto.getEmail());
            emailService.sendHospitalRegistrationConfirmation(
                dto.getEmail(), 
                dto.getName(), 
                savedHospital.getId().toString()
            );
        } catch (Exception emailError) {
            log.warn("⚠️ Email sending failed but registration was successful: {}", emailError.getMessage());
            // Don't fail the registration if email fails
        }
        
        return savedHospital;
    }

    public List<Hospital> getAllHospitals() {
        // Use a multi-step approach to avoid MultipleBagFetchException
        List<Hospital> hospitals = hospitalRepository.findAllWithBasicRelationships();
        
        if (!hospitals.isEmpty()) {
            List<UUID> hospitalIds = hospitals.stream()
                .map(Hospital::getId)
                .collect(java.util.stream.Collectors.toList());
            
            // Fetch specialties separately
            List<Hospital> hospitalsWithSpecialties = hospitalRepository.findHospitalsWithSpecialties(hospitalIds);
            Map<UUID, List<HospitalSpecialty>> specialtiesMap = hospitalsWithSpecialties.stream()
                .collect(java.util.stream.Collectors.toMap(
                    Hospital::getId,
                    h -> h.getSpecialties() != null ? h.getSpecialties() : new ArrayList<>()
                ));
            
            // Fetch documents separately
            List<Hospital> hospitalsWithDocuments = hospitalRepository.findHospitalsWithDocuments(hospitalIds);
            Map<UUID, List<HospitalDocument>> documentsMap = hospitalsWithDocuments.stream()
                .collect(java.util.stream.Collectors.toMap(
                    Hospital::getId,
                    h -> h.getDocuments() != null ? h.getDocuments() : new ArrayList<>()
                ));
            
            // Combine all data
            hospitals.forEach(hospital -> {
                hospital.setSpecialties(specialtiesMap.get(hospital.getId()));
                hospital.setDocuments(documentsMap.get(hospital.getId()));
            });
        }
        
        return hospitals;
    }

    public Hospital getHospitalById(String id) {
        UUID hospitalId = UUID.fromString(id);
        Optional<Hospital> hospital = hospitalRepository.findByIdWithUsers(hospitalId);
        if (hospital.isEmpty()) {
            throw new RuntimeException("Hospital not found with ID: " + id);
        }
        return hospital.get();
    }

    @Transactional
    public void updateHospitalStatus(String id, String status) {
        UUID hospitalId = UUID.fromString(id);
        Hospital hospital = getHospitalById(id);
        
        try {
            com.healthcare.entity.enums.HospitalStatus hospitalStatus = 
                com.healthcare.entity.enums.HospitalStatus.valueOf(status.toUpperCase());
            hospital.setStatus(hospitalStatus);
            hospitalRepository.save(hospital);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid hospital status: " + status);
        }
    }

    @Transactional
    public Hospital reviewHospital(String id, String status, String adminComments, UUID reviewedBy) {
        UUID hospitalId = UUID.fromString(id);
        Hospital hospital = getHospitalById(id);
        
        try {
            com.healthcare.entity.enums.HospitalStatus hospitalStatus = 
                com.healthcare.entity.enums.HospitalStatus.valueOf(status.toUpperCase());
            
            hospital.setStatus(hospitalStatus);
            hospital.setAdminComments(adminComments);
            hospital.setReviewedBy(reviewedBy);
            hospital.setReviewedAt(java.time.LocalDateTime.now());
            
            return hospitalRepository.save(hospital);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid hospital status: " + status);
        }
    }

    @Transactional
    public void uploadDocuments(String hospitalId, MultipartFile licenseFile, 
                               MultipartFile clinicalFile, MultipartFile accreditationFile) {
        UUID id = UUID.fromString(hospitalId);
        Hospital hospital = getHospitalById(hospitalId);
        
        List<HospitalDocument> documents = new ArrayList<>();
        
        if (licenseFile != null && !licenseFile.isEmpty()) {
            String fileUrl = saveFile(licenseFile, id, "license");
            HospitalDocument doc = new HospitalDocument();
            doc.setHospitalId(id);
            doc.setDocType(com.healthcare.entity.enums.DocumentType.LICENSE);
            doc.setFileUrl(fileUrl);
            documents.add(doc);
        }

        if (clinicalFile != null && !clinicalFile.isEmpty()) {
            String fileUrl = saveFile(clinicalFile, id, "clinical");
            HospitalDocument doc = new HospitalDocument();
            doc.setHospitalId(id);
            doc.setDocType(com.healthcare.entity.enums.DocumentType.CLINICAL_CERT);
            doc.setFileUrl(fileUrl);
            documents.add(doc);
        }

        if (accreditationFile != null && !accreditationFile.isEmpty()) {
            String fileUrl = saveFile(accreditationFile, id, "accreditation");
            HospitalDocument doc = new HospitalDocument();
            doc.setHospitalId(id);
            doc.setDocType(com.healthcare.entity.enums.DocumentType.ACCREDITATION);
            doc.setFileUrl(fileUrl);
            documents.add(doc);
        }

        // Add documents to existing hospital
        if (hospital.getDocuments() == null) {
            hospital.setDocuments(documents);
        } else {
            hospital.getDocuments().addAll(documents);
        }
        
        hospitalRepository.save(hospital);
    }

    private String saveFile(MultipartFile file, UUID hospitalId, String fileType) {
        try {
            // Create directory if it doesn't exist
            String uploadDir = "./uploads/hospitals/" + hospitalId + "/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = fileType + "_" + System.currentTimeMillis() + extension;
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            return uploadDir + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }
    
    /**
     * Generate a unique registration number for hospitals
     * Format: REG-YYYY-XXXXXX (e.g., REG-2026-123456)
     */
    private String generateRegistrationNumber() {
        int year = java.time.Year.now().getValue();
        long timestamp = System.currentTimeMillis();
        String randomPart = String.format("%06d", timestamp % 1000000);
        return String.format("REG-%d-%s", year, randomPart);
    }
}