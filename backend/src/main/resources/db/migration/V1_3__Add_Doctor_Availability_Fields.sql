-- Add availability_status and notes columns to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS notes TEXT;

-- Set default availability status for existing doctors
UPDATE doctors SET availability_status = 'AVAILABLE' WHERE availability_status IS NULL;
