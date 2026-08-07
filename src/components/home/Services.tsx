import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  CircleDot, Box, Settings, Puzzle, Flame, Zap, Layers, Cog,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import { getLocalizedField } from '@/lib/utils'
import type { Service } from '@/types'

const iconMap: Record<string, typeof Cog> = {
  'circle-dot': CircleDot,
  box: Box,
  settings: Settings,
  puzzle: Puzzle,
  flame: Flame,
  zap: Zap,
  layers: Layers,
  cog: Cog,
}

interface ServicesProps {
  services?: Service[]
}

const fallbackServices = [
  { icon: 'circle-dot', title_tr: 'CNC Torna', title_en: 'CNC Lathe' },
  { icon: 'box', title_tr: 'İşleme Merkezi', title_en: 'Machining Center' },
  { icon: 'settings', title_tr: 'Talaşlı İmalat', title_en: 'Chip Removal' },
  { icon: 'puzzle', title_tr: 'Özel Parça İmalatı', title_en: 'Custom Parts' },
  { icon: 'flame', title_tr: 'Kaynak', title_en: 'Welding' },
  { icon: 'zap', title_tr: 'Gazaltı Kaynak', title_en: 'MIG/MAG Welding' },
  { icon: 'layers', title_tr: 'Profil İşleme', title_en: 'Profile Processing' },
]

export default function Services({ services }: ServicesProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const items = services?.length ? services : fallbackServices

  return (
    <section id="services" className="section-padding">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((service, i) => {
            const Icon = iconMap[service.icon] || Cog
            const title = 'id' in service
              ? getLocalizedField(service, 'title', lang)
              : lang === 'tr' ? service.title_tr : service.title_en
            const description = 'id' in service
              ? getLocalizedField(service, 'description', lang)
              : ''

            return (
              <motion.div
                key={'id' in service ? String(service.id) : i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card hover className="h-full group">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  {description && (
                    <p className="text-sm text-muted">{description}</p>
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
