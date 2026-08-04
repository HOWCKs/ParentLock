-- ParentLock · Parte 8/8
-- Uso de aplicativos e regras de bloqueio, sempre com acesso explícito no Companion.

create table if not exists public.app_usage_daily (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  package_name text not null,
  app_label text not null,
  usage_seconds integer not null default 0 check (usage_seconds >= 0),
  usage_date date not null default current_date,
  recorded_at timestamptz not null default now(),
  unique (device_id, package_name, usage_date)
);

create table if not exists public.usage_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  device_id uuid references public.devices(id) on delete cascade,
  package_name text not null,
  app_label text not null,
  daily_limit_minutes integer check (daily_limit_minutes is null or daily_limit_minutes between 1 and 1440),
  blocked boolean not null default false,
  schedule_start time,
  schedule_end time,
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_usage_daily_device_date_idx
  on public.app_usage_daily (device_id, usage_date desc);

create index if not exists usage_rules_household_idx
  on public.usage_rules (household_id, active);

alter table public.app_usage_daily enable row level security;
alter table public.usage_rules enable row level security;

drop policy if exists "members can view app usage" on public.app_usage_daily;
create policy "members can view app usage"
  on public.app_usage_daily for select
  using (public.is_household_member(household_id));

drop policy if exists "members can view usage rules" on public.usage_rules;
create policy "members can view usage rules"
  on public.usage_rules for select
  using (public.is_household_member(household_id));

drop policy if exists "admins can create usage rules" on public.usage_rules;
create policy "admins can create usage rules"
  on public.usage_rules for insert
  with check (
    created_by = auth.uid()
    and public.is_household_member(household_id)
    and exists (
      select 1 from public.household_members
      where household_id = usage_rules.household_id
        and user_id = auth.uid()
        and role = 'admin'
        and status = 'active'
    )
  );

do $$ begin
  alter publication supabase_realtime add table public.app_usage_daily;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.usage_rules;
exception when duplicate_object then null;
end $$;
