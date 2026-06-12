-- Phase 2: todos table with Row Level Security
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  text text not null check (char_length(trim(text)) > 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

alter table public.todos enable row level security;

create policy "Users can view own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);
