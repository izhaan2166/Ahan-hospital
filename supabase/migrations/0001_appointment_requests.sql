-- Appointment requests submitted through the website.
-- A row means "request received", not a confirmed booking.

create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^AH-[A-Z2-9]{6}$'),
  full_name text not null check (char_length(full_name) between 2 and 80),
  phone text not null check (phone ~ '^\+[1-9][0-9]{6,14}$'),
  email text check (email is null or char_length(email) <= 254),
  speciality_slug text not null check (char_length(speciality_slug) <= 64),
  doctor_slug text check (doctor_slug is null or char_length(doctor_slug) <= 64),
  preferred_date date not null,
  preferred_slot text not null check (preferred_slot in ('morning', 'afternoon', 'evening')),
  message text check (message is null or char_length(message) <= 500),
  consent boolean not null check (consent),
  status text not null default 'received' check (status in ('received', 'contacted', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists appointment_requests_created_at_idx
  on public.appointment_requests (created_at desc);

-- Row Level Security on, with no policies: the public anon and authenticated
-- roles can neither read nor write. Only the server, using the service-role
-- key, can insert. Staff read requests from the Supabase dashboard.
alter table public.appointment_requests enable row level security;

revoke all on table public.appointment_requests from anon, authenticated;
