import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { getLocalizedField, getOptimizedImageUrl } from '@/lib/utils'
import type { Machine } from '@/types'

interface MachinesProps {
  machines?: Machine[]
}

const fallbackMachines = [
  { name_tr: 'CNC Torna 1300x800', name_en: 'CNC Lathe 1300x800', image_url: '/images/lathe-workpiece.webp', specs: { x: '1300mm', z: '800mm' } },
  { name_tr: 'CNC Torna 5500x900-1200', name_en: 'CNC Lathe 5500x900-1200', image_url: '/images/long-lathe.webp', specs: { x: '5500mm', z: '900-1200mm' } },
  { name_tr: 'İşleme Merkezi', name_en: 'Machining Center', image_url: '/images/lathe-chuck.webp', specs: { axes: '3-5' } },
  { name_tr: 'Kaynak Sistemleri', name_en: 'Welding Systems', image_url: '/images/factory-exterior.webp', specs: { type: 'MIG/MAG/TIG' } },
]

export default function Machines({ machines }: MachinesProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const items = machines?.length ? machines : fallbackMachines

  return (
    <section id="machines" className="section-padding bg-zinc-950">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-4 text-white">{t('machines.title')}</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t('machines.subtitle')}</p>
        </motion.div>

        {/*
         * Mobil: parmakla yatay swipe (snap-x)
         * Web (md+): 2×2 grid — sade, düz, çerçevesiz ve pürüzsüz kartlar
         */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-4 md:pb-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-x-visible">
          {items.map((machine, i) => {
            const name = 'id' in machine
              ? getLocalizedField(machine, 'name', lang)
              : lang === 'tr' ? machine.name_tr : machine.name_en
            const description = 'id' in machine
              ? getLocalizedField(machine, 'description', lang)
              : ''
            const specs = machine.specs || {}

            return (
              <div
                key={'id' in machine ? machine.id : i}
                className="flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-auto snap-start flex flex-col"
              >
                {'image_url' in machine && machine.image_url && (
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-zinc-900">
                    <img
                      src={getOptimizedImageUrl(machine.image_url, 600, 70)}
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
                    <h3 className="font-semibold text-xl text-white mb-1.5">{name}</h3>
                    {description && <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{description}</p>}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                </div>
                {Object.keys(specs).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(specs).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-900 text-zinc-300"
                      >
                        {key.toUpperCase()}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
