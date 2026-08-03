-- ParentLock · Parte 5/5
-- Convite por e-mail da conta autenticada, sem expor endereços entre participantes.

create table if not exists public.email_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_email_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null
);

create index if not exists email_invites_lookup_idx
  on public.email_invites (invitee_email_hash, status, expires_at);

create or replace function public.create_email_invite(input_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  target_household uuid;
  invite_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select household_id into target_household
  from public.household_members
  where user_id = auth.uid()
    and role = 'admin'
    and status = 'active'
  order by created_at
  limit 1;

  if target_household is null then
    raise exception 'admin_household_required';
  end if;

  normalized_email := lower(trim(input_email));
  if position('@' in normalized_email) < 2 then
    raise exception 'invalid_email';
  end if;

  insert into public.email_invites (household_id, inviter_id, invitee_email_hash)
  values (target_household, auth.uid(), encode(extensions.digest(normalized_email, 'sha256'), 'hex'))
  returning id into invite_id;

  return jsonb_build_object(
    'invite_id', invite_id,
    'status', 'pending',
    'expires_at', now() + interval '24 hours'
  );
end;
$$;

create or replace function public.list_my_email_invites()
returns table (
  id uuid,
  household_id uuid,
  status text,
  created_at timestamptz,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select id, household_id, status, created_at, expires_at
  from public.email_invites
  where invitee_email_hash = encode(extensions.digest(lower(auth.jwt()->>'email'), 'sha256'), 'hex')
    and status = 'pending'
    and expires_at > now()
  order by created_at desc;
$$;

create or replace function public.accept_email_invite(input_invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.email_invites;
  admin_device uuid;
  companion_device uuid;
begin
  select * into invite
  from public.email_invites
  where id = input_invite_id
    and status = 'pending'
    and expires_at > now()
    and invitee_email_hash = encode(extensions.digest(lower(auth.jwt()->>'email'), 'sha256'), 'hex');

  if invite.id is null or auth.uid() is null then
    raise exception 'invite_not_available';
  end if;

  insert into public.household_members (household_id, user_id, role, status)
  values (invite.household_id, auth.uid(), 'companion', 'active')
  on conflict (household_id, user_id)
  do update set status = 'active', updated_at = now();

  select id into admin_device
  from public.devices
  where household_id = invite.household_id
    and user_id = invite.inviter_id
  limit 1;

  if admin_device is null then
    insert into public.devices (household_id, user_id, role, label, platform)
    values (invite.household_id, invite.inviter_id, 'admin', 'ParentLock Admin', 'android')
    returning id into admin_device;
  end if;

  insert into public.devices (household_id, user_id, role, label, platform)
  values (invite.household_id, auth.uid(), 'companion', 'ParentLock Companion', 'android')
  returning id into companion_device;

  insert into public.device_consents (
    household_id,
    source_device_id,
    target_device_id,
    location_enabled,
    arrival_alerts_enabled,
    audio_requests_enabled,
    history_enabled
  )
  values (invite.household_id, companion_device, admin_device, false, false, false, false)
  on conflict (source_device_id, target_device_id) do nothing;

  update public.email_invites
  set status = 'accepted', accepted_at = now(), accepted_by = auth.uid()
  where id = invite.id;

  return true;
end;
$$;

alter table public.email_invites enable row level security;

drop policy if exists "admins can view email invites" on public.email_invites;
drop policy if exists "invitees can view their email invites" on public.email_invites;

create policy "admins can view email invites"
  on public.email_invites for select
  using (inviter_id = auth.uid() or public.is_household_member(household_id));

create policy "invitees can view their email invites"
  on public.email_invites for select
  using (
    invitee_email_hash = encode(extensions.digest(lower(auth.jwt()->>'email'), 'sha256'), 'hex')
  );

do $$ begin
  alter publication supabase_realtime add table public.email_invites;
exception when duplicate_object then null;
end $$;
