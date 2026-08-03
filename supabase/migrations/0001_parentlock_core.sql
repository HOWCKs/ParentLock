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

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.get_or_create_household()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_household uuid;
  new_household uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select household_id into existing_household
  from public.household_members
  where user_id = auth.uid()
    and role = 'admin'
    and status = 'active'
  order by created_at
  limit 1;

  if existing_household is not null then
    return existing_household;
  end if;

  insert into public.households (created_by)
  values (auth.uid())
  returning id into new_household;

  insert into public.household_members (household_id, user_id, role, status)
  values (new_household, auth.uid(), 'admin', 'active');

  return new_household;
end;
$$;

create or replace function public.create_pairing_code(target_household uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_code text;
begin
  if not public.is_household_member(target_household) then
    raise exception 'not_a_household_member';
  end if;

  raw_code := 'PL-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8));

  insert into public.pairing_codes (household_id, created_by, code_hash, expires_at)
  values (
    target_household,
    auth.uid(),
    encode(digest(raw_code, 'sha256'), 'hex'),
    now() + interval '15 minutes'
  );

  return raw_code;
end;
$$;

create or replace function public.redeem_pairing_code(input_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.pairing_codes;
  request_id uuid;
  normalized_code text;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  normalized_code := upper(trim(input_code));

  select * into invite
  from public.pairing_codes
  where code_hash = encode(digest(normalized_code, 'sha256'), 'hex')
    and consumed_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if invite.id is null then
    raise exception 'invalid_or_expired_code';
  end if;

  insert into public.pairing_requests (pairing_code_id, household_id, requester_id)
  values (invite.id, invite.household_id, auth.uid())
  returning id into request_id;

  return jsonb_build_object(
    'request_id', request_id,
    'household_id', invite.household_id,
    'status', 'pending',
    'requires_consent', true
  );
end;
$$;

create or replace function public.accept_pairing_request(input_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.pairing_requests;
begin
  select * into request_row
  from public.pairing_requests
  where id = input_request_id
    and status = 'pending';

  if request_row.id is null or not public.is_household_member(request_row.household_id) then
    raise exception 'request_not_available';
  end if;

  update public.pairing_requests
  set status = 'accepted', updated_at = now()
  where id = input_request_id;

  update public.pairing_codes
  set consumed_at = now()
  where id = request_row.pairing_code_id;

  insert into public.household_members (household_id, user_id, role, status)
  values (request_row.household_id, request_row.requester_id, 'companion', 'active')
  on conflict (household_id, user_id)
  do update set status = 'active', updated_at = now();

  return true;
end;
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.devices enable row level security;
alter table public.pairing_codes enable row level security;
alter table public.pairing_requests enable row level security;
alter table public.device_consents enable row level security;
alter table public.location_points enable row level security;
alter table public.alerts enable row level security;

create policy "members can view households"
  on public.households for select
  using (public.is_household_member(id) or created_by = auth.uid());

create policy "members can view membership"
  on public.household_members for select
  using (user_id = auth.uid() or public.is_household_member(household_id));

create policy "members can view devices"
  on public.devices for select
  using (public.is_household_member(household_id) or user_id = auth.uid());

create policy "members can view pairing codes"
  on public.pairing_codes for select
  using (public.is_household_member(household_id) or created_by = auth.uid());

create policy "requesters and members can view pairing requests"
  on public.pairing_requests for select
  using (requester_id = auth.uid() or public.is_household_member(household_id));

create policy "members can view consents"
  on public.device_consents for select
  using (public.is_household_member(household_id));

create policy "members can view location points"
  on public.location_points for select
  using (
    exists (
      select 1 from public.devices d
      where d.id = device_id and public.is_household_member(d.household_id)
    )
  );

create policy "members can view alerts"
  on public.alerts for select
  using (public.is_household_member(household_id));

-- Realtime is restricted by the RLS policies above.
do $$ begin
  alter publication supabase_realtime add table public.pairing_requests;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.device_consents;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.location_points;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.alerts;
exception when duplicate_object then null;
end $$;
