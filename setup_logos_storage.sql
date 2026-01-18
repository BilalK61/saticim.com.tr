-- logos adında yeni bir public storage bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Not: storage.objects tablosunda RLS zaten aktiftir, o satırı kaldırdık.

-- Eski policy'leri temizle (varsa hata vermesin diye)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 1. Herkesin 'logos' bucketındaki dosyaları GÖREBİLMESİNE izin ver (Public Read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );

-- 2. Sadece giriş yapmış kullanıcıların 'logos' bucketına dosya YÜKLEYEBİLMESİNE izin ver
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'logos' );

-- 3. Kullanıcıların kendi yükledikleri dosyaları GÜNCELLEYEBİLMESİNE izin ver
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'logos' AND owner = auth.uid() );

-- 4. Kullanıcıların kendi yükledikleri dosyaları SİLEBİLMESİNE izin ver
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'logos' AND owner = auth.uid() );

-- OLUŞTURULAN BUCKET'I KONTROL ET
SELECT * FROM storage.buckets WHERE id = 'logos';
