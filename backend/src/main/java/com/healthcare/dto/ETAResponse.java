package com.healthcare.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ETAResponse {
    private UUID ambulanceId;
    private int etaMinutes;
    private double currentSpeed;
    private LocalDateTime calculatedAt;
    private String formattedETA;

    public void setEtaMinutes(int etaMinutes) {
        this.etaMinutes = etaMinutes;
        this.formattedETA = formatETA(etaMinutes);
    }

    private String formatETA(int minutes) {
        if (minutes < 60) {
            return minutes + " minutes";
        } else {
            int hours = minutes / 60;
            int remainingMinutes = minutes % 60;
            return hours + " hour" + (hours > 1 ? "s" : "") + 
                   (remainingMinutes > 0 ? " " + remainingMinutes + " minutes" : "");
        }
    }
}