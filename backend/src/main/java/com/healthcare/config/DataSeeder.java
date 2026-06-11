package com.healthcare.config;

import com.healthcare.entity.Hospital;
import com.healthcare.entity.User;
import com.healthcare.entity.Ambulance;
import com.healthcare.entity.Patient;
import com.healthcare.entity.Visit;
import com.healthcare.entity.VitalSigns;
import com.healthcare.entity.MedicalDocument;
import com.healthcare.entity.enums.HospitalStatus;
import com.healthcare.entity.enums.HospitalType;
import com.healthcare.entity.enums.OwnershipType;
import com.healthcare.entity.enums.UserRole;
import com.healthcare.entity.enums.AmbulanceType;
import com.healthcare.entity.enums.AmbulanceStatus;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import com.healthcare.entity.enums.PatientStatus;
import com.healthcare.entity.enums.Gender;
import com.healthcare.entity.enums.BloodType;
import com.healthcare.entity.enums.VisitStatus;
import com.healthcare.entity.enums.VisitType;
import com.healthcare.entity.enums.DocumentType;
import com.healthcare.entity.enums.DocumentStatus;
import com.healthcare.repository.HospitalRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.repository.AmbulanceRepository;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.VisitRepository;
import com.healthcare.repository.VitalSignsRepository;
import com.healthcare.repository.MedicalDocumentRepository;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.annotation.Order;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

