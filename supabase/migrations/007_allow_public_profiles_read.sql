-- Allow anyone to view profiles of verified psychologists
CREATE POLICY "Anyone can view verified psychologist profiles data"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM psychologist_profiles 
    WHERE psychologist_profiles."userId" = profiles.user_id 
    AND psychologist_profiles.is_verified = TRUE
  )
);
