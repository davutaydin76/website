import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Client } from '@/types'

interface ClientsProps {
  clients?: Client[]
}

const fallbackBrands = [
  { id: 'fb-1', name: 'RÖHM Germany', website_url: 'https://www.roehm.biz/' },
  { id: 'fb-2', name: 'SIEMENS', website_url: 'https://www.siemens.com/' },
  { id: 'fb-3', name: 'FAGOR', website_url: 'https://www.fagorautomation.com/' },
  { id: 'fb-4', name: 'SANDVIK', website_url: 'https://www.sandvik.coromant.com/' },
  { id: 'fb-5', name: 'HAAS Automation', website_url: 'https://www.haascnc.com/' },
  { id: 'fb-6', name: 'YAMAZAKI MAZAK', website_url: 'https://www.mazakeu.com/' },
]

export default function Clients({ clients }: ClientsProps) {
  const { t } = useTranslation()
  const list = clients?.length ? clients : fallbackBrands

  return (
    <section className="bg-neutral-950 dark:bg-neutral-950 py-16 overflow-hidden border-y border-neutral-900 relative">
      {/* Yan taraflardaki yumuşak siyah geçiş fade efekti */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
            {t('clients.title') || 'Çalıştığımız Markalar'}
          </h2>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">
            {t('clients.subtitle') || 'Yüksek hassasiyetli imalatta güvendiğimiz ve iş birliği yaptığımız teknolojiler'}
          </p>
        </motion.div>

        {/* Sonsuz Kayan Bant (Infinite Marquee) */}
        <div className="relative w-full overflow-hidden py-4 flex items-center">
          <motion.div
            className="flex gap-16 flex-nowrap shrink-0 pr-16 items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              ease: 'linear',
              duration: 20,
              repeat: Infinity,
            }}
          >
            {/* Birinci set */}
            {list.map((item) => (
              <div key={`${item.id}-1`} className="flex-shrink-0">
                {item.website_url ? (
                  <a
                    href={item.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    {'logo_url' in item && item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={item.name}
                        className="h-10 max-w-[150px] object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 filter invert dark:invert-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 px-6 rounded-lg bg-white/5 border border-white/10 text-white/40 group-hover:text-white group-hover:bg-white/10 group-hover:border-orange-500/50 font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-all duration-300">
                        {item.name}
                      </div>
                    )}
                  </a>
                ) : (
                  <div>
                    {'logo_url' in item && item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={item.name}
                        className="h-10 max-w-[150px] object-contain opacity-50 filter invert dark:invert-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 px-6 rounded-lg bg-white/5 border border-white/10 text-white/40 font-bold uppercase tracking-widest text-xs flex items-center justify-center">
                        {item.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* İkinci set (sonsuz döngü için kopya) */}
            {list.map((item) => (
              <div key={`${item.id}-2`} className="flex-shrink-0">
                {item.website_url ? (
                  <a
                    href={item.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    {'logo_url' in item && item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={item.name}
                        className="h-10 max-w-[150px] object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 filter invert dark:invert-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 px-6 rounded-lg bg-white/5 border border-white/10 text-white/40 group-hover:text-white group-hover:bg-white/10 group-hover:border-orange-500/50 font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-all duration-300">
                        {item.name}
                      </div>
                    )}
                  </a>
                ) : (
                  <div>
                    {'logo_url' in item && item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={item.name}
                        className="h-10 max-w-[150px] object-contain opacity-50 filter invert dark:invert-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 px-6 rounded-lg bg-white/5 border border-white/10 text-white/40 font-bold uppercase tracking-widest text-xs flex items-center justify-center">
                        {item.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
