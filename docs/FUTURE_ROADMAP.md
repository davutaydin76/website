# Aydın Torna CNC — Future Roadmap & AI Agent Notes

> Bu dosya, web sitesi geliştirme sürecinde AI agent'ların ve insan geliştiricilerin doğru kararlar alması için kritik notlar içermektedir.
> Güncel tutulması zorunludur. İçeriği değiştirmeden önce bu notları oku.

---

## 🔴 CRITICAL AGENT NOTES (Read Before Generating Any Marketing Content)

### NOTE 1 — Crane Capacity (Vinç Kapasitesi)

> **EN:** Currently, the overhead crane capacity is **3 tons**. Do **NOT** exaggerate weight limits in marketing copies or technical documentation. A **5-ton crane upgrade is planned**. Update marketing texts **only when the 5-ton crane is actively installed and verified**. Any AI-generated content claiming "5 tons" or higher capacity before installation is incorrect and must be rejected.
>
> **TR:** Mevcut köprülü vinç kapasitesi **3 tondur**. Pazarlama materyallerinde veya teknik dokümanlarda bu değeri abartma. **5 tonluk vinç yükseltmesi planlanmaktadır.** Pazarlama metinleri yalnızca 5 tonluk vinç fiziksel olarak kurulup doğrulandıktan sonra güncellenmelidir.

**File to update when 5T crane is installed:** `src/components/home/CapacitySection.tsx` → `capacityCards[3].valueTr / valueEn / detailTr / detailEn`

---

### NOTE 2 — Blog & Case Studies Module (Blog ve Vaka Çalışmaları)

> **EN:** Future development will include a **"Case Studies / Projeler"** and **"Technical Blog"** module. These will target B2B engineering keywords such as:
> - `ship shaft machining turkey`
> - `4140 steel turning kocaeli`
> - `large flange manufacturing dilovasi`
> - `heavy cnc turning outsourcing europe`
>
> Architecture guidelines for this module:
> - Use **Supabase** as backend (rich text content, dynamic routing by slug)
> - Create `posts` table: `id`, `slug`, `title_tr`, `title_en`, `content_tr`, `content_en`, `category`, `tags[]`, `published_at`, `seo_description_tr`, `seo_description_en`
> - Route structure: `/blog`, `/blog/:slug`, `/projects`, `/projects/:slug`
> - Components: `BlogCard`, `BlogPage`, `BlogDetailPage`, `ProjectCard`, `ProjectDetailPage`
> - SEO: Dynamic `<title>`, meta descriptions, `og:image`, `hreflang` per language
>
> **TR:** "Vaka Çalışmaları / Projeler" ve "Teknik Blog" modülü ileride geliştirilecek. B2B mühendislik anahtar kelimelerine odaklanacak. Supabase rich text ve dinamik rota altyapısı kullanılacak.

---

### NOTE 3 — Geo-SEO & European Outreach (Uluslararası SEO)

> **EN:** Primary geo-SEO target: **European outsourcing market** (Germany 🇩🇪, Netherlands 🇳🇱, Belgium 🇧🇪).
>
> Key action items:
> 1. **hreflang implementation**: Add `<link rel="alternate" hreflang="tr" href="..." />` and `<link rel="alternate" hreflang="en" href="..." />` on all pages via `SEO.tsx`
> 2. **Target keywords**: `heavy machining turkey`, `cnc turning outsourcing turkey`, `large diameter turning kocaeli`, `ship components machining`
> 3. **Schema.org**: Add `LocalBusiness` + `ManufacturingBusiness` structured data to `index.html` or SEO component
> 4. **Google Business Profile**: Verify and optimize for Dilovası / Kocaeli region
>
> **TR:** Birincil Geo-SEO hedefi: Almanya, Hollanda, Belçika dış kaynak pazarı. hreflang, schema.org ve Google İşletme Profili optimizasyonu yapılacak.

---

## 📋 Development Roadmap (Priority Order)

| Priority | Module | Status | Notes |
|---|---|---|---|
| 🔴 HIGH | Blog / Case Studies | Planned | See NOTE 2 |
| 🔴 HIGH | hreflang SEO | Planned | See NOTE 3 |
| 🟡 MED | 5-ton crane content update | Waiting for install | See NOTE 1 |
| 🟡 MED | Schema.org structured data | Planned | LocalBusiness + Manufacturing |
| 🟢 LOW | Customer review / testimonials module | Future | Supabase table |
| 🟢 LOW | PDF catalog download | Future | Supabase storage |
| 🟢 LOW | Live chat widget | Future | Evaluate options |

---

## 🏗️ Current Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 + Custom CSS |
| Backend/DB | Supabase (PostgreSQL + Storage + Auth) |
| Animations | Framer Motion |
| i18n | react-i18next (tr / en) |
| Hosting | Vercel (primary) / Netlify (fallback) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

---

## 📁 Key Files Reference

| File | Purpose |
|---|---|
| `src/components/home/CapacitySection.tsx` | Manufacturing capacity cards — update crane note here |
| `src/components/common/FloatingWhatsApp.tsx` | Floating WA button — phone number via env or props |
| `src/lib/utils.ts` | `getOptimizedImageUrl()`, `getWhatsAppLink()` — shared utilities |
| `src/components/seo/SEO.tsx` | Dynamic SEO tags — extend for hreflang |
| `public/llms.txt` | AI search engine discovery file |
| `public/robots.txt` | Crawler rules |
| `docs/FUTURE_ROADMAP.md` | This file |

---

*Last updated: 2026-08-16 — Aydın Torna CNC Development*
