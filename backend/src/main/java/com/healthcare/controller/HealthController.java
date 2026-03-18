package com.healthcare.controller;

import com.healthcare.service.EmailService;
import com.healthcare.service.PythonAIService;
import com.healthcare.dto.TransferRequestDTO;
import com.healthcare.dto.HospitalRecommendationDTO;
import com.healthcare.entity.enums.TrafficCondition;
import com.healthcare.entity.enums.ConsciousnessLevel;
import com.healthcare.entity.Ambulance;
import com.healthcare.entity.enums.AmbulanceType;
import com.healthcare.entity.enums.AmbulanceStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

@RestController
@RequestMapping("/api/health")
public class HealthController {

	@Autowired
	private EmailService emailService;

	@Autowired
	private PythonAIService pythonAIService;

	@Autowired
	private com.healthcare.repository.AmbulanceRepository ambulanceRepository;

	@GetMapping
	public Map<String, Object> health() {
		Map<String, Object> response = new HashMap<>();
		response.put("status", "UP");
		response.put("message", "PulseNet Backend is running");
		response.put("timestamp", LocalDateTime.now());
		response.put("version", "1.0.0");
		return response;
	}

	@GetMapping("/info")
	public Map<String, Object> info() {
		Map<String, Object> response = new HashMap<>();
		response.put("application", "PulseNet Healthcare Platform");
		response.put("description", "Backend API for healthcare management");
		response.put("features", new String[]{
			"JWT Authentication",
			"Hospital Registration", 
			"OTP-based Login",
			"Document Upload",
			"Role-based Access Control"
		});
		return response;
	}

	@GetMapping("/db-status")
	public Map<String, Object> dbStatus() {
		Map<String, Object> response = new HashMap<>();
		try {
			// This will help us check if database beans are available
			response.put("database", "Database connection status unknown - check startup logs");
			response.put("auth_endpoints", "Check if /api/auth endpoints are available");
			response.put("hospital_endpoints", "Check if /api/hospitals endpoints are available");
		} catch (Exception e) {
			response.put("error", e.getMessage());
		}
		return response;
	}

	@GetMapping("/test-email")
	public Map<String, Object> testEmail(@RequestParam(required = false) String email) {
		Map<String, Object> response = new HashMap<>();
		try {
			if (email != null && !email.isEmpty()) {
				// Test sending email to specific address
				emailService.sendHospitalRegistrationConfirmation(
					email, 
					"Test Hospital", 
					"TEST-" + System.currentTimeMillis()
				);
				response.put("status", "SUCCESS");
				response.put("message", "Test email sent to: " + email);
			} else {
				// Test email connection
				emailService.testEmailConnection();
				response.put("status", "SUCCESS");
				response.put("message", "Email connection test completed - check logs for details");
			}
		} catch (Exception e) {
			response.put("status", "ERROR");
			response.put("message", "Email test failed: " + e.getMessage());
			response.put("error", e.getClass().getSimpleName());
		}
		return response;
	}

	@GetMapping("/test-python-ai")
	public Map<String, Object> testPythonAI() {
		Map<String, Object> response = new HashMap<>();
		try {
			// Create a test transfer request
			TransferRequestDTO testRequest = new TransferRequestDTO();
			testRequest.setPatientId("HEALTH-TEST-" + System.currentTimeMillis());
			testRequest.setPatientName("Test Patient");
			testRequest.setHeartRate(145);
			testRequest.setOxygenLevel(88.0);
			testRequest.setTemperature(36.5);
			testRequest.setBpSystolic(80);
			testRequest.setBpDiastolic(50);
			testRequest.setRespiratoryRate(28);
			testRequest.setSupplementalO2(true);
			testRequest.setConsciousnessLevel(ConsciousnessLevel.VOICE);
			testRequest.setSeverityLevel(8);
			testRequest.setRequiredSpecialty("emergency medicine");
			testRequest.setTrafficCondition(TrafficCondition.MODERATE);
			testRequest.setEstimatedTravelTime(12);

			// Call Python AI service
			List<HospitalRecommendationDTO> recommendations = pythonAIService.getAIHospitalRecommendations(
				testRequest, new ArrayList<>()
			);

			response.put("status", "SUCCESS");
			response.put("message", "Python AI service test completed");
			response.put("recommendations_count", recommendations.size());
			response.put("test_patient_id", testRequest.getPatientId());
			
			if (!recommendations.isEmpty()) {
				response.put("top_recommendation", Map.of(
					"hospital_id", recommendations.get(0).getHospitalId(),
					"ai_score", recommendations.get(0).getAiScore(),
					"reasoning", recommendations.get(0).getReasoning()
				));
			}

		} catch (Exception e) {
			response.put("status", "ERROR");
			response.put("message", "Python AI test failed: " + e.getMessage());
			response.put("error", e.getClass().getSimpleName());
		}
		return response;
	}

	@GetMapping("/create-test-ambulances")
	public Map<String, Object> createTestAmbulances(@RequestParam(required = false) String hospitalId) {
		Map<String, Object> response = new HashMap<>();
		try {
			UUID testHospitalId = hospitalId != null ? 
				UUID.fromString(hospitalId) : 
				UUID.fromString("daa4b61c-65ec-4151-b671-a49c1cc85f86"); // Default test hospital

			List<Map<String, String>> createdAmbulances = new ArrayList<>();

			// Create test ambulances
			String[] vehicleNumbers = {"DL-01-AB-1234", "DL-01-AB-5678", "DL-01-AB-9012"};
			AmbulanceType[] types = {AmbulanceType.BASIC_LIFE_SUPPORT, AmbulanceType.ADVANCED_LIFE_SUPPORT, AmbulanceType.CRITICAL_CARE_TRANSPORT};
			String[] drivers = {"Rajesh Kumar", "Priya Sharma", "Amit Singh"};
			String[] contacts = {"+91-9876543210", "+91-9876543211", "+91-9876543212"};

			for (int i = 0; i < vehicleNumbers.length; i++) {
				if (!ambulanceRepository.existsByVehicleNumber(vehicleNumbers[i])) {
					Ambulance ambulance = new Ambulance();
					ambulance.setVehicleNumber(vehicleNumbers[i]);
					ambulance.setHospitalId(testHospitalId);
					ambulance.setType(types[i]);
					ambulance.setStatus(AmbulanceStatus.AVAILABLE);
					ambulance.setDriverName(drivers[i]);
					ambulance.setDriverContact(contacts[i]);
					ambulance.setCurrentLatitude(28.6139 + (i * 0.001)); // Slightly different locations
					ambulance.setCurrentLongitude(77.2090 + (i * 0.001));

					Ambulance saved = ambulanceRepository.save(ambulance);
					
					Map<String, String> ambulanceInfo = new HashMap<>();
					ambulanceInfo.put("id", saved.getId().toString());
					ambulanceInfo.put("vehicleNumber", saved.getVehicleNumber());
					ambulanceInfo.put("type", saved.getType().toString());
					ambulanceInfo.put("driver", saved.getDriverName());
					createdAmbulances.add(ambulanceInfo);
				}
			}

			response.put("status", "SUCCESS");
			response.put("message", "Test ambulances created successfully");
			response.put("hospital_id", testHospitalId.toString());
			response.put("created_ambulances", createdAmbulances);
			response.put("total_created", createdAmbulances.size());

		} catch (Exception e) {
			response.put("status", "ERROR");
			response.put("message", "Failed to create test ambulances: " + e.getMessage());
			response.put("error", e.getClass().getSimpleName());
		}
		return response;
	}

}
