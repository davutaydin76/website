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
    <section className="bg-zinc-950 py-14 md:py-18 overflow-hidden border-y border-zinc-900/60 relative">
      {/* Sol ve sağ kenar karartma yumuşak geçiş efektleri (Fade Gradients) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 md:w-36 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 md:w-36 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 mb-8">
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

      {/* Sonsuz Kayan Bant (Infinite Marquee)
          Hover'da tamamen durmasın — yalnızca yavaşlasın.
          CSS animasyon süresi geçiş (transition-all) ile sağlanır.  */}
      <div className="relative w-full overflow-hidden py-2 flex items-center">
        <div
          className="flex w-max gap-3 md:gap-4 animate-marquee items-center
            hover:[animation-duration:80s] [animation-duration:35s]
            transition-[animation-duration] duration-700"
        >
          {displayList.map((item, index) => {
            const hasLogo = 'logo_url' in item && item.logo_url

            const content = (
              <div
                className="
                  min-w-[140px] md:min-w-[170px]
                  h-[65px] md:h-[80px]
                  px-4 py-3
                  bg-zinc-900/40 border border-zinc-800/60 rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  hover:border-orange-500/40 hover:bg-zinc-800/60 hover:scale-105
                  group select-none shadow-sm
                "
              >
                {hasLogo ? (
                  <img
                    src={item.logo_url!}
                    alt={item.name}
                    width={130}
                    height={50}
                    className="max-h-[40px] md:max-h-[50px] max-w-[110px] md:max-w-[140px] w-auto h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-sm md:text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider text-center transition-colors duration-300">
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
