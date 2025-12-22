-- Migration: Seed Psychologist Data
-- Description: Populate database with sample psychologist profiles for testing
-- Created: 2025-12-22

-- Insert sample psychologists into auth.users (if not exists)
-- Note: In production, these would be created through the signup flow
-- For development, we'll create profiles directly

-- Sample Psychologist 1: Dra. Ana María Rojas
DO $$
DECLARE
  user_id_1 UUID := gen_random_uuid();
BEGIN
  -- Insert into profiles
  INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
  VALUES (
    user_id_1,
    user_id_1,
    'Dra. Ana María Rojas',
    'PSYCHOLOGIST',
    NOW(),
    NOW()
  );

  -- Insert into psychologist_profiles
  INSERT INTO psychologist_profiles (user_id, crp, bio, specialties, price_per_session, is_verified, created_at, updated_at)
  VALUES (
    user_id_1,
    'CRP 06/123456',
    'Psicóloga clínica com mais de 10 anos de experiência em Terapia Cognitivo-Comportamental (TCC). Especializada no tratamento de ansiedade, depressão e transtornos de humor. Acredito em uma abordagem empática e baseada em evidências para ajudar meus pacientes a alcançarem seus objetivos terapêuticos.',
    ARRAY['Ansiedade', 'TCC', 'Depressão', 'Transtornos de Humor'],
    150.00,
    true,
    NOW(),
    NOW()
  );
END $$;

-- Sample Psychologist 2: Dr. Carlos Fuentes
DO $$
DECLARE
  user_id_2 UUID := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
  VALUES (
    user_id_2,
    user_id_2,
    'Dr. Carlos Fuentes',
    'PSYCHOLOGIST',
    NOW(),
    NOW()
  );

  INSERT INTO psychologist_profiles (user_id, crp, bio, specialties, price_per_session, is_verified, created_at, updated_at)
  VALUES (
    user_id_2,
    'CRP 06/234567',
    'Especialista em terapia de casal e relacionamentos. Trabalho com casais e indivíduos para melhorar a comunicação, resolver conflitos e fortalecer vínculos. Minha abordagem integra técnicas da terapia sistêmica e comunicação não-violenta.',
    ARRAY['Relacionamentos', 'Comunicação', 'Terapia de Casal', 'Conflitos'],
    180.00,
    true,
    NOW(),
    NOW()
  );
END $$;

-- Sample Psychologist 3: Dra. Sofia Vergara
DO $$
DECLARE
  user_id_3 UUID := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
  VALUES (
    user_id_3,
    user_id_3,
    'Dra. Sofia Vergara',
    'PSYCHOLOGIST',
    NOW(),
    NOW()
  );

  INSERT INTO psychologist_profiles (user_id, crp, bio, specialties, price_per_session, is_verified, created_at, updated_at)
  VALUES (
    user_id_3,
    'CRP 06/345678',
    'Psicóloga infantil com formação em psicologia do desenvolvimento. Trabalho com crianças e adolescentes, auxiliando famílias a navegarem desafios emocionais e comportamentais. Utilizo técnicas lúdicas e terapia familiar para criar um ambiente acolhedor.',
    ARRAY['Crianças', 'Família', 'Adolescentes', 'Desenvolvimento'],
    160.00,
    true,
    NOW(),
    NOW()
  );
END $$;

-- Sample Psychologist 4: Dra. Isabella Gómez
DO $$
DECLARE
  user_id_4 UUID := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
  VALUES (
    user_id_4,
    user_id_4,
    'Dra. Isabella Gómez',
    'PSYCHOLOGIST',
    NOW(),
    NOW()
  );

  INSERT INTO psychologist_profiles (user_id, crp, bio, specialties, price_per_session, is_verified, created_at, updated_at)
  VALUES (
    user_id_4,
    'CRP 06/456789',
    'Especialista em depressão e práticas de mindfulness. Combino abordagens tradicionais de psicoterapia com técnicas de atenção plena para promover bem-estar emocional e autoconhecimento. Acredito no poder da presença e da compaixão no processo terapêutico.',
    ARRAY['Depressão', 'Mindfulness', 'Autoconhecimento', 'Bem-estar'],
    140.00,
    true,
    NOW(),
    NOW()
  );
END $$;

-- Sample Psychologist 5: Dr. Juan David Pérez
DO $$
DECLARE
  user_id_5 UUID := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
  VALUES (
    user_id_5,
    user_id_5,
    'Dr. Juan David Pérez',
    'PSYCHOLOGIST',
    NOW(),
    NOW()
  );

  INSERT INTO psychologist_profiles (user_id, crp, bio, specialties, price_per_session, is_verified, created_at, updated_at)
  VALUES (
    user_id_5,
    'CRP 06/567890',
    'Terapeuta humanista focado em autoestima e crescimento pessoal. Minha abordagem é centrada na pessoa, criando um espaço seguro para exploração e desenvolvimento do potencial humano. Trabalho com questões de identidade, propósito e realização pessoal.',
    ARRAY['Autoestima', 'Crescimento', 'Humanista', 'Propósito'],
    170.00,
    true,
    NOW(),
    NOW()
  );
END $$;

-- Sample Psychologist 6: Dra. Valentina Ortiz
DO $$
DECLARE
  user_id_6 UUID := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
  VALUES (
    user_id_6,
    user_id_6,
    'Dra. Valentina Ortiz',
    'PSYCHOLOGIST',
    NOW(),
    NOW()
  );

  INSERT INTO psychologist_profiles (user_id, crp, bio, specialties, price_per_session, is_verified, created_at, updated_at)
  VALUES (
    user_id_6,
    'CRP 06/678901',
    'Neuropsicóloga especializada em avaliação cognitiva e TDAH. Realizo avaliações neuropsicológicas completas e ofereço suporte terapêutico para pessoas com dificuldades de atenção, memória e funções executivas. Trabalho com crianças, adolescentes e adultos.',
    ARRAY['Avaliação', 'TDAH', 'Neuropsicologia', 'Cognição'],
    200.00,
    true,
    NOW(),
    NOW()
  );
END $$;

-- Verify the data was inserted
SELECT 
  p.full_name,
  pp.crp,
  pp.specialties,
  pp.price_per_session,
  pp.is_verified
FROM psychologist_profiles pp
JOIN profiles p ON pp.user_id = p.user_id
WHERE pp.is_verified = true
ORDER BY p.created_at DESC;
