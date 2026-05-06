-- =========================================
-- POOL SCORE BACKEND — initial schema
-- =========================================

create type public.rating_source as enum ('google', 'tripadvisor', 'booking', 'hotels_com');
create type public.snapshot_status as enum ('ok', 'failed', 'missing_id');

-- PROFILES
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where user_id = _user_id), false);
$$;

create policy "profiles_own_read" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_admin_read" on public.profiles
  for select using (public.is_admin(auth.uid()));
create policy "profiles_own_insert" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin(auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email) values (new.id, new.email)
    on conflict (user_id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- HOTELS
create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  city_slug text not null,
  country text not null,
  neighborhood text,
  address text,
  website_url text,
  booking_url text,
  latitude numeric,
  longitude numeric,
  cover_image_url text,
  is_published boolean not null default true,
  rank_position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_hotels_city_slug on public.hotels(city_slug);
create index idx_hotels_rank on public.hotels(city_slug, rank_position);
alter table public.hotels enable row level security;
create policy "hotels_public_read" on public.hotels
  for select using (is_published = true);
create policy "hotels_admin_all" on public.hotels
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger trg_hotels_updated before update on public.hotels
  for each row execute function public.touch_updated_at();

-- SOURCE MAPPINGS
create table public.source_mappings (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  source public.rating_source not null,
  source_place_id text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (hotel_id, source)
);
create index idx_source_mappings_hotel on public.source_mappings(hotel_id);
alter table public.source_mappings enable row level security;
create policy "source_mappings_admin_all" on public.source_mappings
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- RATINGS SNAPSHOTS (with generated date column for uniqueness)
create table public.ratings_snapshots (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  source public.rating_source not null,
  rating_value numeric,
  rating_scale numeric not null default 5,
  rating_count integer,
  captured_at timestamptz not null default now(),
  captured_date date generated always as ((captured_at at time zone 'UTC')::date) stored,
  raw_payload jsonb,
  status public.snapshot_status not null default 'ok',
  error_message text
);
create index idx_snapshots_hotel_source on public.ratings_snapshots(hotel_id, source, captured_at desc);
create unique index uniq_snapshot_per_day on public.ratings_snapshots(hotel_id, source, captured_date);
alter table public.ratings_snapshots enable row level security;
create policy "snapshots_admin_all" on public.ratings_snapshots
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- META SCORES
create table public.meta_scores (
  hotel_id uuid primary key references public.hotels(id) on delete cascade,
  meta_rating_0_100 numeric,
  confidence_0_100 numeric,
  sources_used jsonb,
  computed_at timestamptz not null default now(),
  notes text
);
alter table public.meta_scores enable row level security;
create policy "meta_scores_public_read" on public.meta_scores
  for select using (true);
create policy "meta_scores_admin_write" on public.meta_scores
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- POOL SCORES (editorial)
create table public.pool_scores (
  hotel_id uuid primary key references public.hotels(id) on delete cascade,
  pool_score_0_10 numeric,
  components jsonb,
  best_time text,
  pool_type text,
  editorial_notes text,
  updated_at timestamptz not null default now()
);
alter table public.pool_scores enable row level security;
create policy "pool_scores_public_read" on public.pool_scores
  for select using (true);
create policy "pool_scores_admin_write" on public.pool_scores
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger trg_pool_scores_updated before update on public.pool_scores
  for each row execute function public.touch_updated_at();

-- SCORING SETTINGS (single row)
create table public.scoring_settings (
  id integer primary key default 1,
  weights jsonb not null default '{"google":0.35,"tripadvisor":0.25,"booking":0.25,"hotels_com":0.15}'::jsonb,
  volume_cap integer not null default 5000,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into public.scoring_settings (id) values (1) on conflict do nothing;
alter table public.scoring_settings enable row level security;
create policy "settings_public_read" on public.scoring_settings
  for select using (true);
create policy "settings_admin_write" on public.scoring_settings
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger trg_settings_updated before update on public.scoring_settings
  for each row execute function public.touch_updated_at();

-- PUBLIC VIEW
create or replace view public.public_hotels_view
with (security_invoker = true) as
select
  h.id, h.slug, h.name, h.city, h.city_slug, h.country, h.neighborhood,
  h.website_url, h.booking_url, h.cover_image_url, h.rank_position,
  ps.pool_score_0_10, ps.components as pool_components,
  ps.best_time, ps.pool_type, ps.editorial_notes,
  ps.updated_at as pool_score_updated_at,
  ms.meta_rating_0_100, ms.confidence_0_100, ms.sources_used,
  ms.computed_at as meta_computed_at
from public.hotels h
left join public.pool_scores ps on ps.hotel_id = h.id
left join public.meta_scores ms on ms.hotel_id = h.id
where h.is_published = true;

grant select on public.public_hotels_view to anon, authenticated;
