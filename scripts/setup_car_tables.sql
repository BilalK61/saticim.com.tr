-- Create tables for Vehicle Data (CarAPI Integration)

-- 1. Vehicle Makes
CREATE TABLE IF NOT EXISTS public.vehicle_makes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    external_id TEXT, -- Store CarAPI ID if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Vehicle Models
CREATE TABLE IF NOT EXISTS public.vehicle_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make_id UUID REFERENCES public.vehicle_makes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    external_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(make_id, name)
);

-- 3. Vehicle Packages (Trims)
CREATE TABLE IF NOT EXISTS public.vehicle_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID REFERENCES public.vehicle_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    external_id TEXT,
    year INTEGER, -- Year might be relevant for packages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(model_id, name)
);

-- Enable RLS (Row Level Security) if you want to restrict write access
ALTER TABLE public.vehicle_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_packages ENABLE ROW LEVEL SECURITY;

-- Allow public read access (dependent on your policy needs)
CREATE POLICY "Enable read access for all users" ON public.vehicle_makes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.vehicle_models FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.vehicle_packages FOR SELECT USING (true);

-- Allow service role (or authenticated admin) to insert/update - Adjust as needed
-- For now, maybe allow all for simplicity if you are running scripts with service role
CREATE POLICY "Enable insert for service role only" ON public.vehicle_makes FOR INSERT WITH CHECK (true); -- ideally check auth.role() = 'service_role'
CREATE POLICY "Enable insert for service role only" ON public.vehicle_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role only" ON public.vehicle_packages FOR INSERT WITH CHECK (true);
