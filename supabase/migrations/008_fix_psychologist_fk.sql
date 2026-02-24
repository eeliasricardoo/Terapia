-- Add foreign key from psychologist_profiles to profiles to enable direct join
ALTER TABLE psychologist_profiles
ADD CONSTRAINT fk_psychologist_profiles_profiles
FOREIGN KEY ("userId") 
REFERENCES profiles(user_id)
ON DELETE CASCADE;
