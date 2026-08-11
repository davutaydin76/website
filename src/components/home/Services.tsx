import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  RotateCw, Layers, Sparkles, ShieldCheck,
  CircleDot, Box, Settings, Puzzle, Flame, Zap, Cog
} from 'lucide-react'
import Card from '@/components/ui/Card'
import { getLocalizedField } from '@/lib/utils'
import type { Service } from '@/types'

const iconMap: Record<string, any> = {
  'rotate-cw': RotateCw,
  'layers': Layers,
  'sparkles': Sparkles,
  'shield-check': ShieldCheck,
  'circle-dot': CircleDot,
  'box': Box,
  'settings': Settings,
  'puzzle': Puzzle,
  'flame': Flame,
  'zap': Zap,
  'cog': Cog,
}

interface ServicesProps {
  services?: Service[]
}

const fallbackServices = [
  {
    icon: 'rotate-cw',
    title_tr: 'CNC Torna İşlemleri',
    title_en: 'CNC Lathe Operations',
    description_tr: 'Geniş çaptaki iş parçalarının hassas tornalanması ve talaşlı üretimi.',
    description_en: 'Precision turning and machining of workpieces in wide range of sizes.',
  },
  {
    icon: 'layers',
    title_tr: 'CNC Freze İşleri',
    title_en: 'CNC Milling Works',
    description_tr: '3 ve 5 eksenli dik işleme merkezlerimizde karmaşık geometrili parçaların üretimi.',
    description_en: 'Production of complex geometry parts in our 3 and 5-axis vertical machining centers.',
  },
  {
    icon: 'sparkles',
    title_tr: 'Prototip Üretim',
    title_en: 'Prototype Production',
    description_tr: 'Seri üretim öncesi Ar-Ge süreçleri ve parça doğrulama çalışmaları.',
    description_en: 'R&D processes and part validation studies prior to mass production.',
  },
  {
    icon: 'shield-check',
    title_tr: 'Hassas Ölçüm ve Kontrol',
    title_en: 'Precision Measurement & Control',
    description_tr: 'Geniş ölçüm cihazları ile mikron seviyesinde kalite kontrol ve raporlama.',
    description_en: 'Micron-level quality control and reporting with advanced measurement equipment.',
  },
]

export default function Services({ services }: ServicesProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const items = services?.length ? services : fallbackServices

  return (
    <section id="services" className="section-padding bg-neutral-50 dark:bg-neutral-950/20">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-4">{t('services.title')}</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">{t('services.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((service, i) => {
            const Icon = iconMap[service.icon] || Cog
            const title = 'id' in service
              ? getLocalizedField(service, 'title', lang)
              : lang === 'tr' ? service.title_tr : service.title_en
            const description = 'id' in service
              ? getLocalizedField(service, 'description', lang)
              : lang === 'tr' ? service.description_tr : service.description_en

            return (
              <motion.div
                key={'id' in service ? String(service.id) : i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="h-full"
              >
                <Card
                  className="h-full group bg-white/80 dark:bg-zinc-900/60 border border-neutral-200 dark:border-zinc-800 backdrop-blur-sm hover:border-orange-500/50 hover:bg-neutral-50 dark:hover:bg-zinc-900/90 hover:-translate-y-1 transition-all duration-300 p-6"
                >
                  {/* İkon kutusu - Turuncu/Accent gradient ve çerçeve */}
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-sm text-muted leading-relaxed">
                      {description}
                    </p>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
