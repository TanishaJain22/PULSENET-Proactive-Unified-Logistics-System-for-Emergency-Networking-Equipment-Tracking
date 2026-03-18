package com.healthcare.dto;

import lombok.Data;

import java.util.List;

@Data
public class HospitalDashboardDTO {
    private ResourceSummaryDTO resourceSummary;
    private List<EmergencyDTO> activeEmergencies;
    private List<TransferDTO> pendingTransfers;
    private StaffSummaryDTO staffSummary;
    private AIInsightDTO aiInsight;

    @Data
    public static class ResourceSummaryDTO {
        private int erCapacityPercentage;
        private int availableBeds;
        private int totalBeds;
        private int icuBeds;
        private int ventilators;
    }

    @Data
    public static class EmergencyDTO {
        private String id;
        private String patientName;
        private String condition;
        private String severity; // critical, moderate, minor
        private String eta;
        private String currentLocation;
        private String type; // incoming, dispatched
    }

    @Data
    public static class TransferDTO {
        private String id;
        private String patientName;
        private String fromHospital;
        private String toHospital;
        private String reason;
        private String status; // in-transit, approved, pending
        private String eta;
        private String type; // incoming, outgoing
    }

    @Data
    public static class StaffSummaryDTO {
        private int totalStaff;
        private int physicians;
        private int nurses;
        private int onDuty;
    }

    @Data
    public static class AIInsightDTO {
        private String message;
        private String type; // prediction, alert, recommendation
        private int confidencePercentage;
    }
}