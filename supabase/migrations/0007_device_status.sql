-- ParentLock · Parte 7/7
-- Status do aparelho para exibição no Admin: bateria e tipo de conexão.

alter table public.devices
  add column if not exists battery_percent smallint check (battery_percent between 0 and 100),
  add column if not exists connection_type text,
  add column if not exists last_status_at timestamptz;

drop policy if exists "device owners can update status" on public.devices;

create policy "device owners can update status"
  on public.devices for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.devices;
exception when duplicate_object then null;
end $$;
