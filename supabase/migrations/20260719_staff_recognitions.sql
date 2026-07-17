-- Manager recognition messages sent to staff members
CREATE TABLE IF NOT EXISTS staff_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES venue_staff(id) ON DELETE CASCADE,
  from_manager_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_recognitions_staff ON staff_recognitions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_recognitions_manager ON staff_recognitions(from_manager_id, created_at DESC);

ALTER TABLE staff_recognitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manager_manage_recognitions" ON staff_recognitions
  USING (from_manager_id = auth.uid())
  WITH CHECK (from_manager_id = auth.uid());
