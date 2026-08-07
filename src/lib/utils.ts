import type { Language } from '@/types'

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getLocalizedField(
  item: object,
  field: string,
  lang: Language
): string {
  const record = item as Record<string, unknown>
  const key = `${field}_${lang}`
  const value = record[key]
  if (typeof value === 'string') return value
  const fallback = record[`${field}_tr`]
  return typeof fallback === 'string' ? fallback : ''
}

export function formatPhone(phone: string): string {
  return phone.replace(/\s/g, '')
}

export function getWhatsAppLink(number: string, message?: string): string {
  const clean = number.replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${text}`
}

export function getAcceptedFileTypes(): string {
  return '.pdf,.dwg,.dxf,.step,.stp'
}

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/acad',
  'image/vnd.dwg',
  'application/dxf',
  'application/step',
  'model/step',
]

export const GALLERY_CATEGORIES = [
  { id: 'all', tr: 'Tümü', en: 'All' },
  { id: 'cnc', tr: 'CNC İşleme', en: 'CNC Machining' },
  { id: 'welding', tr: 'Kaynak', en: 'Welding' },
  { id: 'production', tr: 'Üretim', en: 'Production' },
  { id: 'general', tr: 'Genel', en: 'General' },
] as const

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  const { supabase } = await import('@/lib/supabase')
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) {
    console.error('Upload error:', error)
    return null
  }
  if (bucket === 'documents') {
    return `${bucket}/${path}`
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function getFileUrl(storedPath: string): Promise<string> {
  const { supabase } = await import('@/lib/supabase')
  if (storedPath.startsWith('documents/')) {
    const relativePath = storedPath.replace('documents/', '')
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(relativePath, 3600)
    return data?.signedUrl || storedPath
  }
  return storedPath
}
