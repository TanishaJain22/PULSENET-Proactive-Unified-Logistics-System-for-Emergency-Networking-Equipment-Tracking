package com.healthcare.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudflareR2Config {

    @Value("${cloudflare.r2.access.key.id}")
    private String accessKeyId;

    @Value("${cloudflare.r2.secret.access.key}")
    private String secretAccessKey;

    @Value("${cloudflare.r2.endpoint}")
    private String endpoint;

    @Value("${cloudflare.r2.region}")
    private String region;

    @Bean(name = "cloudflareR2Client")
    public AmazonS3 cloudflareR2Client() {
        try {
            System.out.println("🔧 Configuring Cloudflare R2 client...");
            System.out.println("Access Key ID: " + (accessKeyId != null ? accessKeyId.substring(0, Math.min(8, accessKeyId.length())) + "..." : "null"));
            System.out.println("Secret Key: " + (secretAccessKey != null ? secretAccessKey.substring(0, 8) + "..." : "null"));
            System.out.println("Endpoint: " + endpoint);
            System.out.println("Region: " + region);
            
            // Validate required fields
            if (accessKeyId == null || accessKeyId.trim().isEmpty()) {
                System.err.println("❌ Access Key ID is null or empty");
                return createDummyClient(); // Return dummy client instead of null
            }
            
            if (secretAccessKey == null || secretAccessKey.trim().isEmpty()) {
                System.err.println("❌ Secret Access Key is null or empty");
                return createDummyClient();
            }
            
            if (endpoint == null || endpoint.trim().isEmpty()) {
                System.err.println("❌ Endpoint is null or empty");
                return createDummyClient();
            }
            
            BasicAWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
            
            AmazonS3 client = AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint, region))
                    .withCredentials(new AWSStaticCredentialsProvider(credentials))
                    .withPathStyleAccessEnabled(true) // Critical for R2
                    .build();
            
            // Test connection by listing buckets (but don't fail if it doesn't work)
            try {
                System.out.println("🔍 Testing R2 connection...");
                client.listBuckets().forEach(bucket -> 
                    System.out.println("Found bucket: " + bucket.getName())
                );
                System.out.println("✅ Cloudflare R2 client configured and tested successfully");
            } catch (Exception testException) {
                System.err.println("⚠️ R2 client created but connection test failed: " + testException.getMessage());
                System.err.println("💡 This might be due to network issues or bucket permissions. Client will still be available for use.");
            }
            
            return client;
        } catch (Exception e) {
            System.err.println("❌ Failed to configure Cloudflare R2 client: " + e.getMessage());
            System.err.println("💡 Check: 1) Access Key ID, 2) Secret Key, 3) Endpoint URL, 4) Network connectivity");
            e.printStackTrace();
            return createDummyClient(); // Return dummy client for graceful degradation
        }
    }
    
    private AmazonS3 createDummyClient() {
        System.out.println("🔄 Creating dummy R2 client for graceful degradation");
        // Return a basic client that won't work but won't be null
        try {
            return AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration("http://localhost:9000", "us-east-1"))
                    .withCredentials(new AWSStaticCredentialsProvider(new BasicAWSCredentials("dummy", "dummy")))
                    .withPathStyleAccessEnabled(true)
                    .build();
        } catch (Exception e) {
            System.err.println("❌ Even dummy client creation failed: " + e.getMessage());
            return null;
        }
    }
}