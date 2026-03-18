-- Create AI Analysis Results table
CREATE TABLE ai_analysis_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('IMAGE', 'SYMPTOM', 'VOICE')),
    specialty VARCHAR(50),
    model_type VARCHAR(20),
    
    -- Input data
    image_url VARCHAR(500),
    symptoms_text TEXT,
    voice_transcript TEXT,
    
    -- Results
    prediction VARCHAR(255),
    confidence DECIMAL(5,2),
    severity VARCHAR(50) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    
    -- Metadata
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create AI Analysis Recommendations table (for storing array of recommendations)
CREATE TABLE ai_analysis_recommendations (
    analysis_id BIGINT NOT NULL,
    recommendation TEXT NOT NULL,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis_results(id) ON DELETE CASCADE
);

-- Create Voice Sessions table
CREATE TABLE voice_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255) UNIQUE,
    transcript TEXT,
    ai_response TEXT,
    audio_url VARCHAR(500),
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_ai_analysis_user_id ON ai_analysis_results(user_id);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis_results(created_at);
CREATE INDEX idx_ai_analysis_type ON ai_analysis_results(analysis_type);
CREATE INDEX idx_ai_analysis_specialty ON ai_analysis_results(specialty);
CREATE INDEX idx_ai_analysis_severity ON ai_analysis_results(severity);

CREATE INDEX idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_session_id ON voice_sessions(session_id);
CREATE INDEX idx_voice_sessions_created_at ON voice_sessions(created_at);

-- Add comments for documentation
COMMENT ON TABLE ai_analysis_results IS 'Stores AI-powered health analysis results including image analysis, symptom checking, and voice consultations';
COMMENT ON TABLE ai_analysis_recommendations IS 'Stores recommendations associated with AI analysis results';
COMMENT ON TABLE voice_sessions IS 'Stores voice consultation sessions with AI health assistant';

COMMENT ON COLUMN ai_analysis_results.analysis_type IS 'Type of analysis: IMAGE, SYMPTOM, or VOICE';
COMMENT ON COLUMN ai_analysis_results.specialty IS 'Medical specialty: chest, dermatology, ophthalmology, etc.';
COMMENT ON COLUMN ai_analysis_results.model_type IS 'AI model used: small, base, or large';
COMMENT ON COLUMN ai_analysis_results.confidence IS 'AI confidence score as percentage (0-100)';
COMMENT ON COLUMN ai_analysis_results.severity IS 'Risk/severity level: LOW, MEDIUM, HIGH, CRITICAL';
COMMENT ON COLUMN ai_analysis_results.processing_time_ms IS 'Time taken to process the analysis in milliseconds';