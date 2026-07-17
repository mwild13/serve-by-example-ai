-- Custom certifications per staff member (First Aid, Barista, Liquor Licence, etc.)
CREATE TABLE IF NOT EXISTS venue_staff_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_staff_id UUID NOT NULL REFERENCES venue_staff(id) ON DELETE CASCADE,
  cert_name TEXT NOT NULL,
  cert_number TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_staff_certs_staff_id ON venue_staff_certifications(venue_staff_id);

ALTER TABLE venue_staff_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manager_access_custom_certs" ON venue_staff_certifications
  USING (
    venue_staff_id IN (
      SELECT id FROM venue_staff WHERE manager_user_id = auth.uid()
    )
  )
  WITH CHECK (
    venue_staff_id IN (
      SELECT id FROM venue_staff WHERE manager_user_id = auth.uid()
    )
  );
