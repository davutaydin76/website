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

  const title = content
    ? getLocalizedField(content, 'title', lang)
    : t('hero.title')
  const subtitle = content
    ? getLocalizedField(content, 'subtitle', lang)
    : t('hero.subtitle')
  const ctaPrimary = content
    ? getLocalizedField(content, 'cta_primary', lang)
    : t('hero.ctaPrimary')
  const ctaSecondary = content
    ? getLocalizedField(content, 'cta_secondary', lang)
    : t('hero.ctaSecondary')

  const videoUrl = content?.video_url ||
    'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-cnc-machine-cutting-metal-4933-large.mp4'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          // Hero videosu LCP öğesi — eager + yüksek fetchpriority
          preload="metadata"
          poster={content?.image_url || '/images/factory-exterior.jpg'}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
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
              <Button variant="secondary" size="lg" className="min-w-[180px]">
                {ctaPrimary}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#contact">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[180px] border-white/30 text-white hover:bg-white/10"
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
