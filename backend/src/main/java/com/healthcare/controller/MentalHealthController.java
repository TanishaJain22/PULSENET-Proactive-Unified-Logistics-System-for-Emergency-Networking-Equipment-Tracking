package com.healthcare.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mental-health")
public class MentalHealthController {

    @GetMapping("/test")
    public String test() {
        return "Mental Health Controller is working!";
    }
}