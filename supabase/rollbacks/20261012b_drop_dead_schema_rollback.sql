-- Rollback for 20261012b_drop_dead_schema.sql.
-- Puts the table, columns, indexes and foreign key back as they were. The
-- data is not restored: the columns come back empty or at their defaults.

begin;

alter table public.profiles
  add column if not exists avatar text,
  add column if not exists role text,
  add column if not exists manager_id uuid,
  add column if not exists notif_achievement_alerts boolean default false,
  add column if not exists platform_version integer default 1,
  add column if not exists diagnostic_completed_at timestamptz,
  add column if not exists is_founders_user boolean default false,
  add column if not exists all_modules_completed boolean not null default false;

alter table public.profiles
  add constraint profiles_manager_id_fkey
  foreign key (manager_id) references auth.users(id) on delete set null;

create index if not exists idx_profiles_platform_version on public.profiles using btree (platform_version);
create index if not exists idx_profiles_manager_id on public.profiles using btree (manager_id);

-- Anyone who already holds an Elite number had finished every module.
update public.profiles set all_modules_completed = true where coalesce(sbe_elite_number, 0) > 0;

create or replace function public.award_sbe_elite(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_number integer;
begin
  update public.profiles
  set sbe_elite_number = nextval('public.sbe_elite_number_seq'),
      all_modules_completed = true
  where id = p_user_id and coalesce(sbe_elite_number, 0) = 0
  returning sbe_elite_number into v_number;

  if v_number is null then
    select sbe_elite_number into v_number from public.profiles where id = p_user_id;
  end if;
  return v_number;
end;
$function$;

create table if not exists public.pending_invites (
  id uuid primary key default gen_random_uuid(),
  manager_user_id uuid not null references auth.users(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete set null,
  staff_name text not null,
  email text not null,
  invite_link text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz
);

-- Reachable by the service role only, as nothing else ever used it.
alter table public.pending_invites enable row level security;

commit;
