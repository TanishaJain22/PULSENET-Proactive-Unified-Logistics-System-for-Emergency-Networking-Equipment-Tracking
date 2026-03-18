package com.healthcare.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotWritableException(
            HttpMessageNotWritableException ex, WebRequest request) {
        
        log.error("JSON serialization error: {}", ex.getMessage(), ex);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Serialization Error");
        errorResponse.put("message", "Unable to serialize response data. This may be due to circular references or lazy loading issues.");
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, WebRequest request) {
        
        log.error("JSON deserialization error: {}", ex.getMessage(), ex);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Invalid Request Data");
        
        // Check if it's an enum validation error
        if (ex.getCause() instanceof InvalidFormatException) {
            InvalidFormatException ife = (InvalidFormatException) ex.getCause();
            if (ife.getTargetType().isEnum()) {
                String enumName = ife.getTargetType().getSimpleName();
                Object[] enumValues = ife.getTargetType().getEnumConstants();
                
                errorResponse.put("message", String.format("Invalid value '%s' for %s", ife.getValue(), enumName));
                errorResponse.put("valid_values", enumValues);
                errorResponse.put("field", ife.getPath().get(ife.getPath().size() - 1).getFieldName());
            } else {
                errorResponse.put("message", "Invalid data format: " + ife.getOriginalMessage());
            }
        } else {
            errorResponse.put("message", "Invalid JSON format or data type");
        }
        
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFoundException(
            NoResourceFoundException ex, WebRequest request) {
        
        String path = ex.getResourcePath();
        log.warn("Static resource not found: {}", path);
        
        // Check if this looks like an API call that's missing the /api prefix
        if (path.startsWith("ambulances/") || path.startsWith("hospitals/") || 
            path.startsWith("doctors/") || path.startsWith("transfers/")) {
            
            log.warn("Possible missing /api prefix in request: {}", path);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "API Endpoint Not Found");
            errorResponse.put("message", "The requested endpoint was not found. Make sure to include '/api' prefix for API calls.");
            errorResponse.put("suggestion", "Try: /api/" + path);
            errorResponse.put("timestamp", System.currentTimeMillis());
            errorResponse.put("path", request.getDescription(false));
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Resource Not Found");
        errorResponse.put("message", "The requested resource was not found: " + path);
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", "An unexpected error occurred");
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}