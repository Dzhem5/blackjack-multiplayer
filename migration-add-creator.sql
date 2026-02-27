-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- Mevcut rooms tablosuna creator_name kolonunu ekler

-- creator_name kolonunu ekle
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS creator_name TEXT;

-- Mevcut kayıtlar için default değer (opsiyonel)
UPDATE rooms 
SET creator_name = 'Oyuncu' 
WHERE creator_name IS NULL;

-- creator_name'i NOT NULL yap (opsiyonel - yeni kayıtlar için)
-- ALTER TABLE rooms 
-- ALTER COLUMN creator_name SET NOT NULL;
