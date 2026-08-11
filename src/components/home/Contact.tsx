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
            {items.map((item, i) => {
              const isWhatsapp = item.label === t('contact.whatsapp')
              const CardContent = (
                <Card
                  hover
                  className={`h-full flex flex-col justify-between p-6 transition-all duration-300 ${
                    isWhatsapp
                      ? 'group-hover:bg-[#25D366]/10 group-hover:border-[#25D366]/50'
                      : ''
                  }`}
                >
                  <div>
                    <item.icon
                      className={`w-6 h-6 mb-4 transition-colors duration-300 ${
                        isWhatsapp
                          ? 'text-accent group-hover:text-[#25D366]'
                          : 'text-accent'
                      }`}
                    />
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-1">{item.label}</p>
                    <p
                      className={`font-semibold text-neutral-950 dark:text-white leading-relaxed text-sm sm:text-base transition-colors duration-300 ${
                        isWhatsapp ? 'group-hover:text-[#25D366]' : ''
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                  {item.href && (
                    <div
                      className={`mt-4 text-xs font-semibold flex items-center gap-1 transition-colors duration-300 ${
                        isWhatsapp
                          ? 'text-[#25D366] group-hover:text-[#25D366]'
                          : 'text-accent group-hover:text-accent/80'
                      }`}
                    >
                      <span>{lang === 'tr' ? 'Bağlantıyı Aç' : 'Open Link'}</span>
                      <span>→</span>
                    </div>
                  )}
                </Card>
              )

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="h-full"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.target || '_self'}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="block h-full group"
                    >
                      {CardContent}
                    </a>
                  ) : (
                    CardContent
                  )}
                </motion.div>
              )
            })}
          </div>

          {mapsUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 h-[400px] shadow-sm"
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
