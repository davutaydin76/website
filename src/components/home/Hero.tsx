import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getLocalizedField } from '@/lib/utils'
import type { HeroContent } from '@/types'

interface HeroProps {
  content?: HeroContent | null
}

export default function Hero({ content }: HeroProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  const title = (content ? getLocalizedField(content, 'title', lang) : null) || t('hero.title')
  const subtitle = (content ? getLocalizedField(content, 'subtitle', lang) : null) || t('hero.subtitle')
  const ctaPrimary = (content ? getLocalizedField(content, 'cta_primary', lang) : null) || t('hero.get_quote') || t('hero.ctaPrimary') || (lang === 'tr' ? 'Teklif Al' : 'Get Quote')
  const ctaSecondary = (content ? getLocalizedField(content, 'cta_secondary', lang) : null) || t('hero.our_services') || t('hero.ctaSecondary') || (lang === 'tr' ? 'Hizmetlerimiz' : 'Our Services')

  // Yalnızca Supabase/yerel güvenli kaynaktan gelen video URL kullanılır.
  // Harici (mixkit.co vb.) bağlantılar kesinlikle kullanılmaz.
  const videoUrl = content?.video_url || null

  const backgroundImage = content?.background_image || '/images/factory-exterior.webp'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={
          !videoUrl
            ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        {videoUrl ? (
          /* Arka plan videosu — yalnızca güvenli kaynaktan (Supabase/yerel).
             aria-hidden ve tabIndex=-1 ile ekran okuyuculardan gizlenir. */
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            tabIndex={-1}
            className="w-full h-full object-cover"
            preload="metadata"
            poster={content?.image_url || backgroundImage}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      <div className="relative z-10 container-max mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-accent font-medium text-sm tracking-widest uppercase mb-6">
            Kocaeli Dilovası
          </p>
          <h1 className="heading-xl text-balance mb-6 max-w-4xl mx-auto">
            {title}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 text-balance">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/offer">
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[180px] bg-accent text-white hover:bg-accent-600 flex items-center justify-center gap-2 font-medium shadow-lg shadow-accent/20"
              >
                <span>{ctaPrimary}</span>
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </Button>
            </Link>
            <a href="#services">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[180px] border border-white/30 text-white backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center font-medium"
              >
                {ctaSecondary}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <a href="#services" aria-label="Aşağı kaydır">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </a>
      </motion.div>
    </section>
  )
}
