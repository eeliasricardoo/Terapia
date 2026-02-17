-- Add weekly_schedule column to psychologist_profiles
ALTER TABLE psychologist_profiles
ADD COLUMN IF NOT EXISTS weekly_schedule JSONB DEFAULT '{}'::jsonb;

-- Create schedule_overrides table
CREATE TABLE IF NOT EXISTS schedule_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologist_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('custom', 'blocked')),
    slots JSONB DEFAULT '[]'::jsonb, -- Array of {start: string, end: string}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(psychologist_id, date)
);

-- Add RLS policies for schedule_overrides if needed
ALTER TABLE schedule_overrides ENABLE ROW LEVEL SECURITY;

-- Allow psychologists to manage their own overrides
CREATE POLICY "Psychologists can manage their own schedule overrides"
ON schedule_overrides
FOR ALL
USING (auth.uid() IN (
    SELECT "userId" FROM psychologist_profiles WHERE id = schedule_overrides.psychologist_id
));

-- Allow everyone to read public schedules (for booking)
CREATE POLICY "Public read access to schedule overrides"
ON schedule_overrides
FOR SELECT
USING (true);
