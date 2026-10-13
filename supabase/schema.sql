-- Nexiz Review Portal schema. Run once in Supabase -> SQL Editor.
-- Tables use the prefix rv_ so they never clash with other tables (e.g. Nexiz's own "categories"/"reviews").

create extension if not exists pgcrypto;

create table if not exists rv_roles (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  permissions  text[] not null default '{}',
  is_system    boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists rv_users (
  id               uuid primary key default gen_random_uuid(),
  email            text not null unique,
  full_name        text not null,
  password_hash    text not null,
  role_id          uuid not null references rv_roles(id) on delete restrict,   -- role id lives in the user
  is_active        boolean not null default true,
  failed_attempts  int not null default 0,
  locked_until     timestamptz,
  last_login_at    timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists rv_users_role_idx on rv_users(role_id);

create table if not exists rv_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name_en     text not null,
  name_ar     text,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists rv_software (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references rv_categories(id) on delete restrict,
  slug         text not null unique,
  name         text not null,
  website      text,
  description  text,
  image_url    text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists rv_software_category_idx on rv_software(category_id);

create table if not exists rv_reviews (
  id           uuid primary key default gen_random_uuid(),
  software_id  uuid not null references rv_software(id) on delete cascade,
  user_id      uuid not null references rv_users(id) on delete cascade,
  rating       int not null check (rating between 1 and 5),
  duration     text not null check (duration in ('lt_6m','6_12m','1_2y','2_5y','5y_plus')),
  comment      text check (char_length(comment) <= 1000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (software_id, user_id)
);
create index if not exists rv_reviews_user_idx on rv_reviews(user_id);

-- Security: only the server (service-role key) reads/writes. RLS ON with NO policies = anon key sees nothing.
alter table rv_roles       enable row level security;
alter table rv_users       enable row level security;
alter table rv_categories  enable row level security;
alter table rv_software    enable row level security;
alter table rv_reviews     enable row level security;

-- Public bucket for category/software images (uploads happen on the server only).
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('nexiz-images', 'nexiz-images', true)
    on conflict (id) do nothing;
  end if;
end $$;
