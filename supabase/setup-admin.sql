-- Admin kullanıcısı kurulum scripti
-- Supabase Dashboard → SQL Editor'de çalıştırın

-- 1) Önce Supabase Dashboard → Authentication → Users → "Add user" ile admin kullanıcısı oluşturun
--    - Email: admin@aydintornacnc.com.tr (veya istediğiniz e-posta)
--    - Password: güçlü bir şifre belirleyin
--    - "Auto Confirm User" seçeneğini işaretleyin (e-posta doğrulaması olmadan giriş için)

-- 2) Oluşturulan kullanıcının UUID'sini kopyalayın (Users listesinde görünür)

-- 3) Aşağıdaki sorguyu UUID ve e-posta ile güncelleyip çalıştırın:

INSERT INTO admin_profiles (id, email, role, is_active)
VALUES (
  'BURAYA-USER-UUID-YAPIŞTIRIN',
  'admin@aydintornacnc.com.tr',
  'admin',
  true    -- false yaparsanız bu hesap giriş yapamaz
)
ON CONFLICT (id) DO UPDATE SET
  email     = EXCLUDED.email,
  role      = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- 4) Admin hesabını devre dışı bırakmak için:
-- UPDATE admin_profiles SET is_active = false WHERE email = 'admin@aydintornacnc.com.tr';

-- 5) Kontrol sorgusu:
-- SELECT u.id, u.email, u.email_confirmed_at, ap.role, ap.is_active
-- FROM auth.users u
-- LEFT JOIN admin_profiles ap ON ap.id = u.id
-- WHERE u.email = 'admin@aydintornacnc.com.tr';
