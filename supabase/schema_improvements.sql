-- ─────────────────────────────────────────────────────────────────────────────
-- schema_improvements.sql
-- Missing indexes + query helpers for debugging email and auth issues.
-- Safe to run multiple times (all use IF NOT EXISTS / OR REPLACE).
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- PART A — Missing indexes
-- venue_staff and training_programs are queried by venue_id and manager_user_id
-- constantly. The FK columns themselves are not automatically indexed.
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_venue_staff_venue_id
  on public.venue_staff(venue_id);

create index if not exists idx_venue_staff_manager_user_id
  on public.venue_staff(manager_user_id);

create index if not exists idx_training_programs_venue_id
  on public.training_programs(venue_id);

create index if not exists idx_training_programs_manager_user_id
  on public.training_programs(manager_user_id);

create index if not exists idx_venue_inventory_venue_id
  on public.venue_inventory_items(venue_id);

create index if not exists idx_pending_invites_manager_user_id
  on public.pending_invites(manager_user_id);

create index if not exists idx_pending_invites_email
  on public.pending_invites(email);

-- Partial index to quickly find unexpired/unclaimed invites
create index if not exists idx_pending_invites_active
  on public.pending_invites(email, expires_at)
  where used_at is null;


-- ─────────────────────────────────────────────────────────────────────────────
-- PART B — Auth log queries (requires "Schema & Logs" enabled in Supabase)
--
-- Run these in the SQL editor to debug password reset / invite email failures.
-- ─────────────────────────────────────────────────────────────────────────────

-- Recent password recovery requests (shows whether Supabase even tried to send)
SELECT
  id,
  created_at,
  ip_address,
  payload ->> 'email' AS email,
  payload ->> 'action' AS action
FROM auth.audit_log_entries
WHERE payload ->> 'action' IN (
  'user_recovery_requested',
  'user_invited',
  'user_signedup',
  'password_recovery'
)
ORDER BY created_at DESC
LIMIT 20;


-- ─────────────────────────────────────────────────────────────────────────────
-- PART C — Slow query analysis (requires pg_stat_statements extension)
-- Enable in Supabase: Database → Extensions → pg_stat_statements
-- ─────────────────────────────────────────────────────────────────────────────

-- Top 10 slowest queries by total time
SELECT
  left(query, 100)                                     AS query_preview,
  calls,
  round(total_exec_time::numeric, 2)                   AS total_ms,
  round((total_exec_time / calls)::numeric, 2)         AS avg_ms,
  round(max_exec_time::numeric, 2)                     AS max_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY total_exec_time DESC
LIMIT 10;

-- Cache hit rate (should be > 99%; below 95% means you need more RAM)
SELECT
  sum(heap_blks_hit)  AS cache_hits,
  sum(heap_blks_read) AS disk_reads,
  round(
    100.0 * sum(heap_blks_hit) /
    nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0),
    2
  ) AS cache_hit_pct
FROM pg_statio_user_tables;
