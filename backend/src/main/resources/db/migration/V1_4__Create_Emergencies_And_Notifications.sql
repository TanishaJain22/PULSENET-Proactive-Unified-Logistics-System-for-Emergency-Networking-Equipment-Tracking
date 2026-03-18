-- Create emergencies table
CREATE TABLE IF NOT EXISTS emergencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL,
    patient_name VARCHAR(255),
    condition VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    eta VARCHAR(100) NOT NULL,
    current_location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    ambulance_id VARCHAR(100),
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    heart_rate INTEGER,
    blood_pressure VARCHAR(50),
    oxygen_saturation INTEGER,
    temperature DOUBLE PRECISION,
    respiratory_rate INTEGER,
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    injury_details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    arrival_time TIMESTAMP,
    CONSTRAINT fk_emergency_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Create indexes for better query performance on emergencies table
CREATE INDEX IF NOT EXISTS idx_emergencies_hospital_id ON emergencies(hospital_id);
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_created_at ON emergencies(created_at);
