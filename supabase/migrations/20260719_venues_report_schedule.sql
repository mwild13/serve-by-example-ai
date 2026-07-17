-- Weekly report email schedule per venue
-- JSON shape: { enabled: boolean, dayOfWeek: 0-6, email: string }
ALTER TABLE venues ADD COLUMN IF NOT EXISTS report_schedule JSONB;
