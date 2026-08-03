-- ParentLock · Parte 3/3
-- RLS e canais Realtime.

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
