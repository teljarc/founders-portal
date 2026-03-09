-- Teljarc — Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Idéer
create table ideas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  description text,
  tags text[],
  created_by uuid references auth.users(id) on delete cascade,
  created_by_name text
);

-- Röster (en röst per användare och idé, upsert)
create table votes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  vote_type text not null,
  unique(idea_id, user_id)
);

-- Kommentarer (med enkel threading via parent_id)
create table comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  idea_id uuid references ideas(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  body text not null
);

-- Notifikationer
create table notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  read boolean default false,
  idea_id uuid references ideas(id) on delete cascade,
  triggered_by_name text
);

-- Push-subscriptions (för Web Push)
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- Byggda appar/projekt
create table projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  description text,
  url text,
  status text default 'live',
  created_by uuid references auth.users(id) on delete cascade,
  created_by_name text
);

-- Context-filer (CLAUDE.md, MEMORY.md, TODO.md etc)
create table context_files (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz default now(),
  slug text unique not null,
  content text not null,
  updated_by_name text
);

-- Publicerade idéer för gäströstning
create table published_ideas (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade unique,
  published_at timestamptz default now(),
  published_by uuid references auth.users(id)
);

-- Gästers röster (skala 1–5)
create table guest_votes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  idea_id uuid references ideas(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  score int not null check (score between 1 and 5),
  unique(idea_id, user_id)
);

-- Gästers kommentarer
create table guest_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  idea_id uuid references ideas(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  body text not null
);

-- ===================
-- Row Level Security
-- ===================

alter table ideas enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;
alter table projects enable row level security;
alter table context_files enable row level security;
alter table published_ideas enable row level security;
alter table guest_votes enable row level security;
alter table guest_comments enable row level security;

-- Ideas: all authenticated can read, only creator can delete
create policy "Anyone can read ideas" on ideas for select to authenticated using (true);
create policy "Authenticated can insert ideas" on ideas for insert to authenticated with check (auth.uid() = created_by);
create policy "Creator can delete ideas" on ideas for delete to authenticated using (auth.uid() = created_by);

-- Votes: all authenticated can read, users manage own votes
create policy "Anyone can read votes" on votes for select to authenticated using (true);
create policy "Users can insert own votes" on votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own votes" on votes for update to authenticated using (auth.uid() = user_id);

-- Comments: all authenticated can read, users can insert own
create policy "Anyone can read comments" on comments for select to authenticated using (true);
create policy "Users can insert comments" on comments for insert to authenticated with check (auth.uid() = user_id);

-- Notifications: users can only see own
create policy "Users read own notifications" on notifications for select to authenticated using (auth.uid() = user_id);
create policy "Authenticated can insert notifications" on notifications for insert to authenticated with check (true);
create policy "Users update own notifications" on notifications for update to authenticated using (auth.uid() = user_id);

-- Push subscriptions: users manage own
create policy "Users read own subs" on push_subscriptions for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own subs" on push_subscriptions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own subs" on push_subscriptions for delete to authenticated using (auth.uid() = user_id);

-- Projects: all authenticated can read, creator manages
create policy "Anyone can read projects" on projects for select to authenticated using (true);
create policy "Authenticated can insert projects" on projects for insert to authenticated with check (auth.uid() = created_by);
create policy "Creator can delete projects" on projects for delete to authenticated using (auth.uid() = created_by);

-- Context files: all authenticated can read and upsert
create policy "Anyone can read context" on context_files for select to authenticated using (true);
create policy "Anyone can insert context" on context_files for insert to authenticated with check (true);
create policy "Anyone can update context" on context_files for update to authenticated using (true);

-- Published ideas: all authenticated can read, founders can manage
create policy "Anyone can read published" on published_ideas for select to authenticated using (true);
create policy "Founders can insert published" on published_ideas for insert to authenticated with check (true);
create policy "Founders can delete published" on published_ideas for delete to authenticated using (true);

-- Guest votes: all authenticated can read, guests manage own
create policy "Anyone can read guest votes" on guest_votes for select to authenticated using (true);
create policy "Users can insert guest votes" on guest_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update guest votes" on guest_votes for update to authenticated using (auth.uid() = user_id);

-- Guest comments: all authenticated can read, guests insert own
create policy "Anyone can read guest comments" on guest_comments for select to authenticated using (true);
create policy "Users can insert guest comments" on guest_comments for insert to authenticated with check (auth.uid() = user_id);

-- ===================
-- Enable Realtime
-- ===================

alter publication supabase_realtime add table ideas;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table context_files;
alter publication supabase_realtime add table guest_votes;
alter publication supabase_realtime add table guest_comments;
