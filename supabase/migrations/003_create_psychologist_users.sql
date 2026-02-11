-- Migration: Create Sample Psychologist Users
-- Description: Creates auth users and their profiles for testing
-- Note: This uses Supabase's auth.users table

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create psychologist 1: Dra. Ana María Rojas
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  extensions.uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'ana.rojas@terapia.com',
  extensions.crypt('Senha123!', extensions.gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dra. Ana María Rojas"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'ana.rojas@terapia.com'
) RETURNING id;

-- Note: The above approach requires pgcrypto extension and direct access to auth schema
-- which may not be available in Supabase

-- Alternative: Use Supabase Management API
-- This needs to be done via API calls, not SQL
