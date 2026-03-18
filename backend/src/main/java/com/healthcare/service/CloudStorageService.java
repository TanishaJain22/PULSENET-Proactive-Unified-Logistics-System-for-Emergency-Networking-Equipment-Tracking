package com.healthcare.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class CloudStorageService {

    @Autowired(required = false)
    @Qualifier("cloudflareR2Client")
    private AmazonS3 r2Client;

    @Value("${cloudflare.r2.bucket.name}")
    private String bucketName;

    @Value("${file.upload.dir:uploads/ai-health}")
    private String localUploadDir;

    public String uploadMedicalImage(MultipartFile file, Long userId, String analysisType) throws IOException {
        if (r2Client != null && isCloudStorageAvailable()) {
            return uploadToR2Storage(file, userId, analysisType);
        } else {
            // Fallback to local storage
            return saveFileLocally(file, "images");
        }
    }

    public String uploadAudioFile(MultipartFile file, Long userId, String sessionId) throws IOException {
        if (r2Client != null && isCloudStorageAvailable()) {
            return uploadAudioToR2Storage(file, userId, sessionId);
        } else {
            // Fallback to local storage
            return saveFileLocally(file, "audio");
        }
    }

    public String uploadMedicalDocument(MultipartFile file, Long userId, String documentType) throws IOException {
        if (r2Client != null && isCloudStorageAvailable()) {
            return uploadMedicalDocumentToR2Storage(file, userId, documentType);
        } else {
            // Fallback to local storage
            return saveFileLocally(file, "documents");
        }
    }

    private String uploadToR2Storage(MultipartFile file, Long userId, String analysisType) throws IOException {
        // Create bucket if it doesn't exist
        createBucketIfNotExists();
        
        // Generate secure filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = String.format("medical-images/%d/%s/%s_%s%s", 
            userId, analysisType, System.currentTimeMillis(), UUID.randomUUID().toString(), extension);
        
        // Upload to Cloudflare R2
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        metadata.addUserMetadata("userId", userId.toString());
        metadata.addUserMetadata("analysisType", analysisType);
        metadata.addUserMetadata("uploadTime", String.valueOf(System.currentTimeMillis()));
        metadata.addUserMetadata("originalFilename", originalFilename != null ? originalFilename : "unknown");
        
        PutObjectRequest putRequest = new PutObjectRequest(bucketName, filename, 
            new ByteArrayInputStream(file.getBytes()), metadata);
        
        r2Client.putObject(putRequest);
        
        return String.format("r2://%s/%s", bucketName, filename);
    }

    private String uploadAudioToR2Storage(MultipartFile file, Long userId, String sessionId) throws IOException {
        createBucketIfNotExists();
        
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : ".wav";
        String filename = String.format("voice-sessions/%d/%s_%s%s", 
            userId, sessionId, System.currentTimeMillis(), extension);
        
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        metadata.addUserMetadata("userId", userId.toString());
        metadata.addUserMetadata("sessionId", sessionId);
        metadata.addUserMetadata("uploadTime", String.valueOf(System.currentTimeMillis()));
        
        PutObjectRequest putRequest = new PutObjectRequest(bucketName, filename, 
            new ByteArrayInputStream(file.getBytes()), metadata);
        
        r2Client.putObject(putRequest);
        
        return String.format("r2://%s/%s", bucketName, filename);
    }

    private String uploadMedicalDocumentToR2Storage(MultipartFile file, Long userId, String documentType) throws IOException {
        createBucketIfNotExists();
        
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = String.format("medical-documents/%d/%s/%s_%s%s", 
            userId, documentType, System.currentTimeMillis(), UUID.randomUUID().toString(), extension);
        
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        metadata.addUserMetadata("userId", userId.toString());
        metadata.addUserMetadata("documentType", documentType);
        metadata.addUserMetadata("uploadTime", String.valueOf(System.currentTimeMillis()));
        metadata.addUserMetadata("originalFilename", originalFilename != null ? originalFilename : "unknown");
        
        PutObjectRequest putRequest = new PutObjectRequest(bucketName, filename, 
            new ByteArrayInputStream(file.getBytes()), metadata);
        
        r2Client.putObject(putRequest);
        
        return String.format("r2://%s/%s", bucketName, filename);
    }

    public byte[] downloadFile(String r2Url) throws IOException {
        // Parse R2 URL
        String[] parts = r2Url.replace("r2://", "").split("/", 2);
        String bucket = parts[0];
        String objectName = parts[1];
        
        S3Object s3Object = r2Client.getObject(bucket, objectName);
        return s3Object.getObjectContent().readAllBytes();
    }

    public String generateSignedUrl(String r2Url, int durationMinutes) throws IOException {
        String[] parts = r2Url.replace("r2://", "").split("/", 2);
        String bucket = parts[0];
        String objectName = parts[1];
        
        GeneratePresignedUrlRequest generatePresignedUrlRequest = 
            new GeneratePresignedUrlRequest(bucket, objectName)
                .withMethod(com.amazonaws.HttpMethod.GET)
                .withExpiration(new java.util.Date(System.currentTimeMillis() + durationMinutes * 60 * 1000));
        
        return r2Client.generatePresignedUrl(generatePresignedUrlRequest).toString();
    }

    public void deleteFile(String r2Url) throws IOException {
        String[] parts = r2Url.replace("r2://", "").split("/", 2);
        String bucket = parts[0];
        String objectName = parts[1];
        
        r2Client.deleteObject(bucket, objectName);
    }

    public String saveFileLocally(MultipartFile file, String subDir) throws IOException {
        // Fallback local storage for development/testing
        Path uploadPath = Paths.get(localUploadDir, subDir);
        Files.createDirectories(uploadPath);
        
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
        
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        return "/" + subDir + "/" + filename;
    }

    public boolean isCloudStorageAvailable() {
        try {
            System.out.println("🔍 Checking Cloudflare R2 availability...");
            if (r2Client == null) {
                System.out.println("❌ R2 client is null");
                return false;
            }
            
            System.out.println("✅ R2 client exists, testing connection...");
            
            // Try to list buckets with a timeout
            r2Client.listObjects(new ListObjectsRequest().withBucketName(bucketName).withMaxKeys(1));
            System.out.println("✅ Cloudflare R2 is available and accessible");
            return true;
        } catch (Exception e) {
            System.err.println("❌ Cloudflare R2 availability check failed: " + e.getMessage());
            
            // Check if it's an authentication error
            if (e.getMessage().contains("403") || e.getMessage().contains("401")) {
                System.err.println("🔐 Authentication error - check Access Key ID and Secret Key");
            } else if (e.getMessage().contains("NoSuchBucket")) {
                System.err.println("🪣 Bucket not found - check bucket name: " + bucketName);
            } else {
                System.err.println("🌐 Network or configuration error");
            }
            
            return false;
        }
    }

    private void createBucketIfNotExists() {
        if (r2Client == null) {
            return; // Skip if R2 client is not available
        }
        
        try {
            if (!r2Client.doesBucketExistV2(bucketName)) {
                CreateBucketRequest createBucketRequest = new CreateBucketRequest(bucketName);
                r2Client.createBucket(createBucketRequest);
                
                // Set bucket lifecycle policy to delete files older than 1 year
                BucketLifecycleConfiguration.Rule rule = new BucketLifecycleConfiguration.Rule()
                    .withId("DeleteOldFiles")
                    .withStatus(BucketLifecycleConfiguration.ENABLED)
                    .withExpirationInDays(365);
                
                BucketLifecycleConfiguration configuration = new BucketLifecycleConfiguration()
                    .withRules(rule);
                
                r2Client.setBucketLifecycleConfiguration(bucketName, configuration);
            }
        } catch (Exception e) {
            // Log error but don't fail - fallback to local storage
            System.err.println("Failed to create/access R2 bucket: " + e.getMessage());
        }
    }
}