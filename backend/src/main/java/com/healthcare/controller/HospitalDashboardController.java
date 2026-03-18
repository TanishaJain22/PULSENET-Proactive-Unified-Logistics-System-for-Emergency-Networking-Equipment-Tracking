package com.healthcare.controller;

import com.healthcare.dto.HospitalDashboardDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/hospital-dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HospitalDashboardController {

    @GetMapping("/{hospitalId}")
    public ResponseEntity<HospitalDashboardDTO> getDashboardData(@PathVariable String hospitalId) {
        try {
            HospitalDashboardDTO dashboard = createMockDashboardData(hospitalId);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hospital Dashboard API is working!");
    }

    private HospitalDashboardDTO createMockDashboardData(String hospitalId) {
        HospitalDashboardDTO dashboard = new HospitalDashboardDTO();

        // Resource Summary
        HospitalDashboardDTO.ResourceSummaryDTO resources = new HospitalDashboardDTO.ResourceSummaryDTO();
        resources.setErCapacityPercentage(84);
        resources.setAvailableBeds(12);
        resources.setTotalBeds(50);
        resources.setIcuBeds(8);
        resources.setVentilators(15);
        dashboard.setResourceSummary(resources);

        // Active Emergencies
        List<HospitalDashboardDTO.EmergencyDTO> emergencies = new ArrayList<>();
        
        HospitalDashboardDTO.EmergencyDTO emergency1 = new HospitalDashboardDTO.EmergencyDTO();
        emergency1.setId("E-001");
        emergency1.setPatientName("Rajesh Kumar");
        emergency1.setCondition("Cardiac Arrest");
        emergency1.setSeverity("critical");
        emergency1.setEta("3m");
        emergency1.setCurrentLocation("Sector 4, Main Road");
        emergency1.setType("incoming");
        emergencies.add(emergency1);

        HospitalDashboardDTO.EmergencyDTO emergency2 = new HospitalDashboardDTO.EmergencyDTO();
        emergency2.setId("E-002");
        emergency2.setPatientName("Priya Sharma");
        emergency2.setCondition("Trauma Injury");
        emergency2.setSeverity("moderate");
        emergency2.setEta("7m");
        emergency2.setCurrentLocation("Bridge Overpass");
        emergency2.setType("incoming");
        emergencies.add(emergency2);

        dashboard.setActiveEmergencies(emergencies);

        // Pending Transfers
        List<HospitalDashboardDTO.TransferDTO> transfers = new ArrayList<>();
        
        HospitalDashboardDTO.TransferDTO transfer1 = new HospitalDashboardDTO.TransferDTO();
        transfer1.setId("T-204");
        transfer1.setPatientName("Rahul Verma");
        transfer1.setFromHospital("Choithram Hospital");
        transfer1.setToHospital("MY Hospital");
        transfer1.setReason("Advanced Cardiac Care");
        transfer1.setStatus("in-transit");
        transfer1.setEta("15m");
        transfer1.setType("incoming");
        transfers.add(transfer1);

        HospitalDashboardDTO.TransferDTO transfer2 = new HospitalDashboardDTO.TransferDTO();
        transfer2.setId("T-198");
        transfer2.setPatientName("Sara Khan");
        transfer2.setFromHospital("City General");
        transfer2.setToHospital("Metro Rehab");
        transfer2.setReason("Post-Op Recovery");
        transfer2.setStatus("approved");
        transfer2.setEta("---");
        transfer2.setType("outgoing");
        transfers.add(transfer2);

        dashboard.setPendingTransfers(transfers);

        // Staff Summary
        HospitalDashboardDTO.StaffSummaryDTO staff = new HospitalDashboardDTO.StaffSummaryDTO();
        staff.setTotalStaff(42);
        staff.setPhysicians(8);
        staff.setNurses(34);
        staff.setOnDuty(42);
        dashboard.setStaffSummary(staff);

        // AI Insight
        HospitalDashboardDTO.AIInsightDTO aiInsight = new HospitalDashboardDTO.AIInsightDTO();
        aiInsight.setMessage("Current surge predicted to increase by 15% over the next 3 hours. Recommend notifying trauma shift staff.");
        aiInsight.setType("prediction");
        aiInsight.setConfidencePercentage(87);
        dashboard.setAiInsight(aiInsight);

        return dashboard;
    }
}