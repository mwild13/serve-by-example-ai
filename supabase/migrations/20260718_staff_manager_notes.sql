-- Add manager_notes column to venue_staff for private per-staff notes
ALTER TABLE venue_staff ADD COLUMN IF NOT EXISTS manager_notes TEXT;
