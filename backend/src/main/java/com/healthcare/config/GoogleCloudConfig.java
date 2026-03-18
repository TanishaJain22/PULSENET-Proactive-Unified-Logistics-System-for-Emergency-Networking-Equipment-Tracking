package com.healthcare.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.vertexai.VertexAI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class GoogleCloudConfig {

    @Value("${google.cloud.project.id}")
    private String projectId;

    @Value("${vertex.ai.location:us-central1}")
    private String location;

    @Bean
    public GoogleCredentials googleCredentials() throws IOException {
        try {
            InputStream credentialsStream = new ClassPathResource("gcp-service-account.json").getInputStream();
            return GoogleCredentials.fromStream(credentialsStream);
        } catch (Exception e) {
            System.err.println("Warning: Could not load Google Cloud credentials: " + e.getMessage());
            // Return default credentials or null to allow application to start
            return null;
        }
    }

    @Bean
    public Storage googleCloudStorage() {
        try {
            GoogleCredentials credentials = googleCredentials();
            if (credentials == null) {
                System.err.println("Warning: Google Cloud Storage not available - using fallback");
                return null;
            }
            return StorageOptions.newBuilder()
                    .setProjectId(projectId)
                    .setCredentials(credentials)
                    .build()
                    .getService();
        } catch (Exception e) {
            System.err.println("Warning: Could not initialize Google Cloud Storage: " + e.getMessage());
            return null;
        }
    }

    @Bean
    public VertexAI vertexAI() {
        try {
            GoogleCredentials credentials = googleCredentials();
            if (credentials == null) {
                System.err.println("Warning: Vertex AI not available - using fallback");
                return null;
            }
            return new VertexAI(projectId, location);
        } catch (Exception e) {
            System.err.println("Warning: Could not initialize Vertex AI: " + e.getMessage());
            return null;
        }
    }
}