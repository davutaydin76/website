import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SEO from '@/components/seo/SEO'
import { fetchGallery, fetchVideos, fetchSeo } from '@/services/content'
import { GALLERY_CATEGORIES, getLocalizedField } from '@/lib/utils'
import type { GalleryItem, VideoItem, SeoSettings } from '@/types'

const ITEMS_PER_PAGE = 12

export default function GalleryPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const [tab, setTab] = useState<'photos' | 'videos'>('photos')
  const [category, setCategory] = useState('all')
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [seo, setSeo] = useState<SeoSettings | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [g, v, s] = await Promise.all([
      fetchGallery(category === 'all' ? undefined : category),
      fetchVideos(category === 'all' ? undefined : category),
      fetchSeo('gallery'),
    ])
    setGallery(g)
    setVideos(v)
    setSeo(s)
    setLoading(false)
    setPage(1)
  }, [category])

  useEffect(() => {
    loadData()
  }, [loadData])

  const items = tab === 'photos' ? gallery : videos
  const visibleItems = items.slice(0, page * ITEMS_PER_PAGE)
  const hasMore = visibleItems.length < items.length

  return (
    <>
      <SEO page="gallery" seo={seo} />

      <div className="pt-24 lg:pt-32 section-padding">
        <div className="container-max mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="heading-xl mb-4">{t('gallery.title')}</h1>
            <p className="text-muted text-lg">{t('gallery.subtitle')}</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex gap-2">
              {(['photos', 'videos'] as const).map((t_) => (
                <button
                  key={t_}
                  onClick={() => { setTab(t_); setPage(1) }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tab === t_
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {t(`gallery.${t_}`)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat.id
                      ? 'bg-accent text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-muted'
                  }`}
                >
                  {lang === 'tr' ? cat.tr : cat.en}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted py-20">{t('gallery.noItems')}</p>
          ) : tab === 'photos' ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {visibleItems.map((item, i) => {
                const photo = item as GalleryItem
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (i % ITEMS_PER_PAGE) * 0.03 }}
                    className="break-inside-avoid"
                  >
                    <img
                      src={photo.image_url}
                      alt={getLocalizedField(photo, 'title', lang) || 'Gallery'}
                      className="w-full rounded-2xl object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleItems.map((item, i) => {
                const video = item as VideoItem
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (i % ITEMS_PER_PAGE) * 0.03 }}
                    className="rounded-2xl overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-800"
                  >
                    <video
                      src={video.video_url}
                      poster={video.thumbnail_url || undefined}
                      controls
                      className="w-full h-full object-cover"
                      preload="none"
                    />
                  </motion.div>
                )
              })}
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                {t('gallery.loadMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
