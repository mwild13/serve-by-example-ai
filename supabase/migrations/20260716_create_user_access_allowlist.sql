CREATE TABLE IF NOT EXISTS public.user_access_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  platform_role text NOT NULL CHECK (platform_role IN ('staff', 'venue_manager', 'multi_venue_manager', 'admin'))
);

-- Only service role can manage the allowlist
ALTER TABLE public.user_access_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.user_access_allowlist
  USING (false);
