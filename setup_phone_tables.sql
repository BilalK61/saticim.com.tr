-- Create Tables for Phone Data
-- Run this in Supabase SQL Editor ONCE before running the migration script.

CREATE TABLE IF NOT EXISTS public.phone_brands (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.phone_models (
    id BIGINT PRIMARY KEY,
    brand_id BIGINT REFERENCES public.phone_brands(id),
    name TEXT NOT NULL,
    picture TEXT,
    released_at TEXT,
    body TEXT,
    os TEXT,
    storage TEXT,
    display_size TEXT,
    display_resolution TEXT,
    camera_pixels TEXT,
    video_pixels TEXT,
    ram TEXT,
    chipset TEXT,
    battery_size TEXT,
    battery_type TEXT,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phone_models_brand_id ON public.phone_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_phone_models_name ON public.phone_models(name);
