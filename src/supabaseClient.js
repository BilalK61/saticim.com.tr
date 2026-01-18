import { createClient } from '@supabase/supabase-js';

// Lütfen bu bilgileri kendi Supabase projenizden alıp doldurun.
// Supabase Dashboard -> Project Settings -> API kısmında bulabilirsiniz.
const supabaseUrl = 'https://ecbhhbyfocitafbfsegg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhoYnlmb2NpdGFmYmZzZWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NjQ3NzIsImV4cCI6MjA4MDU0MDc3Mn0.SSVUpWj3FD3Yb2-aYuBaCh2dMarC0neR0fKvpfztMgo'; // DİKKAT: Bu anahtarın 'eyJ' ile başlaması gerekir (Anon Key). Lütfen kontrol edin.

export const supabase = createClient(supabaseUrl, supabaseKey);
