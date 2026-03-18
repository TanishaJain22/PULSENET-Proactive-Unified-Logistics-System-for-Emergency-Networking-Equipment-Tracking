-- Add notification system tables
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('EMERGENCY', 'WARNING', 'INFO', 'SUCCESS')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('EMERGENCY', 'TRANSFER', 'AMBULANCE', 'RESOURCE', 'SYSTEM', 'MAINTENANCE', 'PATIENT', 'DOCTOR', 'CAPACITY')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    read_by VARCHAR(100),
    related_entity_id UUID,
    related_entity_type VARCHAR(50),
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    metadata TEXT,
    expires_at TIMESTAMP,
    auto_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    CONSTRAINT fk_notifications_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_notifications_hospital_id ON notifications(hospital_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Create composite indexes for common queries
CREATE INDEX idx_notifications_hospital_unread ON notifications(hospital_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_hospital_category ON notifications(hospital_id, category);
CREATE INDEX idx_notifications_hospital_type ON notifications(hospital_id, type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_notification_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- Insert sample notifications for testing
INSERT INTO notifications (hospital_id, title, message, type, priority, category, created_by) VALUES
(
    (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
    '🚨 Critical Patient Transfer Request',
    'Emergency transfer request from Metro Hospital for cardiac patient. Immediate response required.',
    'EMERGENCY',
    'HIGH',
    'TRANSFER',
    'SYSTEM'
),
(
    (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
    '⚠️ ICU Capacity Alert',
    'ICU capacity is at 90%. Consider preparing for potential overflow protocols.',
    'WARNING',
    'HIGH',
    'CAPACITY',
    'SYSTEM'
),
(
    (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
    '🚑 New Ambulance Request',
    'Emergency ambulance requested for patient at MG Road. Immediate dispatch required.',
    'EMERGENCY',
    'HIGH',
    'AMBULANCE',
    'SYSTEM'
),
(
    (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
    '👨‍⚕️ New Doctor Registration',
    'Dr. Rajesh Kumar has been registered in Cardiology department.',
    'INFO',
    'LOW',
    'DOCTOR',
    'SYSTEM'
),
(
    (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
    '🔧 System Maintenance Scheduled',
    'Routine system maintenance scheduled for tonight 2:00 AM - 4:00 AM. Backup systems will be active.',
    'INFO',
    'MEDIUM',
    'SYSTEM',
    'SYSTEM'
),
(
    (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
    '✅ Patient Transfer Completed',
    'Patient Shubh Sharma transfer to AIIMS completed successfully. All documentation updated.',
    'SUCCESS',
    'LOW',
    'TRANSFER',
    'SYSTEM'
);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Hospital notification system for real-time alerts and updates';
COMMENT ON COLUMN notifications.type IS 'Notification type: EMERGENCY, WARNING, INFO, SUCCESS';
COMMENT ON COLUMN notifications.priority IS 'Priority level: HIGH, MEDIUM, LOW';
COMMENT ON COLUMN notifications.category IS 'Category: EMERGENCY, TRANSFER, AMBULANCE, RESOURCE, SYSTEM, MAINTENANCE, PATIENT, DOCTOR, CAPACITY';
COMMENT ON COLUMN notifications.related_entity_id IS 'ID of related entity (patient, transfer, ambulance, etc.)';
COMMENT ON COLUMN notifications.related_entity_type IS 'Type of related entity (PATIENT, TRANSFER, AMBULANCE_REQUEST, etc.)';
COMMENT ON COLUMN notifications.action_url IS 'URL for notification action button';
COMMENT ON COLUMN notifications.expires_at IS 'When notification should be automatically removed';
COMMENT ON COLUMN notifications.auto_read IS 'Whether notification should be automatically marked as read after time delay';