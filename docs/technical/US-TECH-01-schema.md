# US-TECH-01: Schema do Banco de Dados (Supabase)

**Objetivo:** Definir a estrutura de dados para garantir integridade, segurança e performance.

## Diagrama ER (Conceitual)

*   **Users (Auth):** Gerenciado pelo Supabase Auth.
*   **Profiles:** Dados públicos/privados dos usuários.
*   **Psychologist_Profiles:** Dados específicos de profissionais.
*   **Appointments:** Agendamentos e sessões.
*   **Reviews:** Avaliações de pacientes.
*   **Availability:** Horários disponíveis dos psicólogos.

## Definição das Tabelas

### 1. `profiles`
Extensão da tabela `auth.users`.
*   `id` (uuid, PK, FK -> auth.users)
*   `full_name` (text)
*   `avatar_url` (text)
*   `role` (enum: 'patient', 'psychologist', 'admin', 'company')
*   `created_at` (timestamp)

### 2. `psychologist_profiles`
Detalhes específicos para profissionais.
*   `user_id` (uuid, PK, FK -> profiles.id)
*   `crp` (text, unique)
*   `bio` (text)
*   `specialties` (text[])
*   `price_per_session` (numeric)
*   `video_presentation_url` (text)
*   `is_verified` (boolean, default false)

### 3. `appointments`
Gerencia o ciclo de vida da consulta.
*   `id` (uuid, PK)
*   `patient_id` (uuid, FK -> profiles.id)
*   `psychologist_id` (uuid, FK -> profiles.id)
*   `starts_at` (timestamp)
*   `ends_at` (timestamp)
*   `status` (enum: 'pending', 'confirmed', 'completed', 'canceled')
*   `meeting_url` (text) - Link da sala Daily.co
*   `price` (numeric) - Valor congelado no momento do agendamento

### 4. `availability`
Slots de horário disponíveis.
*   `id` (uuid, PK)
*   `psychologist_id` (uuid, FK -> profiles.id)
*   `day_of_week` (int, 0-6)
*   `start_time` (time)
*   `end_time` (time)
*   `is_recurring` (boolean)

### 5. `reviews`
Avaliações e notas.
*   `id` (uuid, PK)
*   `appointment_id` (uuid, FK -> appointments.id)
*   `patient_id` (uuid, FK -> profiles.id)
*   `psychologist_id` (uuid, FK -> profiles.id)
*   `rating` (int, 1-5)
*   `comment` (text)
*   `created_at` (timestamp)

## Segurança (RLS Policies)

*   **Profiles:**
    *   `SELECT`: Público para `psychologist`, Privado para `patient` (exceto o próprio).
    *   `UPDATE`: Apenas o próprio usuário.
*   **Appointments:**
    *   `SELECT`: Apenas o `patient_id` ou `psychologist_id` vinculado.
*   **Reviews:**
    *   `INSERT`: Apenas `patient` que completou consulta.

## Performance
*   Índices em `psychologist_id` nas tabelas `appointments` e `reviews`.
*   Índice GIN para busca em `specialties`.
