import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@/components/seo/SEO'
import SocialCallToAction from '@/components/common/SocialCallToAction'
import { SkeletonGalleryItem } from '@/components/ui/Skeleton'
import { fetchGallery, fetchVideos, fetchSeo } from '@/services/content'
import { GALLERY_CATEGORIES, getLocalizedField, normalize, getOptimizedImageUrl } from '@/lib/utils'
import type { GalleryItem, VideoItem, SeoSettings } from '@/types'

/** Galeri öğesi — fotoğraf veya video olabilir */
type UnifiedItem =
  | { kind: 'photo'; data: GalleryItem }
  | { kind: 'video'; data: VideoItem }

/** Lightbox içeriği */
type LightboxItem =
  | { kind: 'photo'; item: GalleryItem }
  | { kind: 'video'; item: VideoItem }

export default function GalleryPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const [category, setCategory] = useState('all')
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [seo, setSeo] = useState<SeoSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [g, v, s] = await Promise.all([
        fetchGallery(),
        fetchVideos(),
        fetchSeo('gallery'),
      ])
      setGallery(g)
      setVideos(v)
      setSeo(s)
      setLoading(false)
    }
    loadData()
  }, [])

  // Mouse tekerleği ile yatay kaydırma
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY * 1.1
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [category, loading])

  // ESC ile lightbox kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    if (lightbox) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  const defaultPhotos: GalleryItem[] = [
    { id: 'f-1', image_url: '/images/factory-exterior.jpg', title_tr: 'Aydın Torna Dış Görünüm', title_en: 'Aydın Torna Exterior View', category: 'genel', sort_order: 0, is_active: true, created_at: '' },
    { id: 'f-2', image_url: '/images/long-lathe.jpg', title_tr: '7.5 Metre CNC Torna Tezgahı', title_en: '7.5m CNC Lathe Machine', category: 'torna', sort_order: 1, is_active: true, created_at: '' },
    { id: 'f-3', image_url: '/images/lathe-workpiece.jpg', title_tr: 'Ağır Sanayi CNC Torna İmalatı', title_en: 'Heavy Duty CNC Lathe Production', category: 'torna', sort_order: 2, is_active: true, created_at: '' },
    { id: 'f-4', image_url: '/images/lathe-chuck.jpg', title_tr: 'Hassas Torna İşleme Aşaması', title_en: 'Precision Lathe Machining Stage', category: 'torna', sort_order: 3, is_active: true, created_at: '' },
  ]

  const sourcePhotos = gallery.length > 0 ? gallery : defaultPhotos

  // Normalize edilmiş kategori filtreleme
  const matchesFilter = useCallback((itemCat: string | undefined | null) => {
    if (!category || category === 'all') return true
    const normItem = normalize(itemCat || '')
    const normSelected = normalize(category)
    return normItem === normSelected || normItem.includes(normSelected) || normSelected.includes(normItem)
  }, [category])

  const filteredPhotos = sourcePhotos.filter((g) => matchesFilter(g.category))
  const filteredVideos = videos.filter((v) => matchesFilter(v.category))

  // Fotoğraf ve videoları tek birleşik listede karıştır (her 3 fotoğraftan sonra 1 video)
  const unified: UnifiedItem[] = []
  let vi = 0
  filteredPhotos.forEach((photo, i) => {
    unified.push({ kind: 'photo', data: photo })
    if ((i + 1) % 3 === 0 && vi < filteredVideos.length) {
      unified.push({ kind: 'video', data: filteredVideos[vi++] })
    }
  })
  while (vi < filteredVideos.length) {
    unified.push({ kind: 'video', data: filteredVideos[vi++] })
  }

  const closeLightbox = () => setLightbox(null)

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

          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
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

          {/* Skeleton loading state */}
          {loading ? (
            <div className="h-[540px] md:h-[620px] overflow-hidden flex flex-col justify-center">
              <div className="grid grid-rows-3 grid-flow-col gap-3 md:gap-4 h-full auto-cols-[220px] md:auto-cols-[300px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonGalleryItem key={i} />
                ))}
              </div>
            </div>
          ) : unified.length > 0 ? (
            /*
             * ─── 3 SATIRLI SABİT KILAVUZ YATAY BİRLEŞİK GALERİ ──────────────────
             * Fotoğraflar ve videolar tek akışta. Videolar GIF gibi sessiz çalar.
             * Tıklanınca lightbox açılır — yeni sekme kesinlikle açılmaz.
             */
            <div
              ref={scrollContainerRef}
              className="h-[540px] md:h-[620px] overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory flex flex-col justify-center overscroll-x-contain touch-pan-x py-1"
            >
              <div className="grid grid-rows-3 grid-flow-col gap-3 md:gap-4 h-full auto-cols-[220px] md:auto-cols-[300px]">
                {unified.map((item, index) => {
                  const isWide = index % 4 === 0
                  const key = item.kind === 'photo' ? `p-${item.data.id}` : `v-${item.data.id}`

                  if (item.kind === 'photo') {
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.3) }}
                        className={`${isWide ? 'col-span-2' : 'col-span-1'} row-span-1 snap-start cursor-pointer group w-full h-full select-none`}
                        onClick={() => setLightbox({ kind: 'photo', item: item.data })}
                      >
                        <div className="w-full h-full relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-sm">
                          <img
                            src={getOptimizedImageUrl(item.data.image_url, 600)}
                            alt={getLocalizedField(item.data, 'title', lang) || 'Aydın Torna CNC'}
                            width={isWide ? 600 : 300}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <p className="text-white text-xs font-semibold tracking-wider bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase line-clamp-1">
                              {getLocalizedField(item.data, 'title', lang) || (lang === 'tr' ? 'Büyüt' : 'Zoom')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }

                  // Video kartı — GIF gibi sessiz autoPlay, tıklanınca modal
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.3) }}
                      className={`${isWide ? 'col-span-2' : 'col-span-1'} row-span-1 snap-start cursor-pointer group w-full h-full select-none`}
                      onClick={() => setLightbox({ kind: 'video', item: item.data })}
                    >
                      <div className="w-full h-full relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-sm">
                        {item.data.thumbnail_url ? (
                          <img
                            src={getOptimizedImageUrl(item.data.thumbnail_url, 600)}
                            alt={getLocalizedField(item.data, 'title', lang) || 'Video önizleme'}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <video
                            src={item.data.video_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-hidden="true"
                            tabIndex={-1}
                            className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        {/* Video göstergesi */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <span className="text-white text-xs font-semibold tracking-wider bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase">
                            ▶ Video
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted py-20">{t('gallery.noItems')}</p>
          )}
        </div>

        {/* Sosyal Medya Çağrı Alanı */}
        <div className="mt-16">
          <SocialCallToAction />
        </div>
      </div>

      {/* Lightbox / Modal Görünümü */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            >
              {lightbox.kind === 'photo' ? (
                <>
                  <img
                    src={getOptimizedImageUrl(lightbox.item.image_url, 1200)}
                    alt={getLocalizedField(lightbox.item, 'title', lang) || 'Galeri görseli'}
                    className="max-h-[75vh] w-auto object-contain mx-auto"
                  />
                  <div className="p-6 bg-neutral-950 text-white border-t border-neutral-800">
                    <h2 className="font-semibold text-lg">
                      {getLocalizedField(lightbox.item, 'title', lang) || (lang === 'tr' ? lightbox.item.title_tr : lightbox.item.title_en) || 'Aydın Torna CNC'}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">
                      {lang === 'tr' ? 'Kategori' : 'Category'}: {lightbox.item.category ? t(`gallery.categories.${lightbox.item.category}`, lightbox.item.category) : ''}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <video
                    src={lightbox.item.video_url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[75vh] w-full object-contain bg-black"
                  />
                  <div className="p-6 bg-neutral-950 text-white border-t border-neutral-800">
                    <h2 className="font-semibold text-lg">
                      {getLocalizedField(lightbox.item, 'title', lang) || (lang === 'tr' ? lightbox.item.title_tr : lightbox.item.title_en) || 'Aydın Torna CNC'}
                    </h2>
                  </div>
                </>
              )}
              <button
                onClick={closeLightbox}
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
