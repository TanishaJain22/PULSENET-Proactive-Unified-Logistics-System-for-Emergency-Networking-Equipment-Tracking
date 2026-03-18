package com.healthcare.config;

import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class MailConfig {
    // Mock mail configuration removed to use Spring Boot's auto-configured JavaMailSender
    // The real JavaMailSender will be created from application.properties settings
}