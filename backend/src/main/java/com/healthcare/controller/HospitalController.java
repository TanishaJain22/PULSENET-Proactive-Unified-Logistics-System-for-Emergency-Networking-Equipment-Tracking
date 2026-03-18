package com.healthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.dto.HospitalRegistrationDTO;
import com.healthcare.entity.Hospital;
import com.healthcare.entity.Doctor;
import com.healthcare.service.HospitalService;
import com.healthcare.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HospitalController {

    private final HospitalService hospitalService;
    private final DoctorService doctorService;
    private final ObjectMapper objectMapper;

    @PostMapping("/register")
    public ResponseEntity<?> registerHospital(@RequestBody HospitalRegistrationDTO dto) {
        try {
            log.info("🏥 Received hospital registration request");
            log.info("📋 Registration data: {}", dto);
            
            Hospital hospital = hospitalService.registerHospital(dto, null, null, null);
            
            log.info("✅ Hospital registered successfully with ID: {}", hospital.getId());
            
            // Return JSON response instead of plain text
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hospital registration submitted successfully");
            response.put("id", hospital.getId().toString());
            response.put("status", "PENDING");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Hospital registration failed: {}", e.getMessage(), e);
            
            // Return JSON error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Registration failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/register-with-files")
    public ResponseEntity<?> registerHospitalWithFiles(
            @RequestParam("basicInfo") String basicInfoJson,
            @RequestParam("location") String locationJson,
            @RequestParam("infrastructure") String infrastructureJson,
            @RequestParam("specialties") String specialtiesJson,
            @RequestParam("equipment") String equipmentJson,
            @RequestParam("contacts") String contactsJson,
            @RequestParam("adminAccount") String adminAccountJson,
            @RequestParam(value = "licenseFile", required = false) MultipartFile licenseFile,
            @RequestParam(value = "clinicalFile", required = false) MultipartFile clinicalFile,
            @RequestParam(value = "accreditationFile", required = false) MultipartFile accreditationFile) {
        
        try {
            // Parse JSON strings into DTO
            HospitalRegistrationDTO dto = parseRegistrationData(
                basicInfoJson, locationJson, infrastructureJson, 
                specialtiesJson, equipmentJson, contactsJson, adminAccountJson
            );

            Hospital hospital = hospitalService.registerHospital(
                dto, licenseFile, clinicalFile, accreditationFile
            );

            return ResponseEntity.ok("Hospital registration submitted successfully. ID: " + hospital.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllHospitals() {
        try {
            List<Hospital> hospitals = hospitalService.getAllHospitals();
            
            // Convert to detailed response with all information
            List<Map<String, Object>> hospitalResponses = hospitals.stream().map(hospital -> {
                Map<String, Object> response = new HashMap<>();
                response.put("id", hospital.getId().toString());
                response.put("name", hospital.getName());
                response.put("registrationNo", hospital.getRegistrationNo());
                response.put("type", hospital.getType().toString());
                response.put("ownership", hospital.getOwnership().toString());
                response.put("status", hospital.getStatus().toString());
                response.put("estYear", hospital.getEstablishedYear());
                response.put("createdAt", hospital.getCreatedAt());
                response.put("reviewedAt", hospital.getReviewedAt());
                response.put("reviewedBy", hospital.getReviewedBy());
                response.put("adminComments", hospital.getAdminComments());
                
                // Add location if available
                if (hospital.getLocation() != null) {
                    Map<String, Object> location = new HashMap<>();
                    location.put("address", hospital.getLocation().getAddress());
                    location.put("city", hospital.getLocation().getCity());
                    location.put("state", hospital.getLocation().getState());
                    location.put("postalCode", hospital.getLocation().getPostalCode());
                    location.put("lat", hospital.getLocation().getLat());
                    location.put("lng", hospital.getLocation().getLng());
                    response.put("location", location);
                }
                
                // Add infrastructure if available
                if (hospital.getInfrastructure() != null) {
                    Map<String, Object> infrastructure = new HashMap<>();
                    infrastructure.put("icuBeds", hospital.getInfrastructure().getIcuBeds());
                    infrastructure.put("generalBeds", hospital.getInfrastructure().getGeneralBeds());
                    infrastructure.put("emergencyBeds", hospital.getInfrastructure().getEmergencyBeds());
                    infrastructure.put("ventilators", hospital.getInfrastructure().getVentilators());
                    infrastructure.put("operatingRooms", hospital.getInfrastructure().getOperatingRooms());
                    response.put("infrastructure", infrastructure);
                }
                
                // Add specialties if available
                if (hospital.getSpecialties() != null) {
                    List<String> specialties = hospital.getSpecialties().stream()
                        .map(specialty -> specialty.getSpecialtyName())
                        .collect(java.util.stream.Collectors.toList());
                    response.put("specialties", specialties);
                }
                
                // Add documents if available
                if (hospital.getDocuments() != null) {
                    List<Map<String, Object>> documents = hospital.getDocuments().stream()
                        .map(doc -> {
                            Map<String, Object> docMap = new HashMap<>();
                            docMap.put("type", doc.getDocType().toString());
                            docMap.put("fileUrl", doc.getFileUrl());
                            return docMap;
                        })
                        .collect(java.util.stream.Collectors.toList());
                    response.put("documents", documents);
                }
                
                // Add admin user email if available
                if (hospital.getUsers() != null && !hospital.getUsers().isEmpty()) {
                    hospital.getUsers().stream()
                        .filter(user -> user.getRole() == com.healthcare.entity.enums.UserRole.HOSPITAL_ADMIN)
                        .findFirst()
                        .ifPresent(adminUser -> response.put("adminEmail", adminUser.getEmail()));
                }
                
                return response;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(hospitalResponses);
        } catch (Exception e) {
            log.error("❌ Failed to fetch hospitals: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to fetch hospitals: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHospital(@PathVariable String id) {
        try {
            Hospital hospital = hospitalService.getHospitalById(id);
            
            // Convert to detailed response with all information (same as getAllHospitals)
            Map<String, Object> response = new HashMap<>();
            response.put("id", hospital.getId().toString());
            response.put("name", hospital.getName());
            response.put("registrationNo", hospital.getRegistrationNo());
            response.put("type", hospital.getType().toString());
            response.put("ownership", hospital.getOwnership().toString());
            response.put("status", hospital.getStatus().toString());
            response.put("estYear", hospital.getEstablishedYear());
            response.put("createdAt", hospital.getCreatedAt());
            response.put("reviewedAt", hospital.getReviewedAt());
            response.put("reviewedBy", hospital.getReviewedBy());
            response.put("adminComments", hospital.getAdminComments());
            
            // Add location if available
            if (hospital.getLocation() != null) {
                Map<String, Object> location = new HashMap<>();
                location.put("address", hospital.getLocation().getAddress());
                location.put("city", hospital.getLocation().getCity());
                location.put("state", hospital.getLocation().getState());
                location.put("postalCode", hospital.getLocation().getPostalCode());
                location.put("lat", hospital.getLocation().getLat());
                location.put("lng", hospital.getLocation().getLng());
                response.put("location", location);
            }
            
            // Add infrastructure if available
            if (hospital.getInfrastructure() != null) {
                Map<String, Object> infrastructure = new HashMap<>();
                infrastructure.put("icuBeds", hospital.getInfrastructure().getIcuBeds());
                infrastructure.put("generalBeds", hospital.getInfrastructure().getGeneralBeds());
                infrastructure.put("emergencyBeds", hospital.getInfrastructure().getEmergencyBeds());
                infrastructure.put("ventilators", hospital.getInfrastructure().getVentilators());
                infrastructure.put("operatingRooms", hospital.getInfrastructure().getOperatingRooms());
                response.put("infrastructure", infrastructure);
            }
            
            // Add specialties if available
            if (hospital.getSpecialties() != null) {
                List<String> specialties = hospital.getSpecialties().stream()
                    .map(specialty -> specialty.getSpecialtyName())
                    .collect(java.util.stream.Collectors.toList());
                response.put("specialties", specialties);
            }
            
            // Add documents if available
            if (hospital.getDocuments() != null) {
                List<Map<String, Object>> documents = hospital.getDocuments().stream()
                    .map(doc -> {
                        Map<String, Object> docMap = new HashMap<>();
                        docMap.put("type", doc.getDocType().toString());
                        docMap.put("fileUrl", doc.getFileUrl());
                        return docMap;
                    })
                    .collect(java.util.stream.Collectors.toList());
                response.put("documents", documents);
            }
            
            // Add admin user email if available
            if (hospital.getUsers() != null && !hospital.getUsers().isEmpty()) {
                hospital.getUsers().stream()
                    .filter(user -> user.getRole() == com.healthcare.entity.enums.UserRole.HOSPITAL_ADMIN)
                    .findFirst()
                    .ifPresent(adminUser -> response.put("adminEmail", adminUser.getEmail()));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Failed to fetch hospital {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Hospital not found: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<?> uploadDocuments(
            @PathVariable String id,
            @RequestParam(value = "license", required = false) MultipartFile licenseFile,
            @RequestParam(value = "clinical", required = false) MultipartFile clinicalFile,
            @RequestParam(value = "accreditation", required = false) MultipartFile accreditationFile) {
        
        try {
            log.info("📄 Uploading documents for hospital ID: {}", id);
            hospitalService.uploadDocuments(id, licenseFile, clinicalFile, accreditationFile);
            
            // Return JSON response instead of plain text
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Documents uploaded successfully");
            response.put("hospitalId", id);
            
            log.info("✅ Documents uploaded successfully for hospital ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Document upload failed for hospital ID {}: {}", id, e.getMessage(), e);
            
            // Return JSON error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Document upload failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getApplicationStatus(@PathVariable String id) {
        try {
            Hospital hospital = hospitalService.getHospitalById(id);
            
            Map<String, Object> statusResponse = new HashMap<>();
            statusResponse.put("success", true);
            statusResponse.put("id", hospital.getId().toString());
            statusResponse.put("name", hospital.getName());
            statusResponse.put("registrationNo", hospital.getRegistrationNo());
            statusResponse.put("status", hospital.getStatus().toString());
            statusResponse.put("type", hospital.getType().toString());
            statusResponse.put("ownership", hospital.getOwnership().toString());
            statusResponse.put("createdAt", hospital.getCreatedAt());
            
            // Add admin email from the associated user
            if (hospital.getUsers() != null && !hospital.getUsers().isEmpty()) {
                // Find the admin user (hospital admin)
                hospital.getUsers().stream()
                    .filter(user -> user.getRole() == com.healthcare.entity.enums.UserRole.HOSPITAL_ADMIN)
                    .findFirst()
                    .ifPresent(adminUser -> statusResponse.put("email", adminUser.getEmail()));
            }
            
            // Add location if available
            if (hospital.getLocation() != null) {
                Map<String, Object> location = new HashMap<>();
                location.put("city", hospital.getLocation().getCity());
                location.put("state", hospital.getLocation().getState());
                location.put("address", hospital.getLocation().getAddress());
                statusResponse.put("location", location);
            }
            
            return ResponseEntity.ok(statusResponse);
        } catch (Exception e) {
            log.error("❌ Failed to fetch application status for ID {}: {}", id, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Application not found: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> reviewHospital(
            @PathVariable String id,
            @RequestBody com.healthcare.dto.HospitalReviewDTO reviewDTO,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Extract admin user ID from JWT token (you'll need to implement JWT parsing)
            // For now, we'll use a placeholder - in production, extract from JWT
            UUID reviewedBy = UUID.randomUUID(); // This should come from JWT token
            
            Hospital hospital = hospitalService.reviewHospital(
                id, 
                reviewDTO.getStatus(), 
                reviewDTO.getAdminComments(), 
                reviewedBy
            );
            
            log.info("✅ Hospital {} reviewed by admin with status: {}", id, reviewDTO.getStatus());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hospital review completed successfully");
            response.put("hospitalId", hospital.getId().toString());
            response.put("status", hospital.getStatus().toString());
            response.put("reviewedAt", hospital.getReviewedAt());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Hospital review failed for ID {}: {}", id, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Hospital review failed: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateHospitalStatus(
            @PathVariable String id,
            @RequestParam String status) {
        try {
            hospitalService.updateHospitalStatus(id, status);
            return ResponseEntity.ok("Hospital status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update status: " + e.getMessage());
        }
    }

    @GetMapping("/{hospitalId}/doctors")
    public ResponseEntity<List<Doctor>> getDoctorsByHospitalId(@PathVariable UUID hospitalId) {
        try {
            List<Doctor> doctors = doctorService.getDoctorsByHospitalId(hospitalId);
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            log.error("Failed to fetch doctors for hospital {}: {}", hospitalId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{hospitalId}/doctors")
    public ResponseEntity<?> createDoctorForHospital(
            @PathVariable UUID hospitalId,
            @RequestBody Doctor doctor) {
        try {
            doctor.setHospitalId(hospitalId);
            
            // Auto-generate employee_id if not provided
            if (doctor.getEmployeeId() == null || doctor.getEmployeeId().isEmpty()) {
                String employeeId = "DOC-" + System.currentTimeMillis();
                doctor.setEmployeeId(employeeId);
            }
            
            // Set hire_date to today if not provided
            if (doctor.getHireDate() == null) {
                doctor.setHireDate(java.time.LocalDate.now());
            }
            
            // Set default values for required fields if not provided
            if (doctor.getHospital() == null || doctor.getHospital().isEmpty()) {
                doctor.setHospital("Hospital"); // Will be updated with actual hospital name if needed
            }
            if (doctor.getFees() == null) {
                doctor.setFees(500); // Default consultation fee
            }
            if (doctor.getRating() == null) {
                doctor.setRating(0.0);
            }
            if (doctor.getIsAvailable() == null) {
                doctor.setIsAvailable(true);
            }
            if (doctor.getVerified() == null) {
                doctor.setVerified(false); // New doctors need verification
            }
            if (doctor.getFirstName() == null || doctor.getFirstName().isEmpty()) {
                // Extract from name if available
                if (doctor.getName() != null && !doctor.getName().isEmpty()) {
                    String[] parts = doctor.getName().split(" ", 2);
                    doctor.setFirstName(parts[0]);
                    if (parts.length > 1) {
                        doctor.setLastName(parts[1]);
                    } else {
                        doctor.setLastName("");
                    }
                } else {
                    doctor.setFirstName("Doctor");
                    doctor.setLastName("");
                }
            }
            if (doctor.getLastName() == null) {
                doctor.setLastName("");
            }
            if (doctor.getEmail() == null || doctor.getEmail().isEmpty()) {
                // Generate email from name
                String emailName = doctor.getName() != null ? 
                    doctor.getName().toLowerCase().replace(" ", ".").replaceAll("[^a-z.]", "") : 
                    "doctor";
                doctor.setEmail(emailName + "@hospital.com");
            }
            if (doctor.getExperience() == null || doctor.getExperience().isEmpty()) {
                doctor.setExperience("0 years");
            }
            if (doctor.getSpecialization() == null || doctor.getSpecialization().isEmpty()) {
                doctor.setSpecialization("General Medicine");
            }
            
            Doctor savedDoctor = doctorService.saveDoctor(doctor);
            log.info("✅ Doctor created successfully with ID: {}", savedDoctor.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Doctor created successfully");
            response.put("data", savedDoctor);
            
            log.info("📤 Returning success response");
            return ResponseEntity.ok(response);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Data integrity violation for hospital {}: {}", hospitalId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            
            if (e.getMessage().contains("email")) {
                errorResponse.put("message", "A doctor with this email already exists");
            } else if (e.getMessage().contains("employee_id")) {
                errorResponse.put("message", "A doctor with this employee ID already exists");
            } else {
                errorResponse.put("message", "Failed to create doctor: duplicate data");
            }
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Failed to create doctor for hospital {}: {}", hospitalId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create doctor: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{hospitalId}/doctors/{doctorId}/availability")
    public ResponseEntity<Doctor> updateDoctorAvailability(
            @PathVariable UUID hospitalId,
            @PathVariable UUID doctorId,
            @RequestBody Map<String, Object> updates) {
        try {
            var doctorOpt = doctorService.getDoctorById(doctorId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Doctor doctor = doctorOpt.get();
            if (updates.containsKey("availabilityStatus")) {
                doctor.setAvailabilityStatus((String) updates.get("availabilityStatus"));
            }
            if (updates.containsKey("notes")) {
                doctor.setNotes((String) updates.get("notes"));
            }
            
            Doctor updatedDoctor = doctorService.saveDoctor(doctor);
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            log.error("Failed to update doctor availability: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{hospitalId}/doctors/{doctorId}")
    public ResponseEntity<Void> deleteDoctorFromHospital(
            @PathVariable UUID hospitalId,
            @PathVariable UUID doctorId) {
        try {
            doctorService.deleteDoctor(doctorId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete doctor {}: {}", doctorId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    private HospitalRegistrationDTO parseRegistrationData(
            String basicInfoJson, String locationJson, String infrastructureJson,
            String specialtiesJson, String equipmentJson, String contactsJson, 
            String adminAccountJson) throws Exception {
        
        HospitalRegistrationDTO dto = new HospitalRegistrationDTO();
        
        // Parse basic info
        var basicInfo = objectMapper.readTree(basicInfoJson);
        dto.setName(basicInfo.get("name").asText());
        dto.setRegistrationNo(basicInfo.get("regNo").asText());
        dto.setType(com.healthcare.entity.enums.HospitalType.valueOf(basicInfo.get("type").asText()));
        dto.setEstYear(basicInfo.get("year").asInt());
        dto.setOwnership(com.healthcare.entity.enums.OwnershipType.valueOf(basicInfo.get("ownership").asText()));
        
        // Parse location
        var location = objectMapper.readTree(locationJson);
        dto.setAddress(location.get("address").asText());
        dto.setCity(location.get("city").asText());
        dto.setState(location.get("state").asText());
        dto.setPostalCode(location.get("pin").asText());
        dto.setLat(location.get("lat").decimalValue());
        dto.setLng(location.get("lng").decimalValue());
        
        // Parse infrastructure
        var infrastructure = objectMapper.readTree(infrastructureJson);
        dto.setIcuBeds(infrastructure.get("icuBeds").asInt());
        dto.setGeneralBeds(infrastructure.get("generalBeds").asInt());
        dto.setEmergencyBeds(infrastructure.get("emergencyBeds").asInt());
        dto.setVentilators(infrastructure.get("ventilators").asInt());
        dto.setOperatingRooms(infrastructure.get("operatingRooms").asInt());
        
        // Parse specialties
        var specialties = objectMapper.readValue(specialtiesJson, String[].class);
        dto.setSpecialties(java.util.Arrays.asList(specialties));
        
        // Parse equipment
        var equipment = objectMapper.readValue(equipmentJson, java.util.Map.class);
        dto.setEquipment(equipment);
        
        // Parse contacts
        var contacts = objectMapper.readTree(contactsJson);
        dto.setEmergencyNo(contacts.get("emergencyNo").asText());
        dto.setControlNo(contacts.get("controlNo").asText());
        dto.setEmail(contacts.get("email").asText());
        dto.setAdminName(contacts.get("adminName").asText());
        dto.setAdminPhone(contacts.get("adminPhone").asText());
        
        // Parse admin account
        var adminAccount = objectMapper.readTree(adminAccountJson);
        dto.setAdminEmail(adminAccount.get("email").asText());
        dto.setAdminPassword(adminAccount.get("password").asText());
        
        return dto;
    }
}