package com.healthcare.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteCalculationService {

    private final RestTemplate restTemplate;

    public RouteCalculationResult calculateRoute(double startLat, double startLng, 
                                               double endLat, double endLng) {
        try {
            // Using OpenRouteService API (free alternative to Google Maps)
            // You can also use OSRM or other routing services
            String url = String.format(
                "https://api.openrouteservice.org/v2/directions/driving-car?start=%f,%f&end=%f,%f",
                startLng, startLat, endLng, endLat
            );
            
            // For now, we'll calculate a simple direct route and estimate
            // In production, you would use a real routing service
            return calculateDirectRoute(startLat, startLng, endLat, endLng);
            
        } catch (Exception e) {
            log.error("Error calculating route: {}", e.getMessage());
            return calculateDirectRoute(startLat, startLng, endLat, endLng);
        }
    }

    private RouteCalculationResult calculateDirectRoute(double startLat, double startLng, 
                                                      double endLat, double endLng) {
        // Calculate direct distance using Haversine formula
        double distance = calculateHaversineDistance(startLat, startLng, endLat, endLng);
        
        // Estimate travel time (assuming average speed of 40 km/h in city)
        double estimatedTimeMinutes = (distance / 40.0) * 60.0;
        
        // Create simple route points (direct line)
        List<RoutePoint> routePoints = new ArrayList<>();
        routePoints.add(new RoutePoint(startLat, startLng));
        routePoints.add(new RoutePoint(endLat, endLng));
        
        return RouteCalculationResult.builder()
                .distanceKm(distance)
                .estimatedTimeMinutes((int) Math.ceil(estimatedTimeMinutes))
                .routePoints(routePoints)
                .build();
    }

    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c; // Distance in km

        return distance;
    }

    // Alias method for calculateDistance
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        return calculateHaversineDistance(lat1, lon1, lat2, lon2);
    }

    public int calculateETA(double currentLat, double currentLng, 
                          double destLat, double destLng, double currentSpeed) {
        double distance = calculateHaversineDistance(currentLat, currentLng, destLat, destLng);
        
        // If speed is too low, use average city speed
        double effectiveSpeed = currentSpeed > 5 ? currentSpeed : 30;
        
        // Calculate ETA in minutes
        double etaMinutes = (distance / effectiveSpeed) * 60.0;
        
        return (int) Math.ceil(etaMinutes);
    }

    // Inner classes
    public static class RouteCalculationResult {
        private double distanceKm;
        private int estimatedTimeMinutes;
        private List<RoutePoint> routePoints;

        public static RouteCalculationResultBuilder builder() {
            return new RouteCalculationResultBuilder();
        }

        // Getters and setters
        public double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
        public int getEstimatedTimeMinutes() { return estimatedTimeMinutes; }
        public void setEstimatedTimeMinutes(int estimatedTimeMinutes) { this.estimatedTimeMinutes = estimatedTimeMinutes; }
        public List<RoutePoint> getRoutePoints() { return routePoints; }
        public void setRoutePoints(List<RoutePoint> routePoints) { this.routePoints = routePoints; }

        public static class RouteCalculationResultBuilder {
            private double distanceKm;
            private int estimatedTimeMinutes;
            private List<RoutePoint> routePoints;

            public RouteCalculationResultBuilder distanceKm(double distanceKm) {
                this.distanceKm = distanceKm;
                return this;
            }

            public RouteCalculationResultBuilder estimatedTimeMinutes(int estimatedTimeMinutes) {
                this.estimatedTimeMinutes = estimatedTimeMinutes;
                return this;
            }

            public RouteCalculationResultBuilder routePoints(List<RoutePoint> routePoints) {
                this.routePoints = routePoints;
                return this;
            }

            public RouteCalculationResult build() {
                RouteCalculationResult result = new RouteCalculationResult();
                result.setDistanceKm(this.distanceKm);
                result.setEstimatedTimeMinutes(this.estimatedTimeMinutes);
                result.setRoutePoints(this.routePoints);
                return result;
            }
        }
    }

    public static class RoutePoint {
        private double latitude;
        private double longitude;

        public RoutePoint(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        // Getters and setters
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }
        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
    }
}