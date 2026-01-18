-- 1. Create the messages table safely
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    listing_id UUID, -- No foreign key to avoid errors if listings table is missing
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender ON public.messages(receiver_id, sender_id);

-- 3. Enable Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Enable Realtime (Ignore error if already added)
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE messages';
EXCEPTION
  WHEN duplicate_object THEN NULL; -- Ignore if already added
  WHEN OTHERS THEN NULL; -- Ignore other errors (like publication missing)
END $$;

-- 5. Create Policies (Safely)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
    CREATE POLICY "Users can read their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

    DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
    CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

    DROP POLICY IF EXISTS "Users can update received messages" ON public.messages;
    CREATE POLICY "Users can update received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);
END $$;

-- 6. CRITICAL: Refresh the API Cache so Supabase 'sees' the new table
NOTIFY pgrst, 'reload schema';
