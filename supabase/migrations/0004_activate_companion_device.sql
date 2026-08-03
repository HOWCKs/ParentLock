-- ParentLock · Parte 4/4
-- Aceite do Admin ativa o dispositivo Companion sem criar dados falsos.

create or replace function public.accept_pairing_request(input_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.pairing_requests;
  admin_device uuid;
  companion_device uuid;
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

  select id into admin_device
  from public.devices
  where household_id = request_row.household_id
    and user_id = auth.uid()
  limit 1;

  if admin_device is null then
    insert into public.devices (household_id, user_id, role, label, platform)
    values (request_row.household_id, auth.uid(), 'admin', 'ParentLock Admin', 'android')
    returning id into admin_device;
  end if;

  select id into companion_device
  from public.devices
  where household_id = request_row.household_id
    and user_id = request_row.requester_id
  limit 1;

  if companion_device is null then
    insert into public.devices (household_id, user_id, role, label, platform)
    values (request_row.household_id, request_row.requester_id, 'companion', 'ParentLock Companion', 'android')
    returning id into companion_device;
  end if;

  insert into public.device_consents (
    household_id,
    source_device_id,
    target_device_id,
    location_enabled,
    arrival_alerts_enabled,
    audio_requests_enabled,
    history_enabled
  )
  values (
    request_row.household_id,
    companion_device,
    admin_device,
    false,
    false,
    false,
    false
  )
  on conflict (source_device_id, target_device_id) do nothing;

  return true;
end;
$$;
