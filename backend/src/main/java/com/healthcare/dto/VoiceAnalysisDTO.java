package com.healthcare.dto;

import java.time.LocalDateTime;

public class VoiceAnalysisDTO {
    private Long id;
    private Long userId;
    private String transcription;
    private String response;
    private String audioUrl;
    private LocalDateTime analyzedAt;

    // Constructors
    public VoiceAnalysisDTO() {}

    public VoiceAnalysisDTO(String transcription, String response) {
        this.transcription = transcription;
        this.response = response;
        this.analyzedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTranscription() { return transcription; }
    public void setTranscription(String transcription) { this.transcription = transcription; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}