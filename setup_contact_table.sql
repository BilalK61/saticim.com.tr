-- Create contact_info table
CREATE TABLE IF NOT EXISTS public.contact_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instagram_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    facebook_url TEXT,
    youtube_url TEXT, -- Added just in case
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Create Policy: Allow public read access (anyone can view contact info)
CREATE POLICY "Allow public read access"
ON public.contact_info
FOR SELECT
USING (true);

-- Create Policy: Allow authenticated users (admins) to update
-- For now allowing authenticated to update/insert for ease of use, 
-- in production you might want to restrict this to specific admin roles.
CREATE POLICY "Allow authenticated update"
ON public.contact_info
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert"
ON public.contact_info
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Insert initial default row if it doesn't exist
INSERT INTO public.contact_info (
    instagram_url,
    twitter_url,
    linkedin_url,
    facebook_url,
    email,
    phone,
    address
)
SELECT
    'https://instagram.com/saticim',
    'https://twitter.com/saticim',
    'https://linkedin.com/company/saticim',
    'https://facebook.com/saticim',
    'destek@saticim.com',
    '+90 850 123 45 67',
    'İstanbul, Türkiye'
WHERE NOT EXISTS (SELECT 1 FROM public.contact_info);

-- Grant usage to anonymous and authenticated users
GRANT SELECT ON public.contact_info TO anon, authenticated;
