-- Add missing columns to existing tables

ALTER TABLE public.vehicle_makes ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.vehicle_models ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.vehicle_packages ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.vehicle_packages ADD COLUMN IF NOT EXISTS year INTEGER;
