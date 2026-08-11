import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Client } from '@/types'

interface ClientsProps {
  clients?: Client[]
}

export default function Clients({ clients }: ClientsProps) {
  const { t } = useTranslation()

  if (!clients?.length) {
    return (
      <section className="section-padding">
        <div className="container-max mx-auto text-center">
          <h2 className="heading-lg mb-4">{t('clients.title')}</h2>
          <p className="text-muted">{t('clients.subtitle')}</p>
          <p className="text-sm text-muted mt-6">{t('clients.empty')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-4">{t('clients.title')}</h2>
          <p className="text-muted text-lg">{t('clients.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 items-center">
          {clients.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-center p-4 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              {client.website_url ? (
                <a href={client.website_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={client.logo_url}
                    alt={client.name}
                    className="max-h-12 w-auto object-contain"
                    loading="lazy"
                  />
                </a>
              ) : (
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="max-h-12 w-auto object-contain"
                  loading="lazy"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
