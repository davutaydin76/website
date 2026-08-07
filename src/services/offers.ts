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

export async function submitOffer(data: OfferFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const fileUrls: string[] = []

    if (data.files?.length) {
      for (const file of data.files) {
        const path = `offers/${Date.now()}-${file.name}`
        const url = await uploadFile('documents', path, file)
        if (url) fileUrls.push(url)
      }
    }

    const { error } = await supabase
      .from('offers')
      .insert({
        full_name: data.full_name,
        company: data.company || null,
        phone: data.phone,
        email: data.email,
        description: data.description || null,
        file_urls: fileUrls,
      })
      .select()
      .single()

    if (error) throw error

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
    const message = err instanceof Error ? err.message : 'Unknown error'
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
}) {
  try {
    const { error } = await supabase.functions.invoke('send-offer-email', {
      body: payload,
    })
    if (error) console.error('Email notification error:', error)
  } catch (err) {
    console.error('Failed to send email notification:', err)
  }
}
