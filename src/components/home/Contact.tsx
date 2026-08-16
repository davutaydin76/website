import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'
import type { ContactSettings } from '@/types'

interface ContactProps {
  contact?: ContactSettings
}

export default function Contact({ contact }: ContactProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  const safePhone = contact?.phone || import.meta.env.VITE_COMPANY_PHONE || '+90 505 880 77 00'
  const safeEmail = contact?.email || import.meta.env.VITE_COMPANY_EMAIL || 'd.aydintorna@gmail.com'
  const safeWhatsapp = contact?.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '905058807700'
  const safeAddressTr = contact?.address_tr || 'Diliskelesi Mh. Cumhuriyet Cd. 702. Sk. No:5, Dilovası / Kocaeli'
  const safeAddressEn = contact?.address_en || 'Diliskelesi Mh. Cumhuriyet Cd. 702. Sk. No:5, Dilovası / Kocaeli'

  const address = lang === 'tr' ? safeAddressTr : safeAddressEn
  const mapsUrl = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL

  const items = [
    {
      icon: Phone,
      label: t('contact.phone'),
      value: safePhone,
      href: `tel:${String(safePhone).replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: t('contact.email'),
      value: safeEmail,
      href: `mailto:${safeEmail}`,
    },
    {
      icon: MessageCircle,
      label: t('contact.whatsapp'),
      value: 'WhatsApp',
      href: getWhatsAppLink(safeWhatsapp, 'Merhaba, teklif almak istiyorum.'),
      target: '_blank',
    },
    {
      icon: MapPin,
      label: t('contact.address'),
      value: address,
      href: 'https://www.google.com/maps/dir/?api=1&destination=Diliskelesi+Mh.+Cumhuriyet+Cd.+702.+Sk.+No:5+Dilovasi+Kocaeli',
      target: '_blank',
    },
  ]

  return (
    <section id="contact" className="section-padding bg-zinc-950 text-white">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-3 text-white">{t('contact.title')}</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => {
              const CardContent = (
                <div className="h-full bg-zinc-900/40 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center mb-3.5 text-accent">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-white text-sm sm:text-base">
                      {item.value}
                    </p>
                  </div>
                  {item.href && (
                    <div className="mt-4 text-xs font-semibold text-accent flex items-center gap-1">
                      <span>{lang === 'tr' ? 'Bağlantıyı Aç' : 'Open Link'}</span>
                      <span>→</span>
                    </div>
                  )}
                </div>
              )

              return (
                <div key={item.label} className="h-full">
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.target || '_self'}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="block h-full"
                      aria-label={`${item.label}: ${item.value}`}
                    >
                      {CardContent}
                    </a>
                  ) : (
                    CardContent
                  )}
                </div>
              )
            })}
          </div>

          {mapsUrl && (
            <div className="rounded-xl overflow-hidden bg-zinc-900 h-[360px]">
              <iframe
                src={mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Aydın Torna CNC Konum"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
