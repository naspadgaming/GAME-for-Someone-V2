-- Run this once in the Supabase SQL Editor for the project used by this game.
create table if not exists public.greeting_cards (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- The Vercel function uses the server-only service role key. Do not add a public
-- read/insert policy: the private inbox is fetched only through the password-protected API.
alter table public.greeting_cards enable row level security;
grant usage on schema public to service_role;
grant select, insert on public.greeting_cards to service_role;
