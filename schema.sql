-- Ghar Rent V4: PostgreSQL/Supabase starter schema
create extension if not exists pgcrypto;

create type user_role as enum ('owner','tenant','admin');
create type property_status as enum ('draft','published','rented','archived');
create type request_status as enum ('pending','accepted','rejected','cancelled');
create type agreement_status as enum ('draft','active','ended','cancelled');
create type payment_status as enum ('created','pending','paid','failed','refunded');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  role user_role not null default 'tenant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  address text not null,
  city text not null,
  state text not null,
  pincode text,
  monthly_rent numeric(12,2) not null check (monthly_rent > 0),
  bedrooms integer,
  bathrooms integer,
  status property_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table rental_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  tenant_id uuid not null references profiles(id) on delete cascade,
  message text,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, tenant_id)
);

create table agreements (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  owner_id uuid not null references profiles(id),
  tenant_id uuid not null references profiles(id),
  monthly_rent numeric(12,2) not null check (monthly_rent > 0),
  platform_fee_percent numeric(5,2) not null default 0.50,
  start_date date not null,
  end_date date,
  status agreement_status not null default 'draft',
  document_path text,
  created_at timestamptz not null default now()
);

create table rent_payments (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references agreements(id),
  payer_id uuid not null references profiles(id),
  rent_amount numeric(12,2) not null check (rent_amount > 0),
  platform_fee numeric(12,2) not null check (platform_fee >= 0),
  total_amount numeric(12,2) not null check (total_amount > 0),
  provider text,
  provider_order_id text,
  provider_payment_id text,
  status payment_status not null default 'created',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table platform_settings (
  key text primary key,
  value_json jsonb not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

insert into platform_settings(key, value_json)
values ('platform_fee_percent', '{"value":0.50}')
on conflict (key) do nothing;

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Production note:
-- Enable Row Level Security (RLS) on all tables and create policies
-- so owners only manage their own properties, tenants only manage
-- their own requests, and platform_settings is admin-only.
-- Payment status must be changed only by verified server/webhook logic.
