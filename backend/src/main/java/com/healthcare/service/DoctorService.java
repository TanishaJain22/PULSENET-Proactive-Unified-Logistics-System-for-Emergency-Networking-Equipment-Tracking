package com.healthcare.service;

import com.healthcare.entity.Doctor;
import com.healthcare.entity.Hospital;
import com.healthcare.entity.enums.HospitalType;
import com.healthcare.entity.enums.HospitalStatus;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DoctorService {
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private HospitalRepository hospitalRepository;
    
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
    
    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByIsAvailableTrue();
    }
    
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        if (specialization == null || specialization.trim().isEmpty()) {
            return getAvailableDoctors();
        }
        return doctorRepository.findBySpecializationContainingIgnoreCaseAndIsAvailableTrue(specialization);
    }
    
    public List<Doctor> getTopRatedDoctors() {
        return doctorRepository.findTopRatedAvailableDoctors();
    }
    
    public List<Doctor> getDoctorsByFeesRange(Integer minFees, Integer maxFees) {
        return doctorRepository.findByFeesRange(minFees, maxFees);
    }
    
    public List<String> getAllSpecializations() {
        return doctorRepository.findAllSpecializations();
    }
    
    public List<String> getAllHospitals() {
        return doctorRepository.findAllHospitals();
    }
    
    public Optional<Doctor> getDoctorById(UUID id) {
        return doctorRepository.findById(id);
    }
    
    public List<Doctor> getDoctorsByHospitalId(UUID hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId);
    }
    
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }
    
    public void deleteDoctor(UUID id) {
        doctorRepository.deleteById(id);
    }
    
    @PostConstruct
    public void initializeData() {
        if (doctorRepository.count() == 0) {
            // Ensure we have a default hospital for doctors
            UUID defaultHospitalId = getOrCreateDefaultHospital();
            insertIndoreDoctors(defaultHospitalId);
        }
    }
    
    private UUID getOrCreateDefaultHospital() {
        // Try to find an existing hospital first
        List<Hospital> existingHospitals = hospitalRepository.findAll();
        if (!existingHospitals.isEmpty()) {
            return existingHospitals.get(0).getId();
        }
        
        // Create a default hospital if none exists
        Hospital defaultHospital = new Hospital();
        defaultHospital.setName("PulseNet Medical Center");
        defaultHospital.setType(HospitalType.PRIVATE);
        defaultHospital.setStatus(HospitalStatus.APPROVED);
        defaultHospital.setRegistrationNo("PULSENET001");
        defaultHospital.setContactEmail("info@pulsenet.com");
        defaultHospital.setContactPhone("+91 98765 00000");
        defaultHospital.setEstablishedYear(2020);
        
        Hospital savedHospital = hospitalRepository.save(defaultHospital);
        return savedHospital.getId();
    }
    
    private void insertIndoreDoctors(UUID hospitalId) {
        List<Doctor> doctors = Arrays.asList(
            createDoctor("Dr. Mohit Bhandari", "Bariatric Surgeon", "18 years", 
                        "Mohak Bariatrics & Robotics, Indore", 1000, 4.8,
                        "AB Road, Indore, MP 452001", "+91 98765 43210", "MBBS, MS, FMAS", 245,
                        "10:00 AM,2:00 PM,5:00 PM", hospitalId),
                        
            createDoctor("Dr. Rajneesh Kachhara", "Neurosurgeon", "25+ years",
                        "Medanta Hospital, Indore", 1500, 4.9,
                        "Sector A, Scheme No 94, Indore, MP 452010", "+91 98765 43211", "MBBS, MS, MCh", 312,
                        "9:00 AM,1:00 PM,4:00 PM", hospitalId),
                        
            createDoctor("Dr. Vinit Pandey", "Cardiac Surgeon", "20+ years",
                        "Bombay Hospital, Indore", 1200, 4.7,
                        "Kokilaben Dhirubhai Ambani Hospital, Indore", "+91 98765 43212", "MBBS, MS, MCh", 189,
                        "11:00 AM,3:00 PM,6:00 PM", hospitalId),
                        
            createDoctor("Dr. Alkesh Jain", "Cardiologist", "18 years",
                        "Medanta Hospital, Indore", 1000, 4.6,
                        "Sector A, Scheme No 94, Indore, MP 452010", "+91 98765 43213", "MBBS, MD, DM", 156,
                        "10:30 AM,2:30 PM,5:30 PM", hospitalId),
                        
            createDoctor("Dr. Ashmeet Choudhary", "Gastroenterologist", "26 years",
                        "Apollo Hospital, Indore", 1200, 4.7,
                        "Sector D, Scheme No 74C, Indore, MP 452016", "+91 98765 43214", "MBBS, MD, DM", 203,
                        "9:30 AM,1:30 PM,4:30 PM", hospitalId),
                        
            createDoctor("Dr. Pankaj Vyas", "Orthopedic Surgeon", "28 years",
                        "Apollo Hospital, Indore", 900, 4.6,
                        "Sector D, Scheme No 74C, Indore, MP 452016", "+91 98765 43215", "MBBS, MS Ortho", 178,
                        "8:00 AM,12:00 PM,5:00 PM", hospitalId),
                        
            createDoctor("Dr. Seema Gupta", "General Physician", "25 years",
                        "Apollo Hospital, Indore", 700, 4.5,
                        "Sector D, Scheme No 74C, Indore, MP 452016", "+91 98765 43216", "MBBS, MD", 234,
                        "10:00 AM,2:00 PM,6:00 PM", hospitalId),
                        
            createDoctor("Dr. Rubina Vohra", "Nephrologist", "23 years",
                        "Apollo Hospital, Indore", 1000, 4.6,
                        "Sector D, Scheme No 74C, Indore, MP 452016", "+91 98765 43217", "MBBS, MD, DM", 167,
                        "9:00 AM,1:00 PM,5:00 PM", hospitalId),
                        
            createDoctor("Dr. Kavita Bapat", "Gynecologist", "30+ years",
                        "Apollo Hospital, Indore", 800, 4.7,
                        "Sector D, Scheme No 74C, Indore, MP 452016", "+91 98765 43218", "MBBS, MS", 289,
                        "11:00 AM,3:00 PM,7:00 PM", hospitalId),
                        
            createDoctor("Dr. Manish Khasgiwale", "General Surgeon", "27 years",
                        "Apollo Hospital, Indore", 900, 4.5,
                        "Sector D, Scheme No 74C, Indore, MP 452016", "+91 98765 43219", "MBBS, MS", 145,
                        "8:30 AM,12:30 PM,4:30 PM", hospitalId),
                        
            createDoctor("Dr. Abhishek Malviya", "ENT Specialist", "12 years",
                        "CARE CHL Hospital, Indore", 600, 4.4,
                        "A.B Road, LIG Square, Indore, MP 452008", "+91 98765 43220", "MBBS, MS ENT", 123,
                        "10:00 AM,2:00 PM,6:00 PM", hospitalId),
                        
            createDoctor("Dr. Achal Agrawal", "Laparoscopic Surgeon", "15 years",
                        "CARE CHL Hospital, Indore", 900, 4.6,
                        "A.B Road, LIG Square, Indore, MP 452008", "+91 98765 43221", "MBBS, MS, FMAS", 134,
                        "9:00 AM,1:00 PM,5:00 PM", hospitalId),
                        
            createDoctor("Dr. Ajay Gupta", "Endocrinologist", "20 years",
                        "CARE CHL Hospital, Indore", 1100, 4.7,
                        "A.B Road, LIG Square, Indore, MP 452008", "+91 98765 43222", "MBBS, MD, DM", 198,
                        "10:30 AM,2:30 PM,5:30 PM", hospitalId),
                        
            createDoctor("Dr. Sunil Kumar Dube", "Cardiac Surgeon", "22 years",
                        "Bombay Hospital, Indore", 1300, 4.8,
                        "Kokilaben Dhirubhai Ambani Hospital, Indore", "+91 98765 43223", "MBBS, MS, MCh", 267,
                        "9:30 AM,1:30 PM,4:30 PM", hospitalId),
                        
            createDoctor("Dr. Omprakash Rathi", "Nephrologist", "18 years",
                        "Bombay Hospital, Indore", 900, 4.5,
                        "Kokilaben Dhirubhai Ambani Hospital, Indore", "+91 98765 43224", "MBBS, MD, DM", 156,
                        "8:00 AM,12:00 PM,4:00 PM", hospitalId),
                        
            createDoctor("Dr. Rajesh Bharani", "Nephrologist", "20 years",
                        "Bombay Hospital, Indore", 950, 4.6,
                        "Kokilaben Dhirubhai Ambani Hospital, Indore", "+91 98765 43225", "MBBS, MD, DM", 178,
                        "11:00 AM,3:00 PM,6:00 PM", hospitalId),
                        
            createDoctor("Dr. Neelima Deshmukh", "General Physician", "30+ years",
                        "Private Clinic, Indore", 800, 4.7,
                        "Vijay Nagar, Indore, MP 452010", "+91 98765 43226", "MBBS, MD", 234,
                        "10:00 AM,2:00 PM,6:00 PM", hospitalId),
                        
            createDoctor("Dr. Prerna Bedi", "General Physician", "15 years",
                        "Medspace Clinic, Indore", 600, 4.6,
                        "Palasia, Indore, MP 452001", "+91 98765 43227", "MBBS, MD", 145,
                        "9:00 AM,1:00 PM,5:00 PM", hospitalId),
                        
            createDoctor("Dr. Aman Rajan", "General Physician", "6 years",
                        "City Clinic, Indore", 500, 4.4,
                        "Rau, Indore, MP 453331", "+91 98765 43228", "MBBS", 89,
                        "10:00 AM,2:00 PM,6:00 PM", hospitalId),
                        
            createDoctor("Dr. Shishir Gupte", "General Physician", "40+ years",
                        "Gupte Clinic, Indore", 1000, 4.8,
                        "Old Palasia, Indore, MP 452001", "+91 98765 43229", "MBBS, MD", 345,
                        "8:00 AM,12:00 PM,5:00 PM", hospitalId)
        );
        
        doctorRepository.saveAll(doctors);
        System.out.println("✅ Inserted " + doctors.size() + " Indore doctors successfully!");
    }
    
    private Doctor createDoctor(String name, String specialization, String experience,
                               String hospital, Integer fees, Double rating,
                               String address, String phone, String qualifications,
                               Integer reviewCount, String slots, UUID hospitalId) {
        Doctor doctor = new Doctor(name, specialization, experience, hospital, fees, rating);
        
        // Split name into firstName and lastName
        String[] nameParts = splitDoctorName(name);
        doctor.setFirstName(nameParts[0]);
        doctor.setLastName(nameParts[1]);
        
        // Set hire date with default value (safer version)
        doctor.setHireDate(
            doctor.getHireDate() != null ? doctor.getHireDate() : LocalDate.now()
        );
        
        // Set hospital ID with default value (safer version)
        doctor.setHospitalId(
            doctor.getHospitalId() != null ? doctor.getHospitalId() : hospitalId
        );
        
        doctor.setAddress(address);
        doctor.setPhone(phone);
        doctor.setEmail(generateDoctorEmail(name)); // Generate email from name
        doctor.setEmployeeId(generateEmployeeId(name)); // Generate employee ID
        doctor.setQualifications(qualifications);
        doctor.setReviewCount(reviewCount);
        doctor.setAvailableSlots(slots);
        doctor.setIsAvailable(true);
        doctor.setVerified(true);
        doctor.setNextAvailable("Today");
        doctor.setLanguages("Hindi,English");
        doctor.setImage("/doctors/" + name.toLowerCase().replace(" ", "-").replace(".", "") + ".jpg");
        return doctor;
    }
    
    private String[] splitDoctorName(String fullName) {
        // Remove "Dr. " prefix and split name
        String cleanName = fullName.replace("Dr. ", "").trim();
        String[] parts = cleanName.split("\\s+");
        
        if (parts.length >= 2) {
            // First name is the first part, last name is everything else
            String firstName = parts[0];
            String lastName = String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
            return new String[]{firstName, lastName};
        } else {
            // If only one name, use it as first name and set last name as empty
            return new String[]{cleanName, ""};
        }
    }
    
    private String generateDoctorEmail(String name) {
        // Generate email from doctor name
        return name.toLowerCase()
                .replace("dr. ", "")
                .replace(" ", ".")
                .replace(".", "") + "@pulsenet.com";
    }
    
    private String generateEmployeeId(String name) {
        // Generate employee ID from doctor name
        String cleanName = name.toLowerCase()
                .replace("dr. ", "")
                .replace(" ", "");
        return "DOC" + cleanName.substring(0, Math.min(cleanName.length(), 6)).toUpperCase() + 
               String.format("%03d", (int)(Math.random() * 1000));
    }
}