import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, ArrowRight, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SkeletonGalleryItem, SkeletonVideoItem } from '@/components/ui/Skeleton'
import { GALLERY_CATEGORIES, getLocalizedField, matchesCategory } from '@/lib/utils'
import type { GalleryItem, VideoItem } from '@/types'

interface GallerySectionProps {
  gallery?: GalleryItem[]
  videos?: VideoItem[]
  loading?: boolean
}

/**
 * Her karta asimetrik row-span/width ataması yapar; organik kolaj görünümü için
 * dizin bazlı döngüsel bir desen kullanır.
 */
const COLLAGE_PATTERNS: { rowSpan: string; widthClass: string }[] = [
  { rowSpan: 'row-span-2', widthClass: 'w-[220px] md:w-[340px]' },
  { rowSpan: 'row-span-1', widthClass: 'w-[160px] md:w-[240px]' },
  { rowSpan: 'row-span-1', widthClass: 'w-[190px] md:w-[280px]' },
  { rowSpan: 'row-span-2', widthClass: 'w-[180px] md:w-[300px]' },
  { rowSpan: 'row-span-1', widthClass: 'w-[200px] md:w-[260px]' },
  { rowSpan: 'row-span-1', widthClass: 'w-[170px] md:w-[220px]' },
]

export default function GallerySection({ gallery = [], videos = [], loading = false }: GallerySectionProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'
  const [tab, setTab] = useState<'photos' | 'videos'>('photos')
  const [category, setCategory] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null)

  const defaultPhotos: GalleryItem[] = [
    { id: 'f-1', image_url: '/images/factory-exterior.jpg', title_tr: 'Aydın Torna Dış Görünüm', title_en: 'Aydın Torna Exterior View', category: 'genel', sort_order: 0, is_active: true, created_at: '' },
    { id: 'f-2', image_url: '/images/long-lathe.jpg', title_tr: '7.5 Metre CNC Torna Tezgahı', title_en: '7.5m CNC Lathe Machine', category: 'torna', sort_order: 1, is_active: true, created_at: '' },
    { id: 'f-3', image_url: '/images/lathe-workpiece.jpg', title_tr: 'Ağır Sanayi CNC Torna İmalatı', title_en: 'Heavy Duty CNC Lathe Production', category: 'torna', sort_order: 2, is_active: true, created_at: '' },
    { id: 'f-4', image_url: '/images/lathe-chuck.jpg', title_tr: 'Hassas Torna İşleme Aşaması', title_en: 'Precision Lathe Machining Stage', category: 'torna', sort_order: 3, is_active: true, created_at: '' },
  ]

  const sourcePhotos = gallery.length > 0 ? gallery : defaultPhotos

  // Normalize edilmiş kategori filtresi
  const filteredPhotos = sourcePhotos.filter((g) => matchesCategory(g.category, category))
  const filteredVideos = videos.filter((v) => matchesCategory(v.category, category))

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

        {/* Sekme + Kategori Filtreleri */}
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

        {/* Loading Skeleton */}
        {loading ? (
          tab === 'photos' ? (
            /* Skeleton – yatay kayan alan simülasyonu */
            <div className="h-[520px] md:h-[620px] overflow-hidden">
              <div className="flex gap-3 h-full">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonGalleryItem key={i} />
                ))}
              </div>
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
            /*
             * ─── 3 SATIRLI YATAY KAYAN KOLAJ ─────────────────────────────────
             * - Sabit yükseklik (h-[520px] md:h-[620px]) → sayfa dikeyde uzamaz
             * - overflow-x-auto + no-scrollbar → yatay kaydırma, gizli scrollbar
             * - snap-x snap-mandatory → parmak snap geçişi
             * - grid-rows-3 grid-flow-col → öğeler sütunlara soldan sağa dolar
             * - auto-cols-[minmax(...)] → dinamik sütun genişliği
             * - Her karta COLLAGE_PATTERNS ile asimetrik row-span ve genişlik
             */
            <div
              className="h-[520px] md:h-[620px] overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory touch-pan-x"
            >
              <AnimatePresence>
                <motion.div
                  layout
                  className="grid grid-rows-3 grid-flow-col gap-3 md:gap-4 h-full auto-cols-[minmax(180px,auto)] md:auto-cols-[minmax(280px,auto)]"
                >
                  {filteredPhotos.slice(0, 9).map((item, index) => {
                    const pattern = COLLAGE_PATTERNS[index % COLLAGE_PATTERNS.length]
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className={`${pattern.rowSpan} ${pattern.widthClass} snap-start cursor-pointer group`}
                        onClick={() => setSelectedPhoto(item as GalleryItem)}
                      >
                        <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm h-full w-full">
                          <img
                            src={item.image_url}
                            alt={getLocalizedField(item, 'title', lang) || 'Galeri görseli'}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <p className="text-white text-xs font-semibold tracking-wider bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase line-clamp-1">
                              {getLocalizedField(item, 'title', lang) || (lang === 'tr' ? 'Büyüt' : 'Zoom')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
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
                  <video src={item.video_url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
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
    </section>
  )
}
