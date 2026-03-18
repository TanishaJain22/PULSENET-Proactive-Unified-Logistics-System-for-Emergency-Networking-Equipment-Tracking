package com.healthcare.service;

import com.healthcare.dto.LabResultDTO;
import com.healthcare.dto.LabResultUploadDTO;
import com.healthcare.entity.MedicalDocument;
import com.healthcare.entity.Patient;
import com.healthcare.entity.enums.DocumentStatus;
import com.healthcare.entity.enums.DocumentType;
import com.healthcare.repository.MedicalDocumentRepository;
import com.healthcare.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LabResultService {

    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PatientRepository patientRepository;
    private final CloudStorageService cloudStorageService;

    public Page<LabResultDTO> getUserLabResults(Long userId, Pageable pageable) {
        // For now, return all lab results since we don't have patient relationship
        // In production, you'd want to filter by userId or create proper relationship
        
        Page<MedicalDocument> documents = medicalDocumentRepository
                .findByDocumentType(DocumentType.LAB_RESULT, pageable);

        return documents.map(this::convertToDTO);
    }

    public LabResultDTO getLabResult(UUID id) {
        MedicalDocument document = medicalDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab result not found"));

        if (document.getDocumentType() != DocumentType.LAB_RESULT) {
            throw new RuntimeException("Document is not a lab result");
        }

        return convertToDTO(document);
    }

    public LabResultDTO uploadLabResult(Long userId, LabResultUploadDTO uploadDTO) {
        try {
            // For now, create a mock patient or use a different approach
            // Since there's no direct User-Patient relationship, we'll create a mock patient
            // or find by other means
            
            // Upload file to Cloudflare R2
            String filePath = cloudStorageService.uploadMedicalDocument(
                    uploadDTO.getFile(), userId, "lab-results");

            // Create medical document entity without patient for now
            MedicalDocument document = new MedicalDocument();
            // document.setPatient(patient); // Skip patient relationship for now
            document.setTitle(uploadDTO.getTitle());
            document.setDescription(uploadDTO.getDescription());
            document.setDocumentType(DocumentType.LAB_RESULT);
            document.setStatus(DocumentStatus.PENDING);
            document.setFileName(uploadDTO.getFile().getOriginalFilename());
            document.setFilePath(filePath);
            document.setMimeType(uploadDTO.getFile().getContentType());
            document.setFileSize(uploadDTO.getFile().getSize());
            document.setTestName(uploadDTO.getTestName());
            document.setOrderingPhysician(uploadDTO.getOrderingPhysician());
            document.setPerformingLab(uploadDTO.getPerformingLab());
            document.setTestDate(uploadDTO.getTestDate());
            document.setReportDate(uploadDTO.getReportDate());
            document.setCreatedBy("user_" + userId);
            document.setPatientCanView(true);

            document = medicalDocumentRepository.save(document);
            return convertToDTO(document);

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload lab result: " + e.getMessage(), e);
        }
    }

    public String generateDownloadUrl(UUID id) {
        try {
            MedicalDocument document = medicalDocumentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab result not found"));

            if (document.getFilePath() != null && document.getFilePath().startsWith("r2://")) {
                return cloudStorageService.generateSignedUrl(document.getFilePath(), 60); // 1 hour expiry
            } else {
                // For local files, return the file path
                return "/api/files" + document.getFilePath();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate download URL: " + e.getMessage(), e);
        }
    }

    public void deleteLabResult(UUID id) {
        try {
            MedicalDocument document = medicalDocumentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab result not found"));

            // Delete file from storage
            if (document.getFilePath() != null && document.getFilePath().startsWith("r2://")) {
                cloudStorageService.deleteFile(document.getFilePath());
            }

            // Delete database record
            medicalDocumentRepository.delete(document);

        } catch (Exception e) {
            throw new RuntimeException("Failed to delete lab result: " + e.getMessage(), e);
        }
    }

    public List<LabResultDTO> getRecentLabResults(Long userId, int limit) {
        // For now, return recent lab results without patient filtering
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        Page<MedicalDocument> documents = medicalDocumentRepository
                .findByDocumentType(DocumentType.LAB_RESULT, pageable);

        return documents.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LabResultDTO> getAbnormalResults(Long userId) {
        // For now, return all abnormal lab results without patient filtering
        List<MedicalDocument> documents = medicalDocumentRepository
                .findByIsAbnormalTrue();

        return documents.stream()
                .filter(doc -> doc.getDocumentType() == DocumentType.LAB_RESULT)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LabResultDTO convertToDTO(MedicalDocument document) {
        LabResultDTO dto = new LabResultDTO();
        dto.setId(document.getId());
        dto.setTitle(document.getTitle());
        dto.setDescription(document.getDescription());
        dto.setStatus(document.getStatus());
        dto.setFileName(document.getFileName());
        dto.setMimeType(document.getMimeType());
        dto.setFormattedFileSize(document.getFormattedFileSize());
        dto.setTestName(document.getTestName());
        dto.setResults(document.getResults());
        dto.setInterpretation(document.getInterpretation());
        dto.setReferenceRanges(document.getReferenceRanges());
        dto.setIsAbnormal(document.getIsAbnormal());
        dto.setIsCritical(document.getIsCritical());
        dto.setOrderingPhysician(document.getOrderingPhysician());
        dto.setPerformingLab(document.getPerformingLab());
        dto.setTestDate(document.getTestDate());
        dto.setReportDate(document.getReportDate());
        dto.setCreatedAt(document.getCreatedAt());
        dto.setUpdatedAt(document.getUpdatedAt());
        dto.setRequiresAttention(document.requiresAttention());

        // Generate download URL if file exists
        if (document.getFilePath() != null) {
            try {
                dto.setDownloadUrl(generateDownloadUrl(document.getId()));
            } catch (Exception e) {
                // Log error but don't fail the conversion
                System.err.println("Failed to generate download URL for document " + document.getId() + ": " + e.getMessage());
            }
        }

        return dto;
    }
}