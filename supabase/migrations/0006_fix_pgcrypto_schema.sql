-- ParentLock · Correção 6/6
-- Supabase mantém as funções do pgcrypto no schema extensions.

create extension if not exists pgcrypto with schema extensions;

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

  raw_code := 'PL-' || upper(substr(encode(extensions.gen_random_bytes(5), 'hex'), 1, 8));

  insert into public.pairing_codes (household_id, created_by, code_hash, expires_at)
  values (
    target_household,
    auth.uid(),
    encode(extensions.digest(raw_code, 'sha256'), 'hex'),
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
  where code_hash = encode(extensions.digest(normalized_code, 'sha256'), 'hex')
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
