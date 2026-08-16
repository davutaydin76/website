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

type UnifiedItem =
  | { kind: 'photo'; data: GalleryItem }
  | { kind: 'video'; data: VideoItem }

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    if (lightbox) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  const defaultPhotos: GalleryItem[] = [
    { id: 'f-1', image_url: '/images/factory-exterior.webp', title_tr: 'Aydın Torna Dış Görünüm', title_en: 'Aydın Torna Exterior View', category: 'genel', sort_order: 0, is_active: true, created_at: '' },
    { id: 'f-2', image_url: '/images/long-lathe.webp', title_tr: '5.5 Metre CNC Torna Tezgahı', title_en: '5.5m CNC Lathe Machine', category: 'torna', sort_order: 1, is_active: true, created_at: '' },
    { id: 'f-3', image_url: '/images/lathe-workpiece.webp', title_tr: 'Ağır Sanayi CNC Torna İmalatı', title_en: 'Heavy Duty CNC Lathe Production', category: 'torna', sort_order: 2, is_active: true, created_at: '' },
    { id: 'f-4', image_url: '/images/lathe-chuck.webp', title_tr: 'Hassas Torna İşleme Aşaması', title_en: 'Precision Lathe Machining Stage', category: 'torna', sort_order: 3, is_active: true, created_at: '' },
  ]

  const sourcePhotos = gallery.length > 0 ? gallery : defaultPhotos

  const matchesFilter = useCallback((itemCat: string | undefined | null) => {
    if (!category || category === 'all') return true
    const normItem = normalize(itemCat || '')
    const normSelected = normalize(category)
    return normItem === normSelected || normItem.includes(normSelected) || normSelected.includes(normItem)
  }, [category])

  const filteredPhotos = sourcePhotos.filter((g) => matchesFilter(g.category))
  const filteredVideos = videos.filter((v) => matchesFilter(v.category))

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

      <div className="pt-24 lg:pt-32 section-padding bg-white dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-white transition-colors">
        <div className="container-max mx-auto">
          {/* Geri Dönüş Linki */}
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="heading-xl mb-3 text-zinc-900 dark:text-white">{t('gallery.title')}</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">{t('gallery.subtitle')}</p>
          </div>

          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  category === cat.id
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white border border-zinc-300/80 dark:border-zinc-700/60'
                }`}
              >
                {lang === 'tr' ? cat.tr : cat.en}
              </button>
            ))}
          </div>

          {/* Skeleton loading state */}
          {loading ? (
            <div className="h-[520px] md:h-[580px] overflow-hidden flex flex-col justify-center">
              <div className="grid grid-rows-3 grid-flow-col gap-3 md:gap-4 h-full auto-cols-[220px] md:auto-cols-[300px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonGalleryItem key={i} />
                ))}
              </div>
            </div>
          ) : unified.length > 0 ? (
            <div
              ref={scrollContainerRef}
              className="h-[520px] md:h-[580px] overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory flex flex-col justify-center overscroll-x-contain touch-pan-x"
            >
              <div className="grid grid-rows-3 grid-flow-col gap-3 md:gap-4 h-full auto-cols-[220px] md:auto-cols-[300px]">
                {unified.map((item, index) => {
                  const isWide = index % 4 === 0
                  const key = item.kind === 'photo' ? `p-${item.data.id}` : `v-${item.data.id}`

                  if (item.kind === 'photo') {
                    return (
                      <div
                        key={key}
                        className={`${isWide ? 'col-span-2' : 'col-span-1'} row-span-1 snap-start cursor-pointer w-full h-full select-none rounded-lg overflow-hidden bg-zinc-900`}
                        onClick={() => setLightbox({ kind: 'photo', item: item.data })}
                      >
                        <div className="w-full h-full relative">
                          <img
                            src={getOptimizedImageUrl(item.data.image_url, 600, 70)}
                            alt={getLocalizedField(item.data, 'title', lang) || 'Aydın Torna CNC'}
                            width={isWide ? 600 : 300}
                            height={200}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={key}
                      className={`${isWide ? 'col-span-2' : 'col-span-1'} row-span-1 snap-start cursor-pointer w-full h-full select-none rounded-lg overflow-hidden bg-zinc-900`}
                      onClick={() => setLightbox({ kind: 'video', item: item.data })}
                    >
                      <div className="w-full h-full relative">
                        {item.data.thumbnail_url ? (
                          <img
                            src={getOptimizedImageUrl(item.data.thumbnail_url, 600, 70)}
                            alt={getLocalizedField(item.data, 'title', lang) || 'Video önizleme'}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
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
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-white text-[10px] font-semibold">
                          ▶ Video
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-zinc-400 py-20">{t('gallery.noItems')}</p>
          )}

          {/* Sosyal Medya Çağrı Alanı */}
          <div className="mt-16">
            <SocialCallToAction />
          </div>
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
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-zinc-950 rounded-xl overflow-hidden flex flex-col border border-zinc-800"
            >
              {lightbox.kind === 'photo' ? (
                <>
                  <img
                    src={getOptimizedImageUrl(lightbox.item.image_url, 1200, 75)}
                    alt={getLocalizedField(lightbox.item, 'title', lang) || 'Galeri görseli'}
                    className="max-h-[75vh] w-auto object-contain mx-auto"
                  />
                  <div className="p-5 bg-zinc-950 text-white border-t border-zinc-800">
                    <h2 className="font-semibold text-lg">
                      {getLocalizedField(lightbox.item, 'title', lang) || (lang === 'tr' ? lightbox.item.title_tr : lightbox.item.title_en) || 'Aydın Torna CNC'}
                    </h2>
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
                  <div className="p-5 bg-zinc-950 text-white border-t border-zinc-800">
                    <h2 className="font-semibold text-lg">
                      {getLocalizedField(lightbox.item, 'title', lang) || (lang === 'tr' ? lightbox.item.title_tr : lightbox.item.title_en) || 'Aydın Torna CNC'}
                    </h2>
                  </div>
                </>
              )}
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
