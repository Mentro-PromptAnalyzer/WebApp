-- Contains user prompt text in analysis_result. Apply only after the
-- retention/privacy decision and isolated Auth/RLS acceptance in HISTORY-ACCEPTANCE.md.
create table public.chat_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  overall_score integer not null check (overall_score between 0 and 100),
  prompt_count integer not null check (prompt_count >= 0),
  platform text not null default 'unknown',
  analysis_result jsonb not null check (jsonb_typeof(analysis_result) = 'object'),
  created_at timestamptz not null default now()
);

create index chat_histories_user_created_idx
  on public.chat_histories (user_id, created_at desc, id desc);

alter table public.chat_histories enable row level security;
revoke all on table public.chat_histories from anon, authenticated;
grant select, insert, delete on table public.chat_histories to authenticated;

create policy "Owners can read their histories"
  on public.chat_histories for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can create their histories"
  on public.chat_histories for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can delete their histories"
  on public.chat_histories for delete to authenticated
  using ((select auth.uid()) = user_id);
