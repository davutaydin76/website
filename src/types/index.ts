export interface Settings {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface HeroContent {
  id: string
  title_tr: string
  title_en: string
  subtitle_tr: string | null
  subtitle_en: string | null
  video_url: string | null
  image_url: string | null
  background_image: string | null
  cta_primary_tr: string
  cta_primary_en: string
  cta_secondary_tr: string
  cta_secondary_en: string
  is_active: boolean
  updated_at: string
}

export interface Service {
  id: string
  title_tr: string
  title_en: string
  description_tr: string | null
  description_en: string | null
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Machine {
  id: string
  name_tr: string
  name_en: string
  description_tr: string | null
  description_en: string | null
  category: 'torna' | 'freze' | 'kaynak' | 'diger' | string
  specs: Record<string, string>
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GalleryItem {
  id: string
  title_tr: string | null
  title_en: string | null
  image_url: string
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface VideoItem {
  id: string
  title_tr: string | null
  title_en: string | null
  video_url: string
  thumbnail_url: string | null
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Client {
  id: string
  name: string
  logo_url: string
  website: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Offer {
  id: string
  full_name: string
  company: string | null
  phone: string
  email: string
  description: string | null
  file_urls: string[]
  status: 'pending' | 'reviewed' | 'completed' | 'rejected'
  created_at: string
}

export interface SeoSettings {
  id: string
  page: string
  title_tr: string | null
  title_en: string | null
  description_tr: string | null
  description_en: string | null
  og_image_url: string | null
  keywords: string | null
  updated_at: string
}

export interface ContactSettings {
  phone: string
  email: string
  whatsapp: string
  address_tr: string
  address_en: string
}

export interface CounterSettings {
  projects: number
  clients: number
  capacity: number
}

export type Theme = 'light' | 'dark' | 'system'

export type Language = 'tr' | 'en'

export interface LocalizedField {
  tr: string
  en: string
}

/** Üretim Günlüğü / Case Study — `projects` Supabase tablosu */
export interface ProjectData {
  id: string
  created_at: string
  /** Google Fotoğraflar tarihi — kronolojik sıralama için */
  completion_date: string | null
  title_tr: string
  title_en: string
  /** Kısa teknik özet pill'ler: "Ø1200mm · 4140 Çelik · ±0.02mm" */
  specs_tr: string | null
  specs_en: string | null
  /** Uzun hikaye / süreç anlatımı */
  description_tr: string | null
  description_en: string | null
  /** Müşteri sektörü — genel tanım, isim YOK: "Tuzla'da bir tersane" */
  client_type_tr: string | null
  client_type_en: string | null
  /** Teslim süresi: "3 iş günü", "2 hafta" */
  processing_time: string | null
  /** Fotoğraf + video URL array (Supabase Storage, JSONB text[]) */
  media_urls: string[]
  /** Kapak görseli — kartlarda gösterilir */
  cover_image_url: string | null
  /** Default: false — incelenmeden yayınlanmaz */
  is_active: boolean
  sort_order: number
  /** SEO meta keywords: "gemi şaftı torna, marine shaft machining, kocaeli" */
  meta_keywords: string | null
}
