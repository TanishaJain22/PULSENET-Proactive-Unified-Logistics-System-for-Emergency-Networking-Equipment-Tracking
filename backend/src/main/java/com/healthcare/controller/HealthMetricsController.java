package com.healthcare.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health-metrics")
public class HealthMetricsController {

    @GetMapping("/test")
    public String test() {
        return "Health Metrics Controller is working!";
    }
}