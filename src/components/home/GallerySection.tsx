import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Play, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SkeletonGalleryItem, SkeletonVideoItem } from '@/components/ui/Skeleton'
import { GALLERY_CATEGORIES, getLocalizedField } from '@/lib/utils'
import type { GalleryItem, VideoItem } from '@/types'

interface GallerySectionProps {
  gallery?: GalleryItem[]
  videos?: VideoItem[]
  loading?: boolean
}

export default function GallerySection({ gallery = [], videos = [], loading = false }: GallerySectionProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const [tab, setTab] = useState<'photos' | 'videos'>('photos')
  const [category, setCategory] = useState('all')

  const defaultPhotos = [
    { id: 'f-1', image_url: '/images/factory-exterior.jpg', title_tr: 'Aydın Torna Dış Görünüm', title_en: 'Aydın Torna Exterior View', category: 'general' },
    { id: 'f-2', image_url: '/images/long-lathe.jpg', title_tr: '7.5 Metre CNC Torna Tezgahı', title_en: '7.5m CNC Lathe Machine', category: 'cnc' },
    { id: 'f-3', image_url: '/images/lathe-workpiece.jpg', title_tr: 'Ağır Sanayi CNC Torna İmalatı', title_en: 'Heavy Duty CNC Lathe Production', category: 'cnc' },
    { id: 'f-4', image_url: '/images/lathe-chuck.jpg', title_tr: 'Hassas Torna İşleme Aşaması', title_en: 'Precision Lathe Machining Stage', category: 'cnc' }
  ]

  const filteredPhotos = category === 'all'
    ? (gallery.length > 0 ? gallery : defaultPhotos)
    : (gallery.length > 0 ? gallery.filter((g) => g.category === category) : defaultPhotos.filter(p => p.category === category))

  const filteredVideos = category === 'all'
    ? videos
    : videos.filter((v) => v.category === category)

  return (
    <section id="gallery" className="section-padding">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-4">{t('gallery.title')}</h2>
          <p className="text-muted text-lg">{t('gallery.subtitle')}</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('photos')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === 'photos'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {t('gallery.photos')}
            </button>
            <button
              onClick={() => setTab('videos')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === 'videos'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {t('gallery.videos')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  category === cat.id
                    ? 'bg-accent text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-muted hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {lang === 'tr' ? cat.tr : cat.en}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          tab === 'photos' ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonGalleryItem key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonVideoItem key={i} />
              ))}
            </div>
          )
        ) : tab === 'photos' ? (
          filteredPhotos.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filteredPhotos.slice(0, 6).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="break-inside-avoid"
                >
                  {/* aspect-ratio wrapper önler CLS */}
                  <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={item.image_url}
                      alt={getLocalizedField(item, 'title', lang) || 'Galeri görseli'}
                      className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={400}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted py-12">{t('gallery.noItems')}</p>
          )
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.slice(0, 6).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-2xl overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-800 group"
              >
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={getLocalizedField(item, 'title', lang) || 'Video görseli'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={360}
                  />
                ) : (
                  <video src={item.video_url} className="w-full h-full object-cover" muted preload="none" />
                )}
                <a
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={getLocalizedField(item, 'title', lang) || 'Videoyu oynat'}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-neutral-900 ml-1" />
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted py-12">{t('gallery.noItems')}</p>
        )}

        <div className="text-center mt-10">
          <Link to="/gallery">
            <Button variant="outline">
              {t('gallery.loadMore')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
