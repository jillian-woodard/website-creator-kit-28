ALTER TABLE public.style_profiles
ADD COLUMN IF NOT EXISTS recalibration_cadence TEXT
CHECK (recalibration_cadence IN ('weekly', 'monthly', 'quarterly', 'never'));