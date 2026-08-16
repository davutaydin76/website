import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import { getLocalizedField, getOptimizedImageUrl } from '@/lib/utils'
import type { Machine } from '@/types'

interface MachinesProps {
  machines?: Machine[]
}

const fallbackMachines = [
  { name_tr: 'CNC Torna 1300x800', name_en: 'CNC Lathe 1300x800', image_url: '/images/lathe-workpiece.jpg', specs: { x: '1300mm', z: '800mm' } },
  { name_tr: 'CNC Torna 7500x900-1200', name_en: 'CNC Lathe 7500x900-1200', image_url: '/images/long-lathe.jpg', specs: { x: '7500mm', z: '900-1200mm' } },
  { name_tr: 'İşleme Merkezi', name_en: 'Machining Center', image_url: '/images/lathe-chuck.jpg', specs: { axes: '3-5' } },
  { name_tr: 'Kaynak Sistemleri', name_en: 'Welding Systems', image_url: '/images/factory-exterior.jpg', specs: { type: 'MIG/MAG/TIG' } },
]

export default function Machines({ machines }: MachinesProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const items = machines?.length ? machines : fallbackMachines

  return (
    <section id="machines" className="section-padding bg-neutral-50 dark:bg-neutral-950/50">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-4">{t('machines.title')}</h2>
          <p className="text-muted text-lg">{t('machines.subtitle')}</p>
        </motion.div>

        {/*
         * Mobil: parmakla yatay swipe carousel (flex overflow-x-auto snap-x)
         * Web (md+): 2×2 grid — md:grid md:grid-cols-2
         */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar pb-4 md:pb-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-x-visible">
          {items.map((machine, i) => {
            const name = 'id' in machine
              ? getLocalizedField(machine, 'name', lang)
              : lang === 'tr' ? machine.name_tr : machine.name_en
            const description = 'id' in machine
              ? getLocalizedField(machine, 'description', lang)
              : ''
            const specs = machine.specs || {}

            return (
              <motion.div
                key={'id' in machine ? machine.id : i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                /* Mobilde kartlar yanyana, min-w ile tam görünür */
                className="flex-shrink-0 w-[80vw] sm:w-[60vw] md:w-auto snap-start"
              >
                <Card hover className="overflow-hidden h-full">
                  {'image_url' in machine && machine.image_url && (
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-neutral-200 dark:bg-neutral-800">
                      <img
                        src={getOptimizedImageUrl(machine.image_url, 600)}
                        alt={name}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{name}</h3>
                      {description && <p className="text-sm text-muted mb-3">{description}</p>}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  </div>
                  {Object.keys(specs).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Object.entries(specs).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted"
                        >
                          {key.toUpperCase()}: {value}
                        </span>
                      ))}
                    </div>
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
