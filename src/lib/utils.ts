import type { Language } from '@/types'
import { supabase } from '@/lib/supabase'

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'E-posta veya şifre hatalı.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış. Supabase panelinden kullanıcıyı onaylayın.'
  }
  if (normalized.includes('too many requests') || normalized.includes('over_request_rate_limit')) {
    return 'Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.'
  }
  if (normalized.includes('user not found')) {
    return 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.'
  }
  if (normalized.includes('signup_disabled')) {
    return 'Yeni kayıt oluşturma şu anda devre dışı.'
  }
  if (normalized.includes('user_banned') || normalized.includes('banned')) {
    return 'Bu hesap erişime kapatılmıştır.'
  }
  if (normalized.includes('session_not_found') || normalized.includes('session expired')) {
    return 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.'
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
  }

  // Teknik prefix'leri temizle (örn. "AuthApiError: ...")
  return message.replace(/^[A-Za-z]+Error:\s*/i, '')
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

export function getWhatsAppLink(number?: string | null, message?: string): string {
  const safePhone = (number || import.meta.env.VITE_WHATSAPP_NUMBER || '').toString()
  const clean = safePhone.replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${text}`
}

export function getAcceptedFileTypes(): string {
  return '.pdf,.dwg,.dxf,.step,.stp,.onecnc'
}

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/acad',
  'image/vnd.dwg',
  'application/dxf',
  'application/step',
  'model/step',
  'application/octet-stream',
]

export function isValidFileExtension(fileName: string): boolean {
  const allowed = ['.pdf', '.dwg', '.dxf', '.step', '.stp', '.onecnc']
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return false
  const ext = fileName.slice(lastDot).toLowerCase()
  return allowed.includes(ext)
}

export const GALLERY_CATEGORIES = [
  { id: 'all', tr: 'Tümü', en: 'All' },
  { id: 'torna', tr: 'CNC Torna', en: 'CNC Lathe' },
  { id: 'freze', tr: 'CNC Freze', en: 'CNC Milling' },
  { id: 'kaynak', tr: 'Kaynak & İmalat', en: 'Welding & Production' },
  { id: 'genel', tr: 'Genel / Atölye', en: 'General / Workshop' },
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
  if (storedPath.startsWith('documents/')) {
    const relativePath = storedPath.replace('documents/', '')
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(relativePath, 3600)
    return data?.signedUrl || storedPath
  }
  return storedPath
}
