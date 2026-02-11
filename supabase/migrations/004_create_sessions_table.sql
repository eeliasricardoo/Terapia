-- Create appointments table
DROP TABLE IF EXISTS appointments CASCADE;
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  psychologist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 50 NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled' NOT NULL,
  price DECIMAL(10, 2),
  notes TEXT,
  meet_link TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- Psychologists can view their own appointments
CREATE POLICY "Psychologists can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = psychologist_id);

-- Patients can create appointments (booking)
CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can cancel their own appointments
CREATE POLICY "Patients can update own appointments (cancel only)"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id AND status = 'cancelled');

-- Psychologists can update their appointments
CREATE POLICY "Psychologists can update own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = psychologist_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_psychologist_id ON appointments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_appointments
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
