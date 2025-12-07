-- Add feedback column to studio_requests table
ALTER TABLE studio_requests ADD COLUMN IF NOT EXISTS feedback TEXT;
