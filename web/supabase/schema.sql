-- Models: mental models content
create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  body text,
  tags text[] default '{}',
  category text,
  cover_url text,
  audio_url text,
  read_time integer,
  status text default 'draft', -- draft | published
  audio_status text default 'idle', -- idle | generating | ready | failed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Audio assets: TTS results
create table if not exists public.audio_assets (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references public.models (id) on delete cascade,
  voice_id text,
  source_text text check (source_text in ('summary','body')),
  is_primary boolean default false,
  status text default 'pending', -- pending | processing | ready | failed
  audio_url text,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_models_slug on public.models (slug);
create index if not exists idx_models_category on public.models (category);
create index if not exists idx_models_tags on public.models using gin (tags);
create index if not exists idx_audio_model on public.audio_assets (model_id);
create unique index if not exists idx_audio_primary on public.audio_assets (model_id) where is_primary;

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_models_updated_at
before update on public.models
for each row execute function public.set_updated_at();

create or replace trigger trg_audio_assets_updated_at
before update on public.audio_assets
for each row execute function public.set_updated_at();

-- Users (custom auth) with hashed password
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  hashed_password text not null,
  display_name text,
  avatar_url text,
  role text default 'viewer' check (role in ('admin','manager','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_tags_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

-- Relations (many-to-many) for models
create table if not exists public.model_categories (
  model_id uuid references public.models (id) on delete cascade,
  category_id uuid references public.categories (id) on delete cascade,
  primary key (model_id, category_id)
);

create table if not exists public.model_tags (
  model_id uuid references public.models (id) on delete cascade,
  tag_id uuid references public.tags (id) on delete cascade,
  primary key (model_id, tag_id)
);

create index if not exists idx_model_categories_model on public.model_categories (model_id);
create index if not exists idx_model_tags_model on public.model_tags (model_id);
