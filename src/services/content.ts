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

export async function fetchHero(): Promise<HeroContent | null> {
  const { data } = await supabase
    .from('hero_content')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function fetchServices(): Promise<Service[]> {
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

export async function fetchMachines(): Promise<Machine[]> {
  const { data } = await supabase
    .from('machines')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

export async function fetchGallery(category?: string): Promise<GalleryItem[]> {
  let query = supabase
    .from('gallery')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  const { data } = await query
  return data || []
}

export async function fetchVideos(category?: string): Promise<VideoItem[]> {
  let query = supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  const { data } = await query
  return data || []
}

export async function fetchClients(): Promise<Client[]> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

export async function fetchSeo(page: string): Promise<SeoSettings | null> {
  const { data } = await supabase
    .from('seo_settings')
    .select('*')
    .eq('page', page)
    .single()
  return data
}

export async function fetchContactSettings(): Promise<ContactSettings> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'contact')
    .single()
  return (data?.value as ContactSettings) || {
    phone: import.meta.env.VITE_COMPANY_PHONE || '',
    email: import.meta.env.VITE_COMPANY_EMAIL || '',
    whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '',
    address_tr: 'Dilovası, Kocaeli',
    address_en: 'Dilovası, Kocaeli',
  }
}

export async function fetchCounters(): Promise<CounterSettings> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'counters')
    .single()
  return (data?.value as CounterSettings) || { projects: 500, clients: 120, capacity: 95 }
}

export async function fetchOffers(): Promise<Offer[]> {
  const { data } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export async function updateOfferStatus(
  id: string,
  status: Offer['status']
): Promise<boolean> {
  const { error } = await supabase.from('offers').update({ status }).eq('id', id)
  return !error
}
