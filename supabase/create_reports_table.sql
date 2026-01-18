-- Drop exisiting table object first
DROP TABLE IF EXISTS public.listing_reports CASCADE;

-- Create the listing_reports table
CREATE TABLE public.listing_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id BIGINT REFERENCES public.listings(id) ON DELETE CASCADE, -- Allow cascade delete
    reporter_id UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users can insert their own reports (authenticated users)
CREATE POLICY "Users can create reports" ON public.listing_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 2. Admin can view all reports
-- Policy for Admins to SELECT
CREATE POLICY "Admins can view all reports" ON public.listing_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Policy for Admins to UPDATE
CREATE POLICY "Admins can update reports" ON public.listing_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
