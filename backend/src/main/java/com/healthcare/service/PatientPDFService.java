package com.healthcare.service;

import com.healthcare.entity.Patient;
import com.healthcare.entity.Visit;
import com.healthcare.entity.VitalSigns;
import com.healthcare.entity.MedicalDocument;
import com.healthcare.repository.VisitRepository;
import com.healthcare.repository.VitalSignsRepository;
import com.healthcare.repository.MedicalDocumentRepository;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.borders.SolidBorder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientPDFService {

    private final VisitRepository visitRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final QRCodeService qrCodeService;

    /**
     * Generate comprehensive patient report as PDF
     */
    public byte[] generatePatientReport(Patient patient) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);

            // Add header
            addHeader(document, patient);
            
            // Add patient demographics
            addPatientDemographics(document, patient);
            
            // Add medical information
            addMedicalInformation(document, patient);
            
            // Add emergency contacts
            addEmergencyContacts(document, patient);
            
            // Add visit history
            addVisitHistory(document, patient);
            
            // Add vital signs
            addVitalSigns(document, patient);
            
            // Add medical documents
            addMedicalDocuments(document, patient);
            
            // Add QR code
            addQRCode(document, patient);
            
            // Add footer
            addFooter(document);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate patient PDF report", e);
        }
    }

    private void addHeader(Document document, Patient patient) {
        // Professional header with Indian healthcare styling
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{20, 60, 20}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        // Left: Medical symbol
        Cell leftCell = new Cell()
                .add(new Paragraph("🏥").setFontSize(40).setTextAlignment(TextAlignment.CENTER))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE);
        headerTable.addCell(leftCell);

        // Center: Hospital name and title
        Cell centerCell = new Cell()
                .add(new Paragraph("PULSENET HEALTHCARE SYSTEM")
                        .setFontSize(22)
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(new DeviceRgb(0, 102, 204)))
                .add(new Paragraph("भारतीय स्वास्थ्य सेवा प्रणाली")
                        .setFontSize(12)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(new DeviceRgb(102, 102, 102))
                        .setMarginBottom(5))
                .add(new Paragraph("COMPREHENSIVE MEDICAL REPORT")
                        .setFontSize(16)
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(new DeviceRgb(51, 51, 51)))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        headerTable.addCell(centerCell);

        // Right: Date and time
        Cell rightCell = new Cell()
                .add(new Paragraph("Generated:")
                        .setFontSize(10)
                        .setTextAlignment(TextAlignment.RIGHT))
                .add(new Paragraph(java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                        .setFontSize(12)
                        .setBold()
                        .setTextAlignment(TextAlignment.RIGHT))
                .add(new Paragraph(java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm IST")))
                        .setFontSize(10)
                        .setTextAlignment(TextAlignment.RIGHT))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE);
        headerTable.addCell(rightCell);

        document.add(headerTable);

        // Add decorative line
        document.add(new Paragraph()
                .setBorderTop(new SolidBorder(new DeviceRgb(0, 102, 204), 2))
                .setMarginBottom(10));

        // Emergency banner if applicable
        if (patient.getIsEmergencyAccessEnabled()) {
            Paragraph emergencyBanner = new Paragraph("⚠️ आपातकालीन पहुंच सक्षम • EMERGENCY ACCESS ENABLED ⚠️")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setBackgroundColor(new DeviceRgb(220, 53, 69))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(12)
                    .setMarginBottom(20)
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(5));
            document.add(emergencyBanner);
        }
    }

    private void addPatientDemographics(Document document, Patient patient) {
        // Section title with icon
        Paragraph sectionTitle = new Paragraph("👤 रोगी की जानकारी • PATIENT DEMOGRAPHICS")
                .setFontSize(16)
                .setBold()
                .setMarginBottom(15)
                .setFontColor(new DeviceRgb(0, 102, 204))
                .setBackgroundColor(new DeviceRgb(240, 248, 255))
                .setPadding(8)
                .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(3));
        document.add(sectionTitle);

        // Create beautiful demographics table with alternating colors
        Table table = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(25);

        addStyledTableRow(table, "पूरा नाम • Full Name:", patient.getFullName(), true);
        addStyledTableRow(table, "मेडिकल रिकॉर्ड • MRN:", patient.getMedicalRecordNumber(), false);
        addStyledTableRow(table, "जन्म तिथि • Date of Birth:", patient.getDateOfBirth().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")), true);
        addStyledTableRow(table, "आयु • Age:", patient.getAge() + " वर्ष • years", false);
        addStyledTableRow(table, "लिंग • Gender:", patient.getGender().toString(), true);
        if (patient.getBloodType() != null) {
            addStyledTableRow(table, "रक्त समूह • Blood Type:", patient.getBloodType().toString(), false);
        }
        if (patient.getPhoneNumber() != null) {
            addStyledTableRow(table, "फोन • Phone:", patient.getPhoneNumber(), true);
        }
        if (patient.getEmail() != null) {
            addStyledTableRow(table, "ईमेल • Email:", patient.getEmail(), false);
        }
        if (patient.getAddress() != null) {
            addStyledTableRow(table, "पता • Address:", patient.getFormattedAddress(), true);
        }
        if (patient.getNationalId() != null) {
            addStyledTableRow(table, "आधार • Aadhaar ID:", patient.getNationalId(), false);
        }
        addStyledTableRow(table, "स्थिति • Status:", patient.getStatus().toString(), true);
        addStyledTableRow(table, "QR कोड • QR Code ID:", patient.getQrCodeId(), false);

        document.add(table);
    }

    private void addMedicalInformation(Document document, Patient patient) {
        Paragraph sectionTitle = new Paragraph("🩺 चिकित्सा जानकारी • MEDICAL INFORMATION")
                .setFontSize(16)
                .setBold()
                .setMarginBottom(15)
                .setFontColor(new DeviceRgb(0, 102, 204))
                .setBackgroundColor(new DeviceRgb(240, 248, 255))
                .setPadding(8)
                .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(3));
        document.add(sectionTitle);

        if (patient.getAllergies() != null) {
            // Allergies - Critical information
            Paragraph allergiesTitle = new Paragraph("⚠️ एलर्जी • ALLERGIES")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(new DeviceRgb(220, 53, 69))
                    .setMarginBottom(5);
            document.add(allergiesTitle);
            
            Paragraph allergiesContent = new Paragraph(patient.getAllergies())
                    .setFontSize(12)
                    .setBackgroundColor(new DeviceRgb(255, 243, 243))
                    .setPadding(10)
                    .setBorder(new SolidBorder(new DeviceRgb(220, 53, 69), 1))
                    .setMarginBottom(15)
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(3));
            document.add(allergiesContent);
        }

        if (patient.getChronicConditions() != null) {
            Paragraph conditionsTitle = new Paragraph("🔄 पुरानी बीमारियां • CHRONIC CONDITIONS")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(new DeviceRgb(255, 140, 0))
                    .setMarginBottom(5);
            document.add(conditionsTitle);
            
            Paragraph conditionsContent = new Paragraph(patient.getChronicConditions())
                    .setFontSize(12)
                    .setBackgroundColor(new DeviceRgb(255, 248, 240))
                    .setPadding(10)
                    .setBorder(new SolidBorder(new DeviceRgb(255, 140, 0), 1))
                    .setMarginBottom(15)
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(3));
            document.add(conditionsContent);
        }

        if (patient.getCurrentMedications() != null) {
            Paragraph medicationsTitle = new Paragraph("💊 वर्तमान दवाएं • CURRENT MEDICATIONS")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(new DeviceRgb(40, 167, 69))
                    .setMarginBottom(5);
            document.add(medicationsTitle);
            
            Paragraph medicationsContent = new Paragraph(patient.getCurrentMedications())
                    .setFontSize(12)
                    .setBackgroundColor(new DeviceRgb(240, 255, 240))
                    .setPadding(10)
                    .setBorder(new SolidBorder(new DeviceRgb(40, 167, 69), 1))
                    .setMarginBottom(15)
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(3));
            document.add(medicationsContent);
        }

        if (patient.getMedicalNotes() != null) {
            Paragraph notesTitle = new Paragraph("📝 चिकित्सा टिप्पणी • MEDICAL NOTES")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(new DeviceRgb(108, 117, 125))
                    .setMarginBottom(5);
            document.add(notesTitle);
            
            Paragraph notesContent = new Paragraph(patient.getMedicalNotes())
                    .setFontSize(12)
                    .setBackgroundColor(new DeviceRgb(248, 249, 250))
                    .setPadding(10)
                    .setBorder(new SolidBorder(new DeviceRgb(108, 117, 125), 1))
                    .setMarginBottom(20)
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(3));
            document.add(notesContent);
        }
    }

    private void addEmergencyContacts(Document document, Patient patient) {
        if (patient.getEmergencyContactName() != null) {
            Paragraph sectionTitle = new Paragraph("EMERGENCY CONTACTS")
                    .setFontSize(14)
                    .setBold()
                    .setMarginBottom(10)
                    .setFontColor(new DeviceRgb(0, 102, 204));
            document.add(sectionTitle);

            Table table = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            addTableRow(table, "Contact Name:", patient.getEmergencyContactName());
            if (patient.getEmergencyContactPhone() != null) {
                addTableRow(table, "Contact Phone:", patient.getEmergencyContactPhone());
            }
            if (patient.getEmergencyContactRelation() != null) {
                addTableRow(table, "Relationship:", patient.getEmergencyContactRelation());
            }

            document.add(table);
        }
    }

    private void addVisitHistory(Document document, Patient patient) {
        List<Visit> visits = visitRepository.findByPatientIdOrderByScheduledDateTimeDesc(patient.getId());
        
        if (!visits.isEmpty()) {
            Paragraph sectionTitle = new Paragraph("VISIT HISTORY")
                    .setFontSize(14)
                    .setBold()
                    .setMarginBottom(10)
                    .setFontColor(new DeviceRgb(0, 102, 204));
            document.add(sectionTitle);

            Table table = new Table(UnitValue.createPercentArray(new float[]{20, 20, 20, 40}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            // Header row
            table.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Type").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Status").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Notes").setBold()));

            // Limit to last 10 visits
            visits.stream().limit(10).forEach(visit -> {
                table.addCell(visit.getScheduledDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
                table.addCell(visit.getVisitType() != null ? visit.getVisitType().toString() : "N/A");
                table.addCell(visit.getStatus().toString());
                table.addCell(visit.getChiefComplaint() != null ? visit.getChiefComplaint() : "N/A");
            });

            document.add(table);
        }
    }

    private void addVitalSigns(Document document, Patient patient) {
        List<VitalSigns> vitalSigns = vitalSignsRepository.findByPatientIdOrderByRecordedAtDesc(patient.getId());
        
        if (!vitalSigns.isEmpty()) {
            Paragraph sectionTitle = new Paragraph("RECENT VITAL SIGNS")
                    .setFontSize(14)
                    .setBold()
                    .setMarginBottom(10)
                    .setFontColor(new DeviceRgb(0, 102, 204));
            document.add(sectionTitle);

            // Show only the most recent vital signs
            VitalSigns latest = vitalSigns.get(0);
            Table table = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            addTableRow(table, "Recorded Date:", latest.getRecordedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            if (latest.getTemperature() != null) {
                addTableRow(table, "Temperature:", latest.getTemperature() + "°F");
            }
            if (latest.getHeartRate() != null) {
                addTableRow(table, "Heart Rate:", latest.getHeartRate() + " BPM");
            }
            if (latest.getSystolicBP() != null && latest.getDiastolicBP() != null) {
                addTableRow(table, "Blood Pressure:", latest.getSystolicBP() + "/" + latest.getDiastolicBP() + " mmHg");
            }
            if (latest.getRespiratoryRate() != null) {
                addTableRow(table, "Respiratory Rate:", latest.getRespiratoryRate() + " /min");
            }
            if (latest.getOxygenSaturation() != null) {
                addTableRow(table, "Oxygen Saturation:", latest.getOxygenSaturation() + "%");
            }

            document.add(table);
        }
    }

    private void addMedicalDocuments(Document document, Patient patient) {
        List<MedicalDocument> documents = medicalDocumentRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        
        if (!documents.isEmpty()) {
            Paragraph sectionTitle = new Paragraph("MEDICAL DOCUMENTS")
                    .setFontSize(14)
                    .setBold()
                    .setMarginBottom(10)
                    .setFontColor(new DeviceRgb(0, 102, 204));
            document.add(sectionTitle);

            Table table = new Table(UnitValue.createPercentArray(new float[]{40, 30, 30}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            // Header row
            table.addHeaderCell(new Cell().add(new Paragraph("Document Name").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Type").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Upload Date").setBold()));

            documents.forEach(doc -> {
                table.addCell(doc.getTitle());
                table.addCell(doc.getDocumentType().toString());
                table.addCell(doc.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            });

            document.add(table);
        }
    }

    private void addQRCode(Document document, Patient patient) {
        try {
            Paragraph sectionTitle = new Paragraph("QR CODE")
                    .setFontSize(14)
                    .setBold()
                    .setMarginBottom(10)
                    .setFontColor(new DeviceRgb(0, 102, 204));
            document.add(sectionTitle);

            // Generate QR code
            byte[] qrCodeBytes = qrCodeService.generatePatientQRCode(patient.getQrCodeId());
            Image qrCodeImage = new Image(ImageDataFactory.create(qrCodeBytes))
                    .setWidth(150)
                    .setHeight(150);

            Paragraph qrInfo = new Paragraph("Scan this QR code for instant access to patient records:")
                    .setMarginBottom(10);
            document.add(qrInfo);

            document.add(qrCodeImage);

            Paragraph qrId = new Paragraph("QR Code ID: " + patient.getQrCodeId())
                    .setFontSize(10)
                    .setMarginTop(5)
                    .setMarginBottom(20);
            document.add(qrId);

        } catch (Exception e) {
            // If QR code generation fails, just add the text
            Paragraph qrFallback = new Paragraph("QR Code ID: " + patient.getQrCodeId())
                    .setMarginBottom(20);
            document.add(qrFallback);
        }
    }

    private void addFooter(Document document) {
        // Add decorative line
        document.add(new Paragraph()
                .setBorderTop(new SolidBorder(new DeviceRgb(0, 102, 204), 1))
                .setMarginTop(30)
                .setMarginBottom(15));

        Table footerTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100));

        // Left side - Generation info
        Cell leftFooter = new Cell()
                .add(new Paragraph("रिपोर्ट जेनरेशन • Report Generated:")
                        .setFontSize(10)
                        .setBold())
                .add(new Paragraph(java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm IST")))
                        .setFontSize(9))
                .add(new Paragraph("PulseNet Healthcare System v2.0")
                        .setFontSize(8)
                        .setFontColor(ColorConstants.GRAY))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        footerTable.addCell(leftFooter);

        // Right side - Disclaimer
        Cell rightFooter = new Cell()
                .add(new Paragraph("गोपनीयता सूचना • Confidentiality Notice")
                        .setFontSize(10)
                        .setBold()
                        .setTextAlignment(TextAlignment.RIGHT))
                .add(new Paragraph("This document contains confidential medical information.")
                        .setFontSize(8)
                        .setTextAlignment(TextAlignment.RIGHT))
                .add(new Paragraph("Handle according to HIPAA & Indian Medical Council guidelines.")
                        .setFontSize(8)
                        .setTextAlignment(TextAlignment.RIGHT)
                        .setFontColor(ColorConstants.GRAY))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        footerTable.addCell(rightFooter);

        document.add(footerTable);

        // Digital signature placeholder
        Paragraph signature = new Paragraph("🔐 Digitally Generated Report • डिजिटल रूप से जेनरेट की गई रिपोर्ट")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(0, 102, 204))
                .setMarginTop(10);
        document.add(signature);
    }

    private void addTableRow(Table table, String label, String value) {
        addTableRow(table, label, value, null);
    }

    private void addTableRow(Table table, String label, String value, com.itextpdf.kernel.colors.Color textColor) {
        Cell labelCell = new Cell().add(new Paragraph(label).setBold())
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))
                .setPadding(5);
        
        Cell valueCell = new Cell().add(new Paragraph(value))
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))
                .setPadding(5);
        
        if (textColor != null) {
            valueCell.setFontColor(textColor);
        }
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addStyledTableRow(Table table, String label, String value, boolean isAlternate) {
        DeviceRgb bgColor = isAlternate ? new DeviceRgb(248, 249, 250) : new DeviceRgb(255, 255, 255);
        
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold().setFontSize(11))
                .setBorder(new SolidBorder(new DeviceRgb(222, 226, 230), 0.5f))
                .setPadding(8)
                .setBackgroundColor(bgColor);
        
        Cell valueCell = new Cell()
                .add(new Paragraph(value).setFontSize(11))
                .setBorder(new SolidBorder(new DeviceRgb(222, 226, 230), 0.5f))
                .setPadding(8)
                .setBackgroundColor(bgColor);
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}