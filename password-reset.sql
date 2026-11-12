-- Run this ONCE in the Supabase SQL editor.
create table if not exists public.rv_password_resets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.rv_users(id) on delete cascade,
  otp_hash    text not null,
  attempts    int  not null default 0,
  expires_at  timestamptz not null,
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists rv_password_resets_user_idx on public.rv_password_resets(user_id);
-- Only the server (service-role key) touches this table.
alter table public.rv_password_resets enable row level security;
