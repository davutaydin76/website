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
  website_url: string | null
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
