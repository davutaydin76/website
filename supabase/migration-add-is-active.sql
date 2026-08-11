-- Migration: admin_profiles tablosuna is_active sütunu ekle
-- Tarih: 2026-08-11
-- Açıklama: Mevcut admin hesaplarını devre dışı bırakabilmek için is_active alanı eklendi.
--           Yeni sütun varsayılan olarak true gelir — mevcut tüm kayıtlar aktif kalır.

-- 1. Sütunu ekle (idempotent — varsa tekrar çalıştırmak hata vermez)
ALTER TABLE admin_profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Mevcut tüm kayıtları aktif olarak işaretle (zaten DEFAULT true ama açıkça belirtelim)
UPDATE admin_profiles SET is_active = true WHERE is_active IS NULL;

-- 3. Doğrulama sorgusu — çıktıyı kontrol edin
SELECT id, email, role, is_active, created_at FROM admin_profiles;
