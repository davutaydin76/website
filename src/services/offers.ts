import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'

export interface OfferFormData {
  full_name: string
  company?: string
  phone: string
  email: string
  description?: string
  files?: File[]
}

export interface OfferResult {
  success: boolean
  error?: string
}

/**
 * Teklif gönderir:
 * 1. Dosyaları Supabase Storage 'documents' bucket'ına yükler
 * 2. Teklif kaydını 'offers' tablosuna ekler
 * 3. Edge Function aracılığıyla e-posta bildirimi gönderir
 */
export async function submitOffer(data: OfferFormData): Promise<OfferResult> {
  try {
    // 1. Dosya yükleme
    const fileUrls: string[] = []
    if (data.files?.length) {
      for (const file of data.files) {
        const path = `offers/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const url = await uploadFile('documents', path, file)
        if (url) {
          fileUrls.push(url)
        } else {
          console.warn(`Dosya yüklenemedi: ${file.name}`)
        }
      }
    }

    // 2. Veritabanına kaydet
    const { error: insertError } = await supabase
      .from('offers')
      .insert({
        contact_name: data.full_name,
        company_name: data.company || null,
        phone: data.phone,
        email: data.email,
        message: data.description || null,
        file_urls: fileUrls,
        status: 'pending'
      })

    if (insertError) {
      console.error("Teklif kayıt hatası:", insertError.message, insertError.details, insertError.hint);
      throw new Error('Teklif kaydedilemedi. Lütfen tekrar deneyin.')
    }

    // 3. E-posta bildirimi (hata oluşsa bile kayıt başarılı sayılır)
    await sendOfferNotification({
      full_name: data.full_name,
      company: data.company,
      phone: data.phone,
      email: data.email,
      description: data.description,
      file_urls: fileUrls,
    })

    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    return { success: false, error: message }
  }
}

async function sendOfferNotification(payload: {
  full_name: string
  company?: string
  phone: string
  email: string
  description?: string
  file_urls?: string[]
}): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('send-offer-email', {
      body: payload,
    })
    if (error) {
      // E-posta hatası kritik değil — teklif zaten kaydedildi
      console.error('E-posta bildirimi gönderilemedi:', error.message)
    }
  } catch (err) {
    console.error('Edge Function çağrısı başarısız:', err)
  }
}
