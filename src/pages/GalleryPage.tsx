import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@/components/seo/SEO'
import { SkeletonGalleryItem, SkeletonVideoItem } from '@/components/ui/Skeleton'
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
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null)

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

  const defaultPhotos = [
    { id: 'f-1', image_url: '/images/factory-exterior.jpg', title_tr: 'Aydın Torna Dış Görünüm', title_en: 'Aydın Torna Exterior View', category: 'genel' },
    { id: 'f-2', image_url: '/images/long-lathe.jpg', title_tr: '7.5 Metre CNC Torna Tezgahı', title_en: '7.5m CNC Lathe Machine', category: 'torna' },
    { id: 'f-3', image_url: '/images/lathe-workpiece.jpg', title_tr: 'Ağır Sanayi CNC Torna İmalatı', title_en: 'Heavy Duty CNC Lathe Production', category: 'torna' },
    { id: 'f-4', image_url: '/images/lathe-chuck.jpg', title_tr: 'Hassas Torna İşleme Aşaması', title_en: 'Precision Lathe Machining Stage', category: 'torna' }
  ]

  const displayPhotos = gallery.length > 0 ? gallery : defaultPhotos
  const items = tab === 'photos' ? displayPhotos : videos
  const visibleItems = items.slice(0, page * ITEMS_PER_PAGE)
  const hasMore = visibleItems.length < items.length

  return (
    <>
      <SEO page="gallery" seo={seo} />

      <div className="pt-24 lg:pt-32 section-padding">
        <div className="container-max mx-auto">
          {/* Geri Dönüş Linki */}
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </Link>
          </div>

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
                      : 'bg-neutral-100 dark:bg-neutral-800 text-muted hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {lang === 'tr' ? cat.tr : cat.en}
                </button>
              ))}
            </div>
          </div>

          {/* Skeleton loading state */}
          {loading ? (
            tab === 'photos' ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {Array.from({ length: 9 }).map((_, i) => (
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
          ) : items.length === 0 ? (
            <p className="text-center text-muted py-20">{t('gallery.noItems')}</p>
          ) : tab === 'photos' ? (
            <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {visibleItems.map((item) => {
                const photo = item as GalleryItem
                return (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="break-inside-avoid cursor-pointer group"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm">
                      <img
                        src={photo.image_url}
                        alt={getLocalizedField(photo, 'title', lang) || 'Galeri görseli'}
                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={400}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end p-4">
                        <p className="text-white text-xs font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase">
                          {lang === 'tr' ? 'Büyüt' : 'Zoom'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
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
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )
              })}
            </div>
          )}

          {hasMore && !loading && (
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

      {/* Lightbox / Modal Görünümü */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            >
              <img
                src={selectedPhoto.image_url}
                alt={getLocalizedField(selectedPhoto, 'title', lang) || 'Galeri görseli'}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
              <div className="p-6 bg-neutral-950 text-white border-t border-neutral-800">
                <h4 className="font-semibold text-lg">
                  {getLocalizedField(selectedPhoto, 'title', lang) || (lang === 'tr' ? selectedPhoto.title_tr : selectedPhoto.title_en) || 'Aydın Torna CNC'}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">
                  {lang === 'tr' ? 'Kategori' : 'Category'}: {selectedPhoto.category ? t(`gallery.categories.${selectedPhoto.category}`, selectedPhoto.category) : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-colors border border-white/10"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
