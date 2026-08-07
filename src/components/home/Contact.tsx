import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react'
import Card from '@/components/ui/Card'
import { getWhatsAppLink } from '@/lib/utils'
import type { ContactSettings } from '@/types'

interface ContactProps {
  contact?: ContactSettings
}

export default function Contact({ contact }: ContactProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  const data = contact || {
    phone: import.meta.env.VITE_COMPANY_PHONE || '+90 262 XXX XX XX',
    email: import.meta.env.VITE_COMPANY_EMAIL || 'info@aydintornacnc.com.tr',
    whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '905XXXXXXXXX',
    address_tr: 'Dilovası, Kocaeli',
    address_en: 'Dilovası, Kocaeli',
  }

  const address = lang === 'tr' ? data.address_tr : data.address_en
  const mapsUrl = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL

  const items = [
    { icon: Phone, label: t('contact.phone'), value: data.phone, href: `tel:${data.phone}` },
    { icon: Mail, label: t('contact.email'), value: data.email, href: `mailto:${data.email}` },
    {
      icon: MessageCircle,
      label: t('contact.whatsapp'),
      value: 'WhatsApp',
      href: getWhatsAppLink(data.whatsapp, 'Merhaba, teklif almak istiyorum.'),
    },
    { icon: MapPin, label: t('contact.address'), value: address },
  ]

  return (
    <section id="contact" className="section-padding bg-neutral-50 dark:bg-neutral-950/50">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-4">{t('contact.title')}</h2>
          <p className="text-muted text-lg">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <item.icon className="w-6 h-6 text-accent mb-3" />
                  <p className="text-sm text-muted mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-medium hover:text-accent transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium">{item.value}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {mapsUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 h-[400px]"
            >
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
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
