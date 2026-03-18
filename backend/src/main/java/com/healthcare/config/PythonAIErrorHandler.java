package com.healthcare.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.ResponseErrorHandler;

import java.io.IOException;

@Slf4j
public class PythonAIErrorHandler implements ResponseErrorHandler {

    @Override
    public boolean hasError(ClientHttpResponse response) throws IOException {
        HttpStatus status = HttpStatus.resolve(response.getStatusCode().value());
        return status != null && (status.is4xxClientError() || status.is5xxServerError());
    }

    @Override
    public void handleError(ClientHttpResponse response) throws IOException {
        log.error("Python AI service error - Status: {}, Message: {}", 
                response.getStatusCode(), response.getStatusText());
        
        // Don't throw exception - let the service handle fallback
        // This prevents the entire transfer system from failing if AI is down
    }
}