import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getWhatsAppLink } from '@/lib/utils'

const WA_MESSAGE = 'Merhaba, Aydın Torna CNC hizmetleriniz hakkında bilgi almak istiyorum.'
const LINKEDIN_URL = 'https://www.linkedin.com/company/aydin-torna-cnc'
const INSTAGRAM_URL = 'https://www.instagram.com/aydintornacnc'
const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '905058807700'

/** LinkedIn markası SVG */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.024-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

/** Instagram markası SVG */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

/** WhatsApp markası SVG */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.535 5.873L.057 23.428a.75.75 0 0 0 .921.921l5.557-1.478A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.745 9.745 0 0 1-5.032-1.392l-.36-.214-3.737.993.993-3.737-.215-.36A9.745 9.745 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
    </svg>
  )
}

export default function SocialCallToAction() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  const waLink = getWhatsAppLink(WA_NUMBER, WA_MESSAGE)

  const socials = [
    {
      label: 'LinkedIn',
      href: LINKEDIN_URL,
      icon: LinkedInIcon,
      bg: 'bg-[#0A66C2]',
      glow: 'hover:shadow-[0_0_30px_rgba(10,102,194,0.45)]',
    },
    {
      label: 'Instagram',
      href: INSTAGRAM_URL,
      icon: InstagramIcon,
      bg: 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]',
      glow: 'hover:shadow-[0_0_30px_rgba(225,48,108,0.45)]',
    },
    {
      label: 'WhatsApp',
      href: waLink,
      icon: WhatsAppIcon,
      bg: 'bg-[#25D366]',
      glow: 'hover:shadow-[0_0_30px_rgba(37,211,102,0.45)]',
    },
  ]

  return (
    <section
      aria-labelledby="social-cta-heading"
      className="w-full bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-16 md:py-20 overflow-hidden relative transition-colors"
    >
      {/* Arka plan dekorasyon — hafif radial */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #F97316 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Başlık */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-600 dark:text-accent mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              {lang === 'tr' ? 'Bizi Takip Edin' : 'Follow Us'}
            </span>
            <h2
              id="social-cta-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white leading-tight max-w-2xl"
            >
              {lang === 'tr'
                ? 'Her hafta yeni bir üretim hikayesi!'
                : 'A new production story every week!'}
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              {lang === 'tr'
                ? 'Bizi LinkedIn ve Instagram\'dan takip edin, ağır sanayi çözümlerimizi, CNC torna hikayelerimizi ve teknik içeriklerimizi keşfedin.'
                : 'Follow us on LinkedIn and Instagram to discover our heavy industry solutions, CNC turning stories and technical content.'}
            </p>
          </motion.div>

          {/* Sosyal Medya Butonları */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {socials.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    lang === 'tr'
                      ? `Aydın Torna CNC ${s.label} sayfasını ziyaret et`
                      : `Visit Aydın Torna CNC on ${s.label}`
                  }
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center gap-3
                    ${s.bg} text-white
                    px-6 py-3.5 rounded-2xl
                    font-semibold text-sm
                    shadow-xl ${s.glow}
                    transition-shadow duration-300
                  `}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span>{s.label}</span>
                </motion.a>
              )
            })}
          </motion.div>

          {/* Alt not */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-xs text-zinc-500 dark:text-zinc-500 mt-2"
          >
            {lang === 'tr'
              ? 'Haftalık teknik içerik · Ağır sanayi projeleri · CNC torna ve freze çözümleri'
              : 'Weekly technical content · Heavy industry projects · CNC turning & milling solutions'}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
