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

  // DOM boyutunu hafif tutmak için yalnızca 2 kopya kullanılır
  const displayList: BrandItem[] = [...baseList, ...baseList]

  return (
    <section className="bg-zinc-950 py-12 md:py-16 overflow-hidden relative border-y border-zinc-900/60">
      {/* Sol ve sağ kenar karartma geçişleri */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
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

      {/* Sade, düz, bordersız ve kutusuz kayan marka logoları */}
      <div className="relative w-full overflow-hidden py-2 flex items-center">
        <div className="flex w-max gap-8 md:gap-12 animate-marquee items-center [animation-duration:35s]">
          {displayList.map((item, index) => {
            const hasLogo = 'logo_url' in item && item.logo_url

            const content = (
              <div className="h-10 md:h-12 flex items-center justify-center select-none opacity-80 hover:opacity-100 transition-opacity duration-200">
                {hasLogo ? (
                  <img
                    src={item.logo_url!}
                    alt={item.name}
                    width={130}
                    height={48}
                    className="max-h-10 md:max-h-12 max-w-[130px] md:max-w-[160px] w-auto h-auto object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-sm md:text-base font-bold text-zinc-300 uppercase tracking-widest text-center">
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
