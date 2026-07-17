-- AI Coach conversation history per manager/venue (auto-expires after 30 days)
CREATE TABLE IF NOT EXISTS manager_coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_user_id UUID NOT NULL REFERENCES auth.users(id),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'coach')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_sessions_manager ON manager_coach_sessions(manager_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_venue ON manager_coach_sessions(venue_id, created_at DESC);

ALTER TABLE manager_coach_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manager_access_own_coach_sessions" ON manager_coach_sessions
  USING (manager_user_id = auth.uid())
  WITH CHECK (manager_user_id = auth.uid());
