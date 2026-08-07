import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPANY_NAME, COMPANY_LOCATION, SITE_URL } from '@/lib/supabase'
import type { SeoSettings } from '@/types'

interface SEOProps {
  page?: string
  seo?: SeoSettings | null
  title?: string
  description?: string
  image?: string
  noindex?: boolean
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

function setJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export default function SEO({ page = 'home', seo, title, description, image, noindex }: SEOProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  const pageTitle = title
    || (seo ? (lang === 'tr' ? seo.title_tr : seo.title_en) : null)
    || `${COMPANY_NAME} | ${COMPANY_LOCATION}`

  const pageDescription = description
    || (seo ? (lang === 'tr' ? seo.description_tr : seo.description_en) : null)
    || (lang === 'tr'
      ? 'Kocaeli Dilovası\'nda CNC torna, işleme merkezi ve talaşlı imalat hizmetleri.'
      : 'CNC lathe, machining center and chip removal manufacturing services in Kocaeli Dilovası.')

  const ogImage = image || seo?.og_image_url || `${SITE_URL}/og-image.jpg`
  const keywords = seo?.keywords || 'cnc torna, işleme merkezi, dilovası, kocaeli'
  const canonical = `${SITE_URL}/${page === 'home' ? '' : page}`

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = pageTitle || ''

    setMeta('description', pageDescription || '')
    setMeta('keywords', keywords)

    if (noindex) {
      setMeta('robots', 'noindex, nofollow')
    } else {
      document.querySelector('meta[name="robots"]')?.remove()
    }

    setLink('canonical', canonical)
    setLink('alternate', `${SITE_URL}/?lang=tr`, 'tr')
    setLink('alternate', `${SITE_URL}/?lang=en`, 'en')

    setMeta('og:type', 'website', true)
    setMeta('og:title', pageTitle || '', true)
    setMeta('og:description', pageDescription || '', true)
    setMeta('og:image', ogImage, true)
    setMeta('og:url', canonical, true)
    setMeta('og:locale', lang === 'tr' ? 'tr_TR' : 'en_US', true)
    setMeta('og:site_name', COMPANY_NAME, true)

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', pageTitle || '')
    setMeta('twitter:description', pageDescription || '')
    setMeta('twitter:image', ogImage)

    setJsonLd('json-ld-local-business', {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: COMPANY_NAME,
      description: pageDescription,
      url: SITE_URL,
      telephone: import.meta.env.VITE_COMPANY_PHONE,
      email: import.meta.env.VITE_COMPANY_EMAIL,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dilovası',
        addressRegion: 'Kocaeli',
        addressCountry: 'TR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.78,
        longitude: 29.53,
      },
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 40.78,
          longitude: 29.53,
        },
        geoRadius: '100000',
      },
      priceRange: '$$',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    })
  }, [lang, pageTitle, pageDescription, ogImage, keywords, canonical, noindex])

  return null
}
