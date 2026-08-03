-- ParentLock · Parte 2/3
-- Funções seguras para conta, convite e solicitação de vínculo.

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
