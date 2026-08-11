import { supabase } from '@/lib/supabase'
import type {
  HeroContent,
  Service,
  Machine,
  GalleryItem,
  VideoItem,
  Client,
  Offer,
  SeoSettings,
  ContactSettings,
  CounterSettings,
} from '@/types'

// ─── Fetch Fonksiyonları ──────────────────────────────────────────────────────

export async function fetchHero(): Promise<HeroContent | null> {
  try {
    const { data, error } = await supabase
      .from('hero_content')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) console.error('[content] fetchHero:', error.message)
    return data
  } catch (err) {
    console.error('[content] fetchHero beklenmeyen hata:', err)
    return null
  }
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) console.error('[content] fetchServices:', error.message)
    return data || []
  } catch (err) {
    console.error('[content] fetchServices beklenmeyen hata:', err)
    return []
  }
}

export async function fetchMachines(): Promise<Machine[]> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) console.error('[content] fetchMachines:', error.message)
    return data || []
  } catch (err) {
    console.error('[content] fetchMachines beklenmeyen hata:', err)
    return []
  }
}

export async function fetchGallery(category?: string): Promise<GalleryItem[]> {
  try {
    let query = supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    const { data, error } = await query
    if (error) console.error('[content] fetchGallery:', error.message)
    return data || []
  } catch (err) {
    console.error('[content] fetchGallery beklenmeyen hata:', err)
    return []
  }
}

export async function fetchVideos(category?: string): Promise<VideoItem[]> {
  try {
    let query = supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    const { data, error } = await query
    if (error) console.error('[content] fetchVideos:', error.message)
    return data || []
  } catch (err) {
    console.error('[content] fetchVideos beklenmeyen hata:', err)
    return []
  }
}

export async function fetchClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) console.error('[content] fetchClients:', error.message)
    return data || []
  } catch (err) {
    console.error('[content] fetchClients beklenmeyen hata:', err)
    return []
  }
}

export async function fetchSeo(page: string): Promise<SeoSettings | null> {
  try {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page', page)
      .maybeSingle()
    if (error) console.error('[content] fetchSeo:', error.message)
    return data
  } catch (err) {
    console.error('[content] fetchSeo beklenmeyen hata:', err)
    return null
  }
}

export async function fetchContactSettings(): Promise<ContactSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'contact')
      .maybeSingle()
    if (error) console.error('[content] fetchContactSettings:', error.message)
    return (data?.value as ContactSettings) || {
      phone: import.meta.env.VITE_COMPANY_PHONE || '',
      email: import.meta.env.VITE_COMPANY_EMAIL || '',
      whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '',
      address_tr: 'Dilovası, Kocaeli',
      address_en: 'Dilovası, Kocaeli',
    }
  } catch (err) {
    console.error('[content] fetchContactSettings beklenmeyen hata:', err)
    return {
      phone: import.meta.env.VITE_COMPANY_PHONE || '',
      email: import.meta.env.VITE_COMPANY_EMAIL || '',
      whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '',
      address_tr: 'Dilovası, Kocaeli',
      address_en: 'Dilovası, Kocaeli',
    }
  }
}

export async function fetchCounters(): Promise<CounterSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'counters')
      .maybeSingle()
    if (error) console.error('[content] fetchCounters:', error.message)
    return (data?.value as CounterSettings) || { projects: 500, clients: 120, capacity: 95 }
  } catch (err) {
    console.error('[content] fetchCounters beklenmeyen hata:', err)
    return { projects: 500, clients: 120, capacity: 95 }
  }
}

export async function fetchOffers(): Promise<Offer[]> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('[content] fetchOffers:', error.message)
    return data || []
  } catch (err) {
    console.error('[content] fetchOffers beklenmeyen hata:', err)
    return []
  }
}

export async function updateOfferStatus(
  id: string,
  status: Offer['status']
): Promise<boolean> {
  try {
    const { error } = await supabase.from('offers').update({ status }).eq('id', id)
    if (error) console.error('[content] updateOfferStatus:', error.message)
    return !error
  } catch (err) {
    console.error('[content] updateOfferStatus beklenmeyen hata:', err)
    return false
  }
}
