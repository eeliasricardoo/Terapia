-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Base table for all users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  role text check (role in ('patient', 'psychologist', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. PSYCHOLOGISTS (Professional Data)
create table public.psychologists (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  name text not null,
  crp text not null,
  bio text,
  avatar_url text,
  price decimal(10,2),
  specialties text[], -- Array of strings
  availability jsonb, -- JSON structure for schedule
  verified boolean default false,
  city text,
  state text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Psychologists
alter table public.psychologists enable row level security;

create policy "Psychologists are viewable by everyone"
  on public.psychologists for select
  using ( true );

create policy "Psychologists can update own data"
  on public.psychologists for update
  using ( auth.uid() = id );

-- 3. PATIENTS (Patient Data)
create table public.patients (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  name text not null,
  phone text,
  birth_date date,
  document_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Patients
alter table public.patients enable row level security;

create policy "Patients data is private"
  on public.patients for select
  using ( auth.uid() = id );

create policy "Patients can update own data"
  on public.patients for update
  using ( auth.uid() = id );

-- 4. APPOINTMENTS
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) not null,
  psychologist_id uuid references public.psychologists(id) not null,
  date timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  price decimal(10,2) not null,
  payment_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Appointments
alter table public.appointments enable row level security;

create policy "Patients can view own appointments"
  on public.appointments for select
  using ( auth.uid() = patient_id );

create policy "Psychologists can view assigned appointments"
  on public.appointments for select
  using ( auth.uid() = psychologist_id );

create policy "Patients can create appointments"
  on public.appointments for insert
  with check ( auth.uid() = patient_id );

create policy "Psychologists can update own appointments"
  on public.appointments for update
  using ( auth.uid() = psychologist_id );

-- 5. REVIEWS
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references public.appointments(id) not null,
  reviewer_id uuid references public.patients(id) not null,
  psychologist_id uuid references public.psychologists(id) not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Reviews
alter table public.reviews enable row level security;

create policy "Reviews are public"
  on public.reviews for select
  using ( true );

create policy "Patients can create reviews"
  on public.reviews for insert
  with check ( auth.uid() = reviewer_id );
