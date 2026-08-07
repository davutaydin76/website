import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'info@aydintornacnc.com.tr'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@aydintornacnc.com.tr'

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

    const fileList = payload.file_urls?.length
      ? `<p><strong>Dosyalar:</strong> ${payload.file_urls.join(', ')}</p>`
      : ''

    const html = `
      <h2>Yeni Teklif Talebi</h2>
      <p><strong>Ad Soyad:</strong> ${payload.full_name}</p>
      <p><strong>Firma:</strong> ${payload.company || '-'}</p>
      <p><strong>Telefon:</strong> ${payload.phone}</p>
      <p><strong>E-posta:</strong> ${payload.email}</p>
      <p><strong>Açıklama:</strong> ${payload.description || '-'}</p>
      ${fileList}
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
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
