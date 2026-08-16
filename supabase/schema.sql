-- Aydın Torna CNC - Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table (contact info, counters, etc.)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero content
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_tr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_tr TEXT,
  subtitle_en TEXT,
  video_url TEXT,
  image_url TEXT,
  cta_primary_tr TEXT DEFAULT 'Teklif Al',
  cta_primary_en TEXT DEFAULT 'Get Quote',
  cta_secondary_tr TEXT DEFAULT 'Bize Ulaş',
  cta_secondary_en TEXT DEFAULT 'Contact Us',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_tr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'cog',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  specs JSONB DEFAULT '{}',
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_tr TEXT,
  title_en TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_tr TEXT,
  title_en TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  file_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO Settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT UNIQUE NOT NULL,
  title_tr TEXT,
  title_en TEXT,
  description_tr TEXT,
  description_en TEXT,
  og_image_url TEXT,
  keywords TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read hero" ON hero_content FOR SELECT USING (is_active = true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read machines" ON machines FOR SELECT USING (is_active = true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (is_active = true);
CREATE POLICY "Public read clients" ON clients FOR SELECT USING (is_active = true);
CREATE POLICY "Public read seo" ON seo_settings FOR SELECT USING (true);

-- Public insert offers
CREATE POLICY "Public insert offers" ON offers FOR INSERT WITH CHECK (true);

-- Admin policies (authenticated users with admin role)
CREATE POLICY "Admin all settings" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin all hero" ON hero_content FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin all services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin all machines" ON machines FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin all gallery" ON gallery FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin all videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin all clients" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin read offers" ON offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update offers" ON offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin all seo" ON seo_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin read profiles" ON admin_profiles FOR SELECT USING (
  id = auth.uid()
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read gallery bucket" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public read logos bucket" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Public upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Admin manage gallery storage" ON storage.objects FOR ALL USING (
  bucket_id IN ('gallery', 'logos') AND
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manage documents storage" ON storage.objects FOR ALL USING (
  bucket_id = 'documents' AND
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed data
INSERT INTO hero_content (title_tr, title_en, subtitle_tr, subtitle_en, video_url) VALUES
('Hassas CNC Üretim', 'Precision CNC Manufacturing',
 'Kocaeli Dilovası''nda yüksek kaliteli torna ve işleme merkezi hizmetleri',
 'High-quality lathe and machining center services in Kocaeli Dilovası',
 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-cnc-machine-cutting-metal-4933-large.mp4');

INSERT INTO services (title_tr, title_en, description_tr, description_en, icon, sort_order) VALUES
('CNC Torna', 'CNC Lathe', 'Hassas torna işlemleri ile karmaşık parçalar', 'Complex parts with precision lathe operations', 'circle-dot', 1),
('İşleme Merkezi', 'Machining Center', 'Çok eksenli işleme merkezi hizmetleri', 'Multi-axis machining center services', 'box', 2),
('Talaşlı İmalat', 'Chip Removal Manufacturing', 'Profesyonel talaşlı imalat çözümleri', 'Professional chip removal manufacturing solutions', 'settings', 3),
('Özel Parça İmalatı', 'Custom Part Manufacturing', 'Projeye özel parça üretimi', 'Project-specific part production', 'puzzle', 4),
('Kaynak', 'Welding', 'Profesyonel kaynak hizmetleri', 'Professional welding services', 'flame', 5),
('Gazaltı Kaynak', 'MIG/MAG Welding', 'Gazaltı kaynak işlemleri', 'MIG/MAG welding operations', 'zap', 6),
('Profil İşleme', 'Profile Processing', 'Metal profil kesim ve işleme', 'Metal profile cutting and processing', 'layers', 7);

INSERT INTO machines (name_tr, name_en, description_tr, description_en, specs, sort_order) VALUES
('CNC Torna 1300x800', 'CNC Lathe 1300x800', 'Orta boy parçalar için ideal', 'Ideal for medium-sized parts', '{"x": "1300mm", "z": "800mm"}', 1),
('CNC Torna 5500x900-1200', 'CNC Lathe 5500x900-1200', 'Büyük boy parça işleme kapasitesi', 'Large part machining capacity', '{"x": "5500mm", "z": "900-1200mm"}', 2),
('İşleme Merkezi', 'Machining Center', 'Çok eksenli hassas işleme', 'Multi-axis precision machining', '{"axes": "3-5"}', 3),
('Kaynak Sistemleri', 'Welding Systems', 'Modern kaynak ekipmanları', 'Modern welding equipment', '{"type": "MIG/MAG/TIG"}', 4);

INSERT INTO seo_settings (page, title_tr, title_en, description_tr, description_en, keywords) VALUES
('home', 'Aydın Torna CNC | Kocaeli Dilovası CNC Torna ve İşleme Merkezi', 'Aydın Torna CNC | Kocaeli Dilovası CNC Lathe & Machining Center',
 'Kocaeli Dilovası''nda CNC torna, işleme merkezi, talaşlı imalat ve kaynak hizmetleri. Hassas üretim, hızlı teslimat.',
 'CNC lathe, machining center, chip removal manufacturing and welding services in Kocaeli Dilovası. Precision production, fast delivery.',
 'cnc torna, işleme merkezi, dilovası, kocaeli, talaşlı imalat, kaynak'),
('gallery', 'Galeri | Aydın Torna CNC', 'Gallery | Aydın Torna CNC',
 'Üretim süreçlerimiz ve tamamlanan projelerimizden fotoğraf ve videolar.',
 'Photos and videos from our production processes and completed projects.',
 'cnc galeri, üretim fotoğrafları'),
('offer', 'Teklif Al | Aydın Torna CNC', 'Get Quote | Aydın Torna CNC',
 'Hızlı teklif alın. DWG, DXF, STEP dosyalarınızı yükleyin.',
 'Get a quick quote. Upload your DWG, DXF, STEP files.',
 'teklif, cnc fiyat');

INSERT INTO settings (key, value) VALUES
('contact', '{"phone": "+90 262 XXX XX XX", "email": "info@aydintornacnc.com.tr", "whatsapp": "+90 5XX XXX XX XX", "address_tr": "Dilovası, Kocaeli", "address_en": "Dilovası, Kocaeli"}'),
('counters', '{"projects": 500, "clients": 120, "capacity": 95}');
