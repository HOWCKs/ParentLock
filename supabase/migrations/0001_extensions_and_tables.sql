-- ParentLock · Parte 1/3
-- Extensões, tipos e tabelas principais.

-- ParentLock core data model.
-- The mobile client never stores raw pairing codes or a service_role key.

create extension if not exists pgcrypto;

do $$ begin
  create type public.member_role as enum ('admin', 'companion');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_status as enum ('pending', 'active', 'revoked');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pairing_request_status as enum ('pending', 'accepted', 'rejected', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_type as enum ('sos', 'arrival', 'departure', 'permission');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_status as enum ('open', 'acknowledged', 'resolved');
exception when duplicate_object then null;
end $$;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Minha família',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null,
  status public.member_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null,
  label text,
  platform text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pairing_codes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pairing_codes_active_idx
  on public.pairing_codes (code_hash, expires_at)
  where consumed_at is null;

create table if not exists public.pairing_requests (
  id uuid primary key default gen_random_uuid(),
  pairing_code_id uuid not null references public.pairing_codes(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  status public.pairing_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.device_consents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  source_device_id uuid not null references public.devices(id) on delete cascade,
  target_device_id uuid not null references public.devices(id) on delete cascade,
  location_enabled boolean not null default false,
  arrival_alerts_enabled boolean not null default false,
  audio_requests_enabled boolean not null default false,
  history_enabled boolean not null default false,
  audio_accepted_at timestamptz,
  paused_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (source_device_id, target_device_id)
);

create table if not exists public.location_points (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_meters double precision,
  recorded_at timestamptz not null default now()
);

create index if not exists location_points_device_time_idx
  on public.location_points (device_id, recorded_at desc);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  type public.alert_type not null,
  status public.alert_status not null default 'open',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create index if not exists alerts_household_time_idx
  on public.alerts (household_id, created_at desc);
