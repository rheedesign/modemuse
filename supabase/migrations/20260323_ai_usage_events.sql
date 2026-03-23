create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  feature text not null,
  success boolean not null default true,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_user_created_at_idx
  on public.ai_usage_events (user_id, created_at desc);

create index if not exists ai_usage_events_user_feature_idx
  on public.ai_usage_events (user_id, feature, created_at desc);

alter table public.ai_usage_events enable row level security;

drop policy if exists "Users can read own ai usage events" on public.ai_usage_events;
create policy "Users can read own ai usage events"
  on public.ai_usage_events
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai usage events" on public.ai_usage_events;
create policy "Users can insert own ai usage events"
  on public.ai_usage_events
  for insert
  with check (auth.uid() = user_id);