/**
 * PulseNet Healthcare Coordination Platform - Production DataSeeder
 * 
 * This DataSeeder creates a realistic Indian healthcare ecosystem for Indore, Madhya Pradesh.
 * It demonstrates the PulseNet platform in a real-world Indian emergency healthcare scenario.
 * 
 * Features:
 * - Authentic Indore hospital network (Government & Private)
 * - Realistic Indian patient profiles with medical histories
 * - Emergency scenarios reflecting Indian healthcare challenges
 * - QR code integration for emergency medical access
 * - Comprehensive ambulance fleet with Indian vehicle numbers
 * - Indian medical practices, medicines, and diagnostic labs
 * 
 * @author PulseNet Development Team
 * @version 2.0 - Indian Healthcare Edition
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.data-seeding.enabled", havingValue = "true", matchIfMissing = false)
@Order(1) // Run first to seed data
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PasswordEncoder passwordEncoder;

    // Indore Hospital Network Data
    private static final List<HospitalData> INDORE_HOSPITALS = Arrays.asList(
        new HospitalData("11111111-1111-1111-1111-111111111111", "Maharaja Yeshwantrao Hospital (MY Hospital)", 
            "AB Road, Near Geeta Bhawan, Indore, MP 452001", 22.7196, 75.8577, HospitalType.GOVERNMENT, 
            "admin.myhospital@pulsenet.in", "+91-731-2470860", "LIC/MP/GOV/001", 850, 45, "Dr. Rajesh Kumar Sharma"),
        
        new HospitalData("22222222-2222-2222-2222-222222222222", "Choithram Hospital & Research Centre", 
            "Manik Bagh Road, Indore, MP 452014", 22.7280, 75.8723, HospitalType.PRIVATE, 
            "admin.choithram@pulsenet.in", "+91-731-2566666", "LIC/MP/PVT/002", 650, 35, "Dr. Priya Agarwal"),
        
        new HospitalData("33333333-3333-3333-3333-333333333333", "Bombay Hospital Indore", 
            "Vijay Nagar, Scheme No. 54, Indore, MP 452010", 22.7532, 75.8937, HospitalType.PRIVATE, 
            "admin.bombay@pulsenet.in", "+91-731-4222222", "LIC/MP/PVT/003", 400, 25, "Dr. Amit Jain"),
        
        new HospitalData("44444444-4444-4444-4444-444444444444", "Apollo Sage Hospital", 
            "Bicholi Mardana Road, Indore, MP 452016", 22.6726, 75.9063, HospitalType.PRIVATE, 
            "admin.apollo@pulsenet.in", "+91-731-4077777", "LIC/MP/PVT/004", 300, 20, "Dr. Sunita Verma"),
        
        new HospitalData("55555555-5555-5555-5555-555555555555", "Sri Aurobindo Medical College & Hospital", 
            "Sanwer Road, Indore, MP 452055", 22.6845, 75.8312, HospitalType.GOVERNMENT, 
            "admin.aurobindo@pulsenet.in", "+91-731-2888888", "LIC/MP/GOV/005", 750, 40, "Dr. Vikram Singh"),
        
        new HospitalData("66666666-6666-6666-6666-666666666666", "CHL Hospital", 
            "A.B. Road, Near LIG Square, Indore, MP 452008", 22.7058, 75.8681, HospitalType.PRIVATE, 
            "admin.chl@pulsenet.in", "+91-731-4044444", "LIC/MP/PVT/006", 500, 30, "Dr. Neha Patel"),
        
        new HospitalData("77777777-7777-7777-7777-777777777777", "Vishesh Jupiter Hospital", 
            "Scheme No. 94, Ring Road, Indore, MP 452020", 22.7644, 75.8432, HospitalType.PRIVATE, 
            "admin.jupiter@pulsenet.in", "+91-731-4999999", "LIC/MP/PVT/007", 350, 22, "Dr. Ravi Gupta"),
        
        new HospitalData("88888888-8888-8888-8888-888888888888", "Greater Kailash Hospital", 
            "Palasia Square, A.B. Road, Indore, MP 452001", 22.7167, 75.8545, HospitalType.PRIVATE, 
            "admin.gkh@pulsenet.in", "+91-731-2555555", "LIC/MP/PVT/008", 200, 15, "Dr. Kavita Sharma"),
        
        new HospitalData("99999999-9999-9999-9999-999999999999", "City Care Emergency Center", 
            "Sapna Sangeeta Road, Indore, MP 452001", 22.7240, 75.8615, HospitalType.PRIVATE, 
            "admin.citycare@pulsenet.in", "+91-731-2777777", "LIC/MP/PVT/009", 150, 12, "Dr. Manoj Tiwari"),
        
        new HospitalData("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Indore Trauma & Emergency Center", 
            "Super Corridor, Indore, MP 452016", 22.6892, 75.9156, HospitalType.GOVERNMENT, 
            "admin.trauma@pulsenet.in", "+91-731-2999999", "LIC/MP/GOV/010", 300, 25, "Dr. Deepak Joshi")
    );
    // Indian Patient Profiles Data
    private static final List<PatientData> INDIAN_PATIENTS = Arrays.asList(
        new PatientData("Shubh Sharma", LocalDate.of(1992, 11, 23), Gender.MALE, BloodType.B_POSITIVE,
            "+91-9876543210", "shubh.sharma@gmail.com", "B-204, Shanti Apartments, Vijay Nagar, Indore, MP 452010",
            "ABCDE1234F", "Priya Sharma", "+91-9876543211", "Wife", "Star Health Insurance", "SH/2023/MP/001234567",
            "Type 2 Diabetes Mellitus, Hypertension, Mild Asthma", "Penicillin, Dust mites, Pollen",
            "Metformin 500mg BD, Amlodipine 5mg OD, Salbutamol inhaler PRN"),
        
        new PatientData("Rajesh Kumar Patel", LocalDate.of(1985, 3, 15), Gender.MALE, BloodType.O_POSITIVE,
            "+91-9876543220", "rajesh.patel@gmail.com", "C-45, Scheme No. 78, Vijay Nagar, Indore, MP 452010",
            "PQRST5678G", "Sunita Patel", "+91-9876543221", "Wife", "ICICI Lombard", "IC/2023/MP/002345678",
            "Coronary Artery Disease, Hyperlipidemia", "Aspirin, Shellfish", 
            "Atorvastatin 20mg OD, Metoprolol 50mg BD, Aspirin 75mg OD"),
        
        new PatientData("Anita Verma", LocalDate.of(1990, 7, 8), Gender.FEMALE, BloodType.A_POSITIVE,
            "+91-9876543230", "anita.verma@gmail.com", "A-12, Palasia Square, Indore, MP 452001",
            "UVWXY9012H", "Rohit Verma", "+91-9876543231", "Husband", "HDFC ERGO", "HD/2023/MP/003456789",
            "Gestational Diabetes, Iron Deficiency Anemia", "Sulfa drugs", 
            "Iron tablets, Folic acid, Calcium supplements"),
        
        new PatientData("Mohan Singh Chouhan", LocalDate.of(1978, 12, 2), Gender.MALE, BloodType.AB_POSITIVE,
            "+91-9876543240", "mohan.chouhan@gmail.com", "D-78, Bicholi Mardana, Indore, MP 452016",
            "FGHIJ3456I", "Kamala Chouhan", "+91-9876543241", "Wife", "Ayushman Bharat", "AB/2023/MP/004567890",
            "Chronic Kidney Disease, Diabetes Type 2", "Iodine contrast", 
            "Insulin, Erythropoietin, Calcium carbonate"),
        
        new PatientData("Kavita Jain", LocalDate.of(1995, 5, 20), Gender.FEMALE, BloodType.O_NEGATIVE,
            "+91-9876543250", "kavita.jain@gmail.com", "E-23, Sanwer Road, Indore, MP 452055",
            "KLMNO7890J", "Suresh Jain", "+91-9876543251", "Father", "Star Health Insurance", "SH/2023/MP/005678901",
            "Rheumatoid Arthritis, Hypothyroidism", "NSAIDs", 
            "Methotrexate, Levothyroxine, Folic acid"),
        
        new PatientData("Arjun Malhotra", LocalDate.of(1988, 9, 14), Gender.MALE, BloodType.B_NEGATIVE,
            "+91-9876543260", "arjun.malhotra@gmail.com", "F-56, Ring Road, Indore, MP 452020",
            "STUVW2345K", "Pooja Malhotra", "+91-9876543261", "Wife", "ICICI Lombard", "IC/2023/MP/006789012",
            "Epilepsy, Migraine", "Phenytoin", 
            "Levetiracetam, Sumatriptan, Vitamin B complex"),
        
        new PatientData("Deepika Agarwal", LocalDate.of(1993, 1, 30), Gender.FEMALE, BloodType.A_NEGATIVE,
            "+91-9876543270", "deepika.agarwal@gmail.com", "G-89, Manik Bagh Road, Indore, MP 452014",
            "XYZAB6789L", "Vikash Agarwal", "+91-9876543271", "Husband", "HDFC ERGO", "HD/2023/MP/007890123",
            "Polycystic Ovary Syndrome, Insulin Resistance", "Metformin", 
            "Clomiphene, Metformin, Oral contraceptives"),
        
        new PatientData("Ravi Sharma", LocalDate.of(1982, 4, 25), Gender.MALE, BloodType.AB_NEGATIVE,
            "+91-9876543280", "ravi.sharma@gmail.com", "H-34, Super Corridor, Indore, MP 452016",
            "CDEFG1234M", "Meera Sharma", "+91-9876543281", "Wife", "Ayushman Bharat", "AB/2023/MP/008901234",
            "Chronic Obstructive Pulmonary Disease, Smoking History", "Beta-blockers", 
            "Tiotropium, Salbutamol, Prednisolone"),
        
        new PatientData("Sushma Patel", LocalDate.of(1987, 8, 12), Gender.FEMALE, BloodType.O_POSITIVE,
            "+91-9876543290", "sushma.patel@gmail.com", "I-67, Sapna Sangeeta Road, Indore, MP 452001",
            "HIJKL5678N", "Ramesh Patel", "+91-9876543291", "Husband", "Star Health Insurance", "SH/2023/MP/009012345",
            "Fibromyalgia, Depression", "Tricyclic antidepressants", 
            "Pregabalin, Sertraline, Paracetamol"),
        
        new PatientData("Vikram Singh", LocalDate.of(1975, 11, 5), Gender.MALE, BloodType.A_POSITIVE,
            "+91-9876543300", "vikram.singh@gmail.com", "J-90, LIG Square, Indore, MP 452008",
            "MNOPQ9012O", "Sunita Singh", "+91-9876543301", "Wife", "ICICI Lombard", "IC/2023/MP/010123456",
            "Benign Prostatic Hyperplasia, Osteoarthritis", "Alpha-blockers", 
            "Tamsulosin, Diclofenac, Glucosamine"),
        
        new PatientData("Neha Gupta", LocalDate.of(1991, 6, 18), Gender.FEMALE, BloodType.B_POSITIVE,
            "+91-9876543310", "neha.gupta@gmail.com", "K-23, Geeta Bhawan Square, Indore, MP 452001",
            "RSTUV3456P", "Amit Gupta", "+91-9876543311", "Husband", "HDFC ERGO", "HD/2023/MP/011234567",
            "Thyroid Nodules, Anxiety Disorder", "Iodine", 
            "Levothyroxine, Alprazolam, Calcium"),
        
        new PatientData("Manoj Tiwari", LocalDate.of(1980, 10, 22), Gender.MALE, BloodType.O_NEGATIVE,
            "+91-9876543320", "manoj.tiwari@gmail.com", "L-45, Scheme No. 54, Indore, MP 452010",
            "WXYZC7890Q", "Rekha Tiwari", "+91-9876543321", "Wife", "Ayushman Bharat", "AB/2023/MP/012345678",
            "Peptic Ulcer Disease, Gastroesophageal Reflux", "Aspirin", 
            "Omeprazole, Sucralfate, Domperidone")
    );
    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🏥 Starting PulseNet DataSeeder - Indian Healthcare Edition");
            System.out.println("📍 Location: Indore, Madhya Pradesh, India");
            
            // 1. Create System Administrator
            createSystemAdmin();
            
            // 2. Create Test Users
            createTestUsers();
            
            // 3. Create Indore Hospital Network
            createIndoreHospitalNetwork();
            
            // 4. Create Ambulance Fleet for each hospital
            createAmbulanceFleet();
            
            // 5. Create Realistic Indian Patient Profiles
            createIndianPatientProfiles();
            
            // 6. Create Medical History Records
            createMedicalHistoryRecords();
            
            // 7. Create Emergency Case Scenarios
            createEmergencyCaseScenarios();
            
            System.out.println("✅ PulseNet DataSeeder completed successfully!");
            System.out.println("🎯 Ready for Indian Healthcare Emergency Demonstration");
            
        } catch (Exception e) {
            System.err.println("❌ DataSeeder failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==================== SYSTEM ADMIN CREATION ====================
    
    private void createSystemAdmin() {
        if (!userRepository.existsByEmail("sysadmin@pulsenet.gov.in")) {
            User systemAdmin = new User();
            systemAdmin.setEmail("sysadmin@pulsenet.gov.in");
            systemAdmin.setPasswordHash(passwordEncoder.encode("PulseNet@2024"));
            systemAdmin.setRole(UserRole.SYSTEM_ADMIN);
            systemAdmin.setFirstName("Dr. Rajesh");
            systemAdmin.setLastName("Agarwal");
            systemAdmin.setPhoneNumber("+91-731-2500000");
            systemAdmin.setIsActive(true);
            
            userRepository.save(systemAdmin);
            System.out.println("✅ System Admin created: sysadmin@pulsenet.gov.in");
            System.out.println("🔐 Password: PulseNet@2024");
            System.out.println("👨‍⚕️ Administrator: Dr. Rajesh Agarwal (Indore Health Department)");
        } else {
            System.out.println("ℹ️ System Admin already exists");
        }
    }

    private void createTestUsers() {
        System.out.println("👥 Creating Test Users...");
        
        // Create test user 1 - Indore resident
        if (!userRepository.existsByEmail("rahul.sharma@gmail.com")) {
            User user1 = new User();
            user1.setEmail("rahul.sharma@gmail.com");
            user1.setPasswordHash(passwordEncoder.encode("rahul123"));
            user1.setRole(UserRole.USER);
            user1.setFirstName("Rahul");
            user1.setLastName("Sharma");
            user1.setPhoneNumber("+91-9876543210");
            user1.setIsActive(true);
            
            userRepository.save(user1);
            System.out.println("✅ Test User created: rahul.sharma@gmail.com");
            System.out.println("🔐 Password: rahul123");
        } else {
            System.out.println("ℹ️ Test User already exists");
        }

        // Create test user 2 - Indore resident
        if (!userRepository.existsByEmail("priya.patel@gmail.com")) {
            User user2 = new User();
            user2.setEmail("priya.patel@gmail.com");
            user2.setPasswordHash(passwordEncoder.encode("priya123"));
            user2.setRole(UserRole.USER);
            user2.setFirstName("Priya");
            user2.setLastName("Patel");
            user2.setPhoneNumber("+91-9876543211");
            user2.setIsActive(true);
            
            userRepository.save(user2);
            System.out.println("✅ Test User created: priya.patel@gmail.com");
            System.out.println("🔐 Password: priya123");
        } else {
            System.out.println("ℹ️ Test User priya.patel@gmail.com already exists");
        }
    }

    // ==================== INDORE HOSPITAL NETWORK ====================
    
    private void createIndoreHospitalNetwork() {
        System.out.println("🏥 Creating Indore Hospital Network...");
        
        // First, create all hospitals
        for (HospitalData hospitalData : INDORE_HOSPITALS) {
            createHospitalIfNotExists(hospitalData);
        }
        
        // Then, create all hospital admin users (after hospitals are committed)
        System.out.println("👨‍⚕️ Creating Hospital Administrators...");
        for (HospitalData hospitalData : INDORE_HOSPITALS) {
            UUID hospitalId = getActualHospitalId(hospitalData.id, hospitalData.email);
            createHospitalAdmin(hospitalId, hospitalData.email, hospitalData.adminName);
        }
        
        System.out.println("✅ Indore Hospital Network created successfully");
    }
    private void createHospitalIfNotExists(HospitalData data) {
        String baseRegistrationNo = "REG/MP/2024/" + data.id.substring(0, 8);
        String registrationNo = baseRegistrationNo;
        
        // Ensure unique registration number by adding suffix if needed
        int suffix = 1;
        while (hospitalRepository.existsByRegistrationNo(registrationNo)) {
            registrationNo = baseRegistrationNo + "-" + String.format("%02d", suffix);
            suffix++;
        }
        
        // Check if hospital exists by email
        boolean exists = hospitalRepository.findAll().stream()
            .anyMatch(h -> h.getContactEmail() != null && h.getContactEmail().equalsIgnoreCase(data.email));
            
        if (!exists) {
            Hospital hospital = new Hospital();
            hospital.setName(data.name);
            hospital.setContactEmail(data.email);
            hospital.setContactPhone(data.phone);
            hospital.setType(data.type);
            hospital.setOwnership(data.type == HospitalType.GOVERNMENT ? OwnershipType.PUBLIC : OwnershipType.PRIVATE);
            hospital.setStatus(HospitalStatus.APPROVED);
            hospital.setLicenseNumber(data.licenseNumber);
            hospital.setEstablishedYear(2010);
            hospital.setWebsite("https://" + data.name.toLowerCase().replace(" ", "").replace("(", "").replace(")", "") + ".com");
            hospital.setRegistrationNo(registrationNo);
            
            hospitalRepository.save(hospital);
            System.out.println("✅ Hospital created: " + data.name + " (Registration: " + registrationNo + ")");
        } else {
            System.out.println("ℹ️ Hospital already exists (by email): " + data.name);
        }
    }
    
    private void createHospitalAdmin(UUID hospitalId, String email, String adminName) {
        if (!userRepository.existsByEmail(email)) {
            User hospitalAdmin = new User();
            hospitalAdmin.setEmail(email);
            hospitalAdmin.setPasswordHash(passwordEncoder.encode("hospital123"));
            hospitalAdmin.setRole(UserRole.HOSPITAL_ADMIN);
            hospitalAdmin.setHospitalId(hospitalId);
            
            userRepository.save(hospitalAdmin);
            System.out.println("   👨‍⚕️ Admin created: " + adminName + " (" + email + ")");
        }
    }

    // ==================== AMBULANCE FLEET CREATION ====================
    
    private void createAmbulanceFleet() {
        System.out.println("🚑 Creating Ambulance Fleet...");
        
        List<String[]> ambulanceDrivers = Arrays.asList(
            new String[]{"Rajesh Kumar", "+91-9876543401"},
            new String[]{"Suresh Patel", "+91-9876543402"},
            new String[]{"Amit Singh", "+91-9876543403"},
            new String[]{"Vikram Yadav", "+91-9876543404"},
            new String[]{"Manoj Sharma", "+91-9876543405"},
            new String[]{"Deepak Gupta", "+91-9876543406"},
            new String[]{"Ravi Jain", "+91-9876543407"},
            new String[]{"Sanjay Verma", "+91-9876543408"},
            new String[]{"Prakash Tiwari", "+91-9876543409"},
            new String[]{"Ashok Patel", "+91-9876543410"}
        );
        
        int driverIndex = 0;
        int vehicleCounter = 1001;
        
        for (HospitalData hospitalData : INDORE_HOSPITALS) {
            UUID hospitalId = getActualHospitalId(hospitalData.id, hospitalData.email);
            
            // Create 3-4 ambulances per hospital
            int ambulanceCount = hospitalData.bedCapacity > 500 ? 4 : 3;
            
            for (int i = 0; i < ambulanceCount; i++) {
                String vehicleNumber = "MP09AB" + (vehicleCounter++);
                AmbulanceType type = AmbulanceType.values()[i % 3]; // Rotate through types
                String[] driver = ambulanceDrivers.get(driverIndex % ambulanceDrivers.size());
                
                createAmbulanceIfNotExists(vehicleNumber, hospitalId, type, driver[0], driver[1], 
                    hospitalData.latitude, hospitalData.longitude);
                
                driverIndex++;
            }
        }
        
        System.out.println("✅ Ambulance Fleet created successfully");
    }
    private void createAmbulanceIfNotExists(String vehicleNumber, UUID hospitalId, AmbulanceType type, 
                                          String driverName, String driverContact, double lat, double lng) {
        if (!ambulanceRepository.existsByVehicleNumber(vehicleNumber)) {
            Ambulance ambulance = new Ambulance();
            ambulance.setVehicleNumber(vehicleNumber);
            ambulance.setHospitalId(hospitalId);
            ambulance.setType(type);
            ambulance.setStatus(AmbulanceStatus.AVAILABLE);
            ambulance.setDriverName(driverName);
            ambulance.setDriverContact(driverContact);
            ambulance.setCurrentLatitude(lat + (Math.random() - 0.5) * 0.01); // Small random offset
            ambulance.setCurrentLongitude(lng + (Math.random() - 0.5) * 0.01);
            
            ambulanceRepository.save(ambulance);
            System.out.println("   🚑 Ambulance created: " + vehicleNumber + " (" + type + ") - " + driverName);
        }
    }

    // ==================== INDIAN PATIENT PROFILES ====================
    
    private void createIndianPatientProfiles() {
        System.out.println("👥 Creating Indian Patient Profiles...");
        
        for (PatientData patientData : INDIAN_PATIENTS) {
            createPatientIfNotExists(patientData);
        }
        
        System.out.println("✅ Indian Patient Profiles created successfully");
    }
    
    private void createPatientIfNotExists(PatientData data) {
        if (!patientRepository.existsByEmail(data.email)) {
            Patient patient = new Patient();
            patient.setFirstName(data.name.split(" ")[0]);
            patient.setLastName(data.name.substring(data.name.indexOf(" ") + 1));
            patient.setDateOfBirth(data.dateOfBirth);
            patient.setGender(data.gender);
            patient.setBloodType(data.bloodType);
            patient.setPhoneNumber(data.phoneNumber);
            patient.setEmail(data.email);
            patient.setAddress(data.address);
            patient.setCity("Indore");
            patient.setState("Madhya Pradesh");
            patient.setZipCode("452001");
            patient.setCountry("India");
            patient.setNationalId(data.aadhaarNumber);
            
            // Emergency contact
            patient.setEmergencyContactName(data.emergencyContactName);
            patient.setEmergencyContactPhone(data.emergencyContactPhone);
            patient.setEmergencyContactRelation(data.emergencyContactRelation);
            
            // Medical information
            patient.setAllergies(data.allergies);
            patient.setChronicConditions(data.chronicConditions);
            patient.setCurrentMedications(data.currentMedications);
            
            // Insurance
            patient.setInsuranceProvider(data.insuranceProvider);
            patient.setInsurancePolicyNumber(data.insurancePolicyNumber);
            
            patient.setStatus(PatientStatus.ACTIVE);
            patient.setIsEmergencyAccessEnabled(true);
            
            Patient savedPatient = patientRepository.save(patient);
            System.out.println("   👤 Patient created: " + data.name + " (QR: " + savedPatient.getQrCodeId() + ")");
        } else {
            System.out.println("   ℹ️ Patient already exists: " + data.name);
        }
    }
    // ==================== MEDICAL HISTORY RECORDS ====================
    
    private void createMedicalHistoryRecords() {
        System.out.println("📋 Creating Medical History Records...");
        
        // Create detailed medical history for key patients
        createShubhSharmaMedicalHistory();
        createRajeshPatelMedicalHistory();
        createAnitaVermaMedicalHistory();
        
        System.out.println("✅ Medical History Records created successfully");
    }
    
    private void createShubhSharmaMedicalHistory() {
        Patient patient = patientRepository.findByEmail("shubh.sharma@gmail.com").orElse(null);
        if (patient == null) return;
        
        UUID hospitalId = getActualHospitalId("11111111-1111-1111-1111-111111111111", "admin.myhospital@pulsenet.in");
        Hospital hospital = hospitalRepository.findById(hospitalId).orElse(null);
        
        // Visit 1: Diabetes diagnosis (2019)
        Visit visit1 = createVisit(patient, hospital, LocalDateTime.of(2019, 6, 15, 10, 30),
            VisitType.CONSULTATION, "Excessive thirst, frequent urination, fatigue for 2 months",
            "Type 2 Diabetes Mellitus - newly diagnosed",
            "Start Metformin 500mg BD, dietary counseling, lifestyle modifications");
        
        // Visit 2: Hypertension diagnosis (2021)
        Visit visit2 = createVisit(patient, hospital, LocalDateTime.of(2021, 3, 10, 14, 15),
            VisitType.CONSULTATION, "Headache, dizziness, routine diabetes follow-up",
            "Essential Hypertension Stage 1, Type 2 DM - controlled",
            "Add Amlodipine 5mg OD, continue Metformin, regular BP monitoring");
        
        // Visit 3: Recent follow-up (2024)
        Visit visit3 = createVisit(patient, hospital, LocalDateTime.of(2024, 2, 20, 11, 0),
            VisitType.FOLLOW_UP, "Routine diabetes and hypertension follow-up, mild breathing difficulty",
            "Type 2 DM - well controlled, HTN - controlled, Mild Asthma",
            "Continue current medications, add Salbutamol inhaler PRN, pulmonary function test");
        
        // Create vital signs and medical documents
        createVitalSigns(patient, visit1, 135, 85, 88, 180, "Dr. Rajesh Gupta");
        createVitalSigns(patient, visit2, 150, 95, 92, 140, "Dr. Priya Patel");
        createVitalSigns(patient, visit3, 130, 80, 85, 125, "Dr. Amit Sharma");
        
        createMedicalDocument(patient, visit1, "HbA1c and Blood Glucose Report", DocumentType.LAB_RESULT,
            "HbA1c: 8.2%, FBS: 180 mg/dl, PPBS: 280 mg/dl", "Apollo Diagnostics, Indore");
        createMedicalDocument(patient, visit2, "12-Lead ECG Report", DocumentType.IMAGING_REPORT,
            "Normal sinus rhythm, Rate: 88 bpm, Normal axis", "MY Hospital - Cardiology");
        createMedicalDocument(patient, visit3, "Comprehensive Metabolic Panel", DocumentType.LAB_RESULT,
            "HbA1c: 6.8%, FBS: 110 mg/dl, Creatinine: 0.9 mg/dl", "SRL Diagnostics, Indore");
    }
    
    private void createRajeshPatelMedicalHistory() {
        Patient patient = patientRepository.findByEmail("rajesh.patel@gmail.com").orElse(null);
        if (patient == null) return;
        
        UUID hospitalId = getActualHospitalId("22222222-2222-2222-2222-222222222222", "admin.choithram@pulsenet.in");
        Hospital hospital = hospitalRepository.findById(hospitalId).orElse(null);
        
        // Cardiac emergency visit
        Visit visit = createVisit(patient, hospital, LocalDateTime.of(2023, 8, 5, 15, 45),
            VisitType.EMERGENCY, "Severe chest pain, sweating, shortness of breath",
            "Acute Myocardial Infarction - STEMI",
            "Emergency angioplasty, dual antiplatelet therapy, statin");
        
        createVitalSigns(patient, visit, 180, 110, 120, 250, "Dr. Cardiology Team");
        createMedicalDocument(patient, visit, "Emergency ECG", DocumentType.IMAGING_REPORT,
            "ST elevation in leads II, III, aVF - Inferior STEMI", "Choithram Hospital - Emergency");
    }
    
    private void createAnitaVermaMedicalHistory() {
        Patient patient = patientRepository.findByEmail("anita.verma@gmail.com").orElse(null);
        if (patient == null) return;
        
        UUID hospitalId = getActualHospitalId("33333333-3333-3333-3333-333333333333", "admin.bombay@pulsenet.in");
        Hospital hospital = hospitalRepository.findById(hospitalId).orElse(null);
        
        // Pregnancy follow-up
        Visit visit = createVisit(patient, hospital, LocalDateTime.of(2024, 1, 15, 11, 30),
            VisitType.FOLLOW_UP, "Routine antenatal checkup - 28 weeks pregnant",
            "Gestational Diabetes, Iron Deficiency Anemia",
            "Insulin therapy, iron supplements, regular monitoring");
        
        createVitalSigns(patient, visit, 125, 80, 88, 140, "Dr. Obstetrics Team");
        createMedicalDocument(patient, visit, "Glucose Tolerance Test", DocumentType.LAB_RESULT,
            "Fasting: 95 mg/dl, 1hr: 185 mg/dl, 2hr: 165 mg/dl", "Dr Lal PathLabs, Indore");
    }

    // ==================== EMERGENCY CASE SCENARIOS ====================
    
    private void createEmergencyCaseScenarios() {
        System.out.println("🚨 Creating Emergency Case Scenarios for Indore...");
        
        // These would be created when actual emergencies occur
        // For now, we'll just log the scenarios that the system can handle
        
        System.out.println("   🚗 Road Accident Scenario - AB Road near Rajwada");
        System.out.println("   💔 Heart Attack Scenario - Vijay Nagar, Scheme No. 54");
        System.out.println("   🧠 Stroke Scenario - Rajendra Nagar, near Brilliant Convention Centre");
        System.out.println("   🫁 Severe Asthma Attack - Palasia Square area");
        System.out.println("   🤱 Pregnancy Emergency - Annapurna Road, near Treasure Island Mall");
        System.out.println("   🔥 Burn Injury - Industrial Area, Sanwer Road");
        System.out.println("   🏍️ Two-Wheeler Accident - Ring Road, near C21 Mall");
        System.out.println("   🏭 Industrial Accident - Pithampur Industrial Area");
        
        System.out.println("✅ Emergency Case Scenarios documented for Indore region");
    }

    // ==================== HELPER METHODS ====================
    
    private UUID getActualHospitalId(String staticIdStr, String email) {
        return hospitalRepository.findAll().stream()
            .filter(h -> h.getContactEmail() != null && h.getContactEmail().equalsIgnoreCase(email))
            .map(Hospital::getId)
            .findFirst()
            .orElse(UUID.fromString(staticIdStr));
    }
    
    private Visit createVisit(Patient patient, Hospital hospital, LocalDateTime dateTime, 
                             VisitType type, String complaint, String diagnosis, String treatment) {
        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setHospital(hospital);
        visit.setVisitType(type);
        visit.setScheduledDateTime(dateTime);
        visit.setStatus(VisitStatus.COMPLETED);
        visit.setChiefComplaint(complaint);
        visit.setDiagnosis(diagnosis);
        visit.setTreatment(treatment);
        
        return visitRepository.save(visit);
    }
    
    private void createVitalSigns(Patient patient, Visit visit, int systolic, int diastolic, 
                                 int heartRate, int glucose, String recordedBy) {
        VitalSigns vitals = new VitalSigns();
        vitals.setPatient(patient);
        vitals.setVisit(visit);
        vitals.setSystolicBP(BigDecimal.valueOf(systolic));
        vitals.setDiastolicBP(BigDecimal.valueOf(diastolic));
        vitals.setHeartRate(BigDecimal.valueOf(heartRate));
        vitals.setRespiratoryRate(BigDecimal.valueOf(18));
        vitals.setTemperature(BigDecimal.valueOf(98.6));
        vitals.setOxygenSaturation(BigDecimal.valueOf(98));
        vitals.setBloodGlucose(BigDecimal.valueOf(glucose));
        vitals.setRecordedBy(recordedBy);
        vitals.setLocation("OPD");
        
        vitalSignsRepository.save(vitals);
    }
    
    private void createMedicalDocument(Patient patient, Visit visit, String title, DocumentType type,
                                      String results, String lab) {
        MedicalDocument doc = new MedicalDocument();
        doc.setPatient(patient);
        doc.setVisit(visit);
        doc.setTitle(title);
        doc.setDocumentType(type);
        doc.setStatus(DocumentStatus.REVIEWED);
        doc.setResults(results);
        doc.setPerformingLab(lab);
        doc.setTestDate(visit.getScheduledDateTime());
        doc.setReportDate(visit.getScheduledDateTime().plusHours(2));
        
        medicalDocumentRepository.save(doc);
    }

    // ==================== DATA CLASSES ====================
    
    private static class HospitalData {
        final String id, name, address, email, phone, licenseNumber, adminName;
        final double latitude, longitude;
        final HospitalType type;
        final int bedCapacity, emergencyCapacity;
        
        HospitalData(String id, String name, String address, double latitude, double longitude,
                    HospitalType type, String email, String phone, String licenseNumber,
                    int bedCapacity, int emergencyCapacity, String adminName) {
            this.id = id; this.name = name; this.address = address;
            this.latitude = latitude; this.longitude = longitude; this.type = type;
            this.email = email; this.phone = phone; this.licenseNumber = licenseNumber;
            this.bedCapacity = bedCapacity; this.emergencyCapacity = emergencyCapacity;
            this.adminName = adminName;
        }
    }
    
    private static class PatientData {
        final String name, phoneNumber, email, address, aadhaarNumber;
        final String emergencyContactName, emergencyContactPhone, emergencyContactRelation;
        final String insuranceProvider, insurancePolicyNumber;
        final String chronicConditions, allergies, currentMedications;
        final LocalDate dateOfBirth;
        final Gender gender;
        final BloodType bloodType;
        
        PatientData(String name, LocalDate dateOfBirth, Gender gender, BloodType bloodType,
                   String phoneNumber, String email, String address, String aadhaarNumber,
                   String emergencyContactName, String emergencyContactPhone, String emergencyContactRelation,
                   String insuranceProvider, String insurancePolicyNumber,
                   String chronicConditions, String allergies, String currentMedications) {
            this.name = name; this.dateOfBirth = dateOfBirth; this.gender = gender; this.bloodType = bloodType;
            this.phoneNumber = phoneNumber; this.email = email; this.address = address; this.aadhaarNumber = aadhaarNumber;
            this.emergencyContactName = emergencyContactName; this.emergencyContactPhone = emergencyContactPhone;
            this.emergencyContactRelation = emergencyContactRelation; this.insuranceProvider = insuranceProvider;
            this.insurancePolicyNumber = insurancePolicyNumber; this.chronicConditions = chronicConditions;
            this.allergies = allergies; this.currentMedications = currentMedications;
        }
    }
}