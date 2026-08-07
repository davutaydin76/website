import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SEO from '@/components/seo/SEO'
import OfferForm from '@/components/forms/OfferForm'
import { fetchSeo } from '@/services/content'
import type { SeoSettings } from '@/types'

export default function OfferPage() {
  const { t } = useTranslation()
  const [seo, setSeo] = useState<SeoSettings | null>(null)

  useEffect(() => {
    fetchSeo('offer').then(setSeo)
  }, [])

  return (
    <>
      <SEO page="offer" seo={seo} />

      <div className="pt-24 lg:pt-32 section-padding min-h-screen">
        <div className="container-max mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="heading-xl mb-4">{t('offer.title')}</h1>
            <p className="text-muted text-lg">{t('offer.subtitle')}</p>
          </motion.div>

          <OfferForm />
        </div>
      </div>
    </>
  )
}
