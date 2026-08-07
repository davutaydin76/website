# Aydın Torna CNC — Kurumsal Web Sitesi

Modern, çok dilli, premium kurumsal web sitesi. React 19, Vite, TypeScript, TailwindCSS, Framer Motion, Supabase.

## Özellikler

- Premium Apple/Linear/Stripe esintili tasarım
- Türkçe / İngilizce (i18next)
- Dark / Light mode (sistem algılama + localStorage)
- Scroll animasyonlu CNC objeleri
- Supabase Auth + Admin Panel
- Teklif formu (dosya yükleme + Resend e-posta)
- Tam SEO (meta, OG, Twitter Card, JSON-LD, sitemap, robots.txt)

## Kurulum

### Gereksinimler

- Node.js 20+
- npm veya pnpm
- Supabase hesabı
- Resend hesabı (e-posta bildirimleri için)

### 1. Bağımlılıkları yükleyin

```bash
npm install
```

### 2. Ortam değişkenlerini ayarlayın

```bash
# Windows (CMD / PowerShell)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://aydintornacnc.com.tr
VITE_COMPANY_PHONE=+90XXXXXXXXXX
VITE_COMPANY_EMAIL=info@aydintornacnc.com.tr
VITE_WHATSAPP_NUMBER=90XXXXXXXXXX
VITE_GOOGLE_MAPS_EMBED_URL=https://www.google.com/maps/embed?pb=...
```

### 3. Supabase veritabanını kurun

Supabase Dashboard → SQL Editor → `supabase/schema.sql` dosyasını çalıştırın.

### 4. Admin kullanıcısı oluşturun

1. Supabase Dashboard → Authentication → Users → Add user
2. SQL Editor'de admin profili ekleyin:

```sql
INSERT INTO admin_profiles (id, email, role)
VALUES ('USER_UUID_BURAYA', 'admin@aydintornacnc.com.tr', 'admin');
```

### 5. Resend Edge Function

```bash
npx supabase functions deploy send-offer-email
```

Supabase secrets:

```
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=info@aydintornacnc.com.tr
FROM_EMAIL=noreply@aydintornacnc.com.tr
```

### 6. Geliştirme sunucusu

```bash
npm run dev
```

### 7. Production build

```bash
npm run build
npm run preview
```

## Sayfalar

| Sayfa | URL |
|-------|-----|
| Ana Sayfa | `/` |
| Galeri | `/gallery` |
| Teklif Al | `/offer` |
| Admin Giriş | `/admin/login` |
| Admin Panel | `/admin` |

## Admin Panel

- Hero içerik düzenleme
- Hizmetler, makineler, galeri, videolar
- Müşteri logoları
- SEO ayarları
- İletişim bilgileri ve sayaçlar
- Gelen teklifler ve dosya görüntüleme

## Deployment

### Vercel (Önerilen)

1. [vercel.com](https://vercel.com) hesabı oluşturun
2. GitHub reposunu import edin: `davutaydin76/website`
3. Framework Preset: **Vite**
4. Environment Variables ekleyin (`.env.example` dosyasındaki tüm `VITE_*` değişkenleri)
5. Deploy

### Netlify

1. [netlify.com](https://netlify.com) hesabı oluşturun
2. GitHub reposunu bağlayın
3. Build command: `npm run build`, Publish directory: `dist`
4. Environment Variables ekleyin
5. Deploy

Build komutu: `npm run build`, output: `dist`

## Lisans

Özel — Aydın Torna CNC
