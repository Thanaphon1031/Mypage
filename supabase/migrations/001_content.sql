create extension if not exists pgcrypto;

create table if not exists public.projects (
  id text primary key, title jsonb not null, summary jsonb, description jsonb not null,
  problem jsonb not null default '{}'::jsonb, role jsonb not null default '{}'::jsonb,
  process jsonb not null default '{"th":[],"en":[]}'::jsonb, decisions jsonb not null default '{"th":[],"en":[]}'::jsonb,
  evidence jsonb, results jsonb not null default '{}'::jsonb, learnings jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}', year text not null, cover_image text, demo_url text, repo_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.skills (id text primary key, name jsonb not null, capability jsonb, workflow jsonb, evidence jsonb, tools text[] default '{}', group_name text, level integer);
create table if not exists public.articles (id text primary key, title jsonb not null, excerpt jsonb, date date, read_time integer, tags text[] default '{}', status text default 'draft');
create table if not exists public.timeline (id text primary key, year text not null, title jsonb not null, body jsonb, type text);
create table if not exists public.profile (id text primary key default 'main', content jsonb not null);
create table if not exists public.social_links (id text primary key, label text, url text not null, icon text);
create table if not exists public.contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null, message text not null, status text not null default 'new' check (status in ('new','read','archived')), created_at timestamptz not null default now());

alter table public.projects enable row level security; alter table public.skills enable row level security;
alter table public.articles enable row level security; alter table public.timeline enable row level security;
alter table public.profile enable row level security; alter table public.social_links enable row level security;
alter table public.contact_messages enable row level security;

create or replace function public.touch_updated_at() returns trigger language plpgsql security invoker as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at before update on public.projects for each row execute function public.touch_updated_at();

drop policy if exists "published projects are public" on public.projects;
drop policy if exists "authenticated editors manage projects" on public.projects;
create policy "published projects are public" on public.projects for select to anon, authenticated using (status = 'published');
create policy "authenticated editors manage projects" on public.projects for all to authenticated using (true) with check (true);

do $$ declare table_name text; begin
  foreach table_name in array array['skills','articles','timeline','profile','social_links'] loop
    execute format('drop policy if exists "public published read" on public.%I', table_name);
    execute format('drop policy if exists "authenticated editors manage content" on public.%I', table_name);
    execute format('create policy "authenticated editors manage content" on public.%I for all to authenticated using (true) with check (true)', table_name);
  end loop;
end $$;

drop policy if exists "public published articles are public" on public.articles;
create policy "public published articles are public" on public.articles for select to anon, authenticated using (status = 'published');
drop policy if exists "public skills are public" on public.skills;
create policy "public skills are public" on public.skills for select to anon, authenticated using (true);
drop policy if exists "public timeline is public" on public.timeline;
create policy "public timeline is public" on public.timeline for select to anon, authenticated using (true);
drop policy if exists "public profile is public" on public.profile;
create policy "public profile is public" on public.profile for select to anon, authenticated using (true);
drop policy if exists "public social links are public" on public.social_links;
create policy "public social links are public" on public.social_links for select to anon, authenticated using (true);

drop policy if exists "anyone can send contact" on public.contact_messages;
drop policy if exists "authenticated editors read contact" on public.contact_messages;
drop policy if exists "authenticated editors update contact" on public.contact_messages;
create policy "anyone can send contact" on public.contact_messages for insert to anon, authenticated with check (char_length(name) between 2 and 120 and char_length(message) between 10 and 5000);
create policy "authenticated editors read contact" on public.contact_messages for select to authenticated using (true);
create policy "authenticated editors update contact" on public.contact_messages for update to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do update set public = true;
drop policy if exists "public media read" on storage.objects;
drop policy if exists "authenticated media upload" on storage.objects;
drop policy if exists "authenticated media update" on storage.objects;
drop policy if exists "authenticated media delete" on storage.objects;
create policy "public media read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "authenticated media upload" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "authenticated media update" on storage.objects for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
create policy "authenticated media delete" on storage.objects for delete to authenticated using (bucket_id = 'media');
