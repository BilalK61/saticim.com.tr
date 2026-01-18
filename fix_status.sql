-- Mevcut 'active' durumundaki ilanları 'approved' yap
UPDATE listings 
SET status = 'approved' 
WHERE status = 'active';

-- Kontrol et
SELECT id, title, status, created_at 
FROM listings 
ORDER BY created_at DESC;
