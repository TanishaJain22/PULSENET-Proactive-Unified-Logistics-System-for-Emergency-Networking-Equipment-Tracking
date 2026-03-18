package com.healthcare.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class QRCodeService {

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Generate QR code as byte array (PNG format)
     * @param text The text to encode in QR code
     * @param width QR code width in pixels
     * @param height QR code height in pixels
     * @return QR code as byte array
     */
    public byte[] generateQRCode(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return outputStream.toByteArray();
    }

    /**
     * Generate QR code for patient with default size (300x300)
     * The QR code contains a URL that directly downloads the patient's PDF report
     * @param qrCodeId The QR code ID to encode
     * @return QR code as byte array
     */
    public byte[] generatePatientQRCode(String qrCodeId) throws WriterException, IOException {
        // Create the URL that will automatically download the PDF when scanned
        String qrUrl = baseUrl + "/api/patients/qr/" + qrCodeId + "/pdf";
        return generateQRCode(qrUrl, 300, 300);
    }

    /**
     * Generate QR code for patient PDF download
     * The QR code contains a URL that directly downloads the patient's PDF report
     * @param qrCodeId The QR code ID to encode
     * @return QR code as byte array
     */
    public byte[] generatePatientPDFQRCode(String qrCodeId) throws WriterException, IOException {
        // Create the URL that will trigger PDF download
        String pdfUrl = baseUrl + "/api/patients/qr/" + qrCodeId + "/pdf";
        return generateQRCode(pdfUrl, 300, 300);
    }
}