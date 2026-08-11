import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@aydintornacnc.com.tr'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OfferPayload {
  full_name: string
  company?: string
  phone: string
  email: string
  description?: string
  file_urls?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: OfferPayload = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Özel dosyalar için Signed URL'ler oluştur
    let signedUrls: { name: string; url: string }[] = []
    if (payload.file_urls?.length && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      signedUrls = await Promise.all(
        payload.file_urls.map(async (storedPath) => {
          const relativePath = storedPath.startsWith('documents/')
            ? storedPath.replace('documents/', '')
            : storedPath

          const { data } = await supabase.storage
            .from('documents')
            .createSignedUrl(relativePath, 60 * 60 * 24 * 7) // 7 gün geçerli

          return {
            name: relativePath.split('/').pop() || 'Dosya',
            url: data?.signedUrl || storedPath,
          }
        })
      )
    }

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
        <div style="background-color: #0A0A0A; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Aydın Torna CNC</h1>
          <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 14px;">Yeni Teklif Talebi Bildirimi</p>
        </div>
        <div style="padding: 24px; color: #1f2937; line-height: 1.5;">
          <p style="margin-top: 0; font-size: 16px;">Merhaba,</p>
          <p style="font-size: 15px;">Siteniz üzerinden yeni bir teklif talebi gönderildi. Detaylar aşağıdadır:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: 600; color: #4b5563; width: 140px;">Müşteri Adı:</td>
              <td style="padding: 10px 0; color: #111827;">${payload.full_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Firma:</td>
              <td style="padding: 10px 0; color: #111827;">${payload.company || '-'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Telefon:</td>
              <td style="padding: 10px 0; color: #111827;"><a href="tel:${payload.phone}" style="color: #2563eb; text-decoration: none;">${payload.phone}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">E-posta:</td>
              <td style="padding: 10px 0; color: #111827;"><a href="mailto:${payload.email}" style="color: #2563eb; text-decoration: none;">${payload.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 600; color: #4b5563; vertical-align: top;">Açıklama / Mesaj:</td>
              <td style="padding: 10px 0; color: #111827; white-space: pre-wrap;">${payload.description || '-'}</td>
            </tr>
          </table>

          \${signedUrls.length > 0 ? `
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-top: 20px;">
            <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 14px; color: #374151; font-weight: 600;">Ekteki CAD / Tasarım Dosyaları:</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #2563eb;">
              \${signedUrls.map(file => `
                <li style="margin-bottom: 6px;">
                  <a href="\${file.url}" target="_blank" style="text-decoration: underline; font-weight: 500;">
                    \${file.name}
                  </a>
                </li>
              `).join('')}
            </ul>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #6b7280; font-style: italic;">Not: Dosya indirme bağlantıları güvenlik nedeniyle 7 gün boyunca geçerlidir.</p>
          </div>
          ` : ''}
        </div>
        <div style="background-color: #f3f4f6; padding: 12px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
          Bu e-posta Aydın Torna CNC web sitesi teklif formu aracılığıyla otomatik olarak gönderilmiştir.
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ['d.aydintorna@gmail.com'], // Doğrudan d.aydintorna@gmail.com olarak ayarlandı
        subject: `Yeni Teklif: ${payload.full_name}`,
        html,
        reply_to: payload.email,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend error: ${error}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
