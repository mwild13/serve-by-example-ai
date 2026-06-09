create table if not exists public.toolkit_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  role text not null,
  utm_campaign text,
  toolkit_delivered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.toolkit_leads enable row level security;

-- Only service role (admin client) can read/write — no public access
create policy "Service role only" on public.toolkit_leads
  as restrictive
  for all
  to authenticated
  using (false);
