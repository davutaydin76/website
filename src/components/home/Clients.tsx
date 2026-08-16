import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Client } from '@/types'

interface ClientsProps {
  clients?: Client[]
}

interface BrandItem {
  id: string
  name: string
  logo_url?: string | null
  website?: string | null
}

const fallbackBrands: BrandItem[] = [
  { id: 'fb-1', name: 'RÖHM Germany', website: 'https://www.roehm.biz/' },
  { id: 'fb-2', name: 'SIEMENS', website: 'https://www.siemens.com/' },
  { id: 'fb-3', name: 'FAGOR', website: 'https://www.fagorautomation.com/' },
  { id: 'fb-4', name: 'SANDVIK', website: 'https://www.sandvik.coromant.com/' },
  { id: 'fb-5', name: 'HAAS Automation', website: 'https://www.haascnc.com/' },
  { id: 'fb-6', name: 'YAMAZAKI MAZAK', website: 'https://www.mazakeu.com/' },
]

export default function Clients({ clients }: ClientsProps) {
  const { t } = useTranslation()
  const baseList: BrandItem[] = clients?.length ? clients : fallbackBrands

  // Logolar az sayıda olsa bile sağda boşluk kalmaması için çoğalt
  const repeatCount = Math.max(2, Math.ceil(12 / baseList.length))
  const singleSet: BrandItem[] = Array.from({ length: repeatCount }).flatMap(() => baseList)
  const displayList: BrandItem[] = [...singleSet, ...singleSet]

  return (
    <section className="bg-zinc-950 py-16 md:py-20 overflow-hidden border-y border-zinc-900 relative">
      {/* Sol ve sağ kenar karartma yumuşak geçiş efektleri (Fade Gradients) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
            {t('clients.title') || 'Çalıştığımız Markalar'}
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            {t('clients.subtitle') || 'Yüksek hassasiyetli imalatta güvendiğimiz ve iş birliği yaptığımız teknolojiler'}
          </p>
        </motion.div>
      </div>

      {/* Sonsuz Kayan Bant (Infinite Marquee) */}
      <div className="relative w-full overflow-hidden py-2 flex items-center">
        <div className="flex w-max gap-4 md:gap-6 animate-marquee hover:[animation-play-state:paused] items-center">
          {displayList.map((item, index) => {
            const hasLogo = 'logo_url' in item && item.logo_url

            const content = (
              <div className="min-w-[180px] md:min-w-[220px] h-[90px] md:h-[110px] p-4 md:p-6 bg-zinc-900/70 border border-zinc-800 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50 hover:bg-zinc-800/80 hover:scale-105 group select-none shadow-sm">
                {hasLogo ? (
                  <img
                    src={item.logo_url!}
                    alt={item.name}
                    className="max-h-[50px] md:max-h-[65px] max-w-[140px] md:max-w-[170px] w-auto h-auto object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm md:text-base font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider text-center transition-colors duration-300">
                    {item.name}
                  </span>
                )}
              </div>
            )

            if (item.website) {
              return (
                <a
                  key={`${item.id}-${index}`}
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block flex-shrink-0"
                  aria-label={item.name}
                >
                  {content}
                </a>
              )
            }

            return (
              <div key={`${item.id}-${index}`} className="flex-shrink-0">
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
