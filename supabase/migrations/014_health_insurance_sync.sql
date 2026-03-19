-- Update handle_new_user function to include health insurance fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_id, 
    full_name, 
    role, 
    phone, 
    birth_date, 
    document,
    health_insurance_id,
    health_insurance_policy
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT'),
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    NEW.raw_user_meta_data->>'document',
    CASE 
      WHEN NEW.raw_user_meta_data->>'health_insurance_id' = 'none' THEN NULL 
      ELSE (NEW.raw_user_meta_data->>'health_insurance_id')::UUID 
    END,
    NEW.raw_user_meta_data->>'health_insurance_policy'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
