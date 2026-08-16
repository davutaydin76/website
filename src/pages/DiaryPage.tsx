import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Clock,
  Building2,
  ArrowLeft,
  ArrowRight,
  Wrench,
  Ruler,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@/components/seo/SEO'
import SocialCallToAction from '@/components/common/SocialCallToAction'
import { fetchProjects } from '@/services/content'
import { getOptimizedImageUrl, getWhatsAppLink } from '@/lib/utils'
import type { ProjectData } from '@/types'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '905058807700'

const fallbackDiaryProjects: ProjectData[] = [
  {
    id: 'fp-1',
    created_at: '2026-01-15T09:00:00Z',
    completion_date: '2026-01-15',
    title_tr: '6 Metre Gemi Şaftı Revizyonu',
    title_en: '6-Meter Marine Shaft Revision',
    specs_tr: 'Ø240mm x 6000mm · AISI 4340 Çelik · Ra 0.8µm · ±0.02mm',
    specs_en: 'Ø240mm x 6000mm · AISI 4340 Steel · Ra 0.8µm · ±0.02mm',
    client_type_tr: "Tuzla'da bir tersane",
    client_type_en: 'A shipyard in Tuzla',
    processing_time: '4 iş günü',
    description_tr:
      'Büyük bir gemi ana tahrik sistemi için 6 metre boyunda şaft revizyonu. Salgı ve balans testleri sıfır toleransla tamamlandı. CNC ağır torna tezgahımızda tek bağlamada işlendi.',
    description_en:
      '6-meter marine main propulsion shaft revision. Runout and balance tests verified with tight tolerances on our heavy CNC lathe.',
    media_urls: ['/images/long-lathe.jpg'],
    cover_image_url: '/images/long-lathe.jpg',
    is_active: true,
    sort_order: 0,
    meta_keywords: 'gemi şaftı torna, marine shaft machining, kocaeli cnc torna',
  },
  {
    id: 'fp-2',
    created_at: '2025-11-20T14:00:00Z',
    completion_date: '2025-11-20',
    title_tr: 'Özel Ø1200 mm Ağır Flanş İmalatı',
    title_en: 'Custom Ø1200 mm Heavy Flange Machining',
    specs_tr: 'Ø1200mm Dış Çap · EN 10083-2 · CMM Ölçüm Raporlu',
    specs_en: 'Ø1200mm Outer Dia · EN 10083-2 · CMM Certified',
    client_type_tr: 'Petrokimya ve rafineri yüklenicisi',
    client_type_en: 'Petrochemical & refinery contractor',
    processing_time: '2 iş günü',
    description_tr:
      'Ayna önü (swing over bed) Ø1200mm kapasitemizin sınırında ağır tip talaş kaldırma. Sızdırmazlık yüzeyleri ve cıvata delik eksenleri CMM kalite kontrol raporuyla onaylandı.',
    description_en:
      'Heavy turning at the limits of our Ø1200mm swing-over-bed capacity. Sealing surfaces and bolt circles CMM verified.',
    media_urls: ['/images/lathe-chuck.jpg'],
    cover_image_url: '/images/lathe-chuck.jpg',
    is_active: true,
    sort_order: 1,
    meta_keywords: 'büyük flanş imalatı, large flange machining, ağır sanayi torna',
  },
  {
    id: 'fp-3',
    created_at: '2025-09-08T11:30:00Z',
    completion_date: '2025-09-08',
    title_tr: 'Karmaşık Enerji Türbin Rotoru Prototipi',
    title_en: 'Complex Energy Turbine Rotor Prototype',
    specs_tr: '5 Eksen Frezeleme · Titanyum / Nikel Alaşımı · Prototip',
    specs_en: '5-Axis Milling · Titanium / Nickel Alloy · Prototype',
    client_type_tr: 'Rüzgar & hidroelektrik türbin üreticisi',
    client_type_en: 'Wind & hydro turbine manufacturer',
    processing_time: '6 iş günü',
    description_tr:
      'Türbin kademesi için kompleks geometrili prototip işleme. 5 eksen işleme merkezimizde hassas yüzey tarama ve CAD/CAM modelleme desteğiyle tamamlandı.',
    description_en:
      'Complex geometry prototype for energy turbine stages. Processed on 5-axis center with CAD/CAM simulation.',
    media_urls: ['/images/lathe-workpiece.jpg'],
    cover_image_url: '/images/lathe-workpiece.jpg',
    is_active: true,
    sort_order: 2,
    meta_keywords: 'prototip imalat, 5 eksen frezeleme, enerji sektörü cnc',
  },
  {
    id: 'fp-4',
    created_at: '2025-06-12T10:00:00Z',
    completion_date: '2025-06-12',
    title_tr: 'Ağır Haddehane Silindir Yatakları',
    title_en: 'Heavy Rolling Mill Bearing Blocks',
    specs_tr: 'Ø800mm Delik İçi İşleme · GGG-50 Sfero Döküm · H7 Tolerans',
    specs_en: 'Ø800mm Bore Turning · GGG-50 Ductile Iron · H7 Tolerance',
    client_type_tr: 'Demir-çelik haddecisi',
    client_type_en: 'Steel rolling mill contractor',
    processing_time: '5 iş günü',
    description_tr:
      'Ağır sanayi hadde silindir rulman yataklarının hassas tornalanması ve honlanması. Vinç altyapımızla 3 tonluk blok parçalar emniyetle işlenip sevk edildi.',
    description_en:
      'Machining and boring of rolling mill bearing housings with H7 tolerance control.',
    media_urls: ['/images/factory-exterior.jpg'],
    cover_image_url: '/images/factory-exterior.jpg',
    is_active: true,
    sort_order: 3,
    meta_keywords: 'hadde yatağı torna, ağır talaşlı imalat, dilovası cnc',
  },
]

const PILL_COLORS = [
  'bg-accent/10 text-accent border-accent/20',
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
]

const ICONS = [Wrench, Ruler, Zap]

function isVideoUrl(url?: string | null) {
  if (!url) return false
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url)
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

export default function DiaryPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMediaIndex, setActiveMediaIndex] = useState<{ [key: string]: number }>({})
  const [lightboxProject, setLightboxProject] = useState<{ project: ProjectData; index: number } | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await fetchProjects()
      setProjects(data.length > 0 ? data : fallbackDiaryProjects)
      setLoading(false)
    }
    load()
  }, [])

  // ESC ile Lightbox kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxProject(null)
    }
    if (lightboxProject) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxProject])

  // Arama filtreleme
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const title = (lang === 'tr' ? p.title_tr : (p.title_en || p.title_tr)).toLowerCase()
    const specs = (p.specs_tr || '').toLowerCase() + ' ' + (p.specs_en || '').toLowerCase()
    const desc = (p.description_tr || '').toLowerCase() + ' ' + (p.description_en || '').toLowerCase()
    const client = (p.client_type_tr || '').toLowerCase() + ' ' + (p.client_type_en || '').toLowerCase()
    return title.includes(q) || specs.includes(q) || desc.includes(q) || client.includes(q)
  })

  return (
    <>
      <SEO
        page="diary"
        title={lang === 'tr' ? 'Üretim Günlüğü & Vaka Analizleri | Aydın Torna CNC' : 'Production Diary & Case Studies | Aydın Torna CNC'}
        description={
          lang === 'tr'
            ? "1992'den beri Aydın Torna CNC atölyesinden çıkan gerçek ağır torna, freze ve kaynak vaka analizleri ve teknik üretim hafızası."
            : 'Authentic CNC turning, heavy machining and milling case studies from Aydın Torna CNC workshop since 1992.'
        }
      />

      <div className="pt-24 lg:pt-32 bg-neutral-950 min-h-screen text-white">
        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Geri Dönüş Linki */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </Link>
          </div>

          {/* Başlık Bölümü */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              {lang === 'tr' ? '1992’den Beri Üretim Hafızamız' : 'Production Archive Since 1992'}
            </span>
            <h1 className="heading-xl text-white mb-4">
              {lang === 'tr' ? 'Üretim Günlüğü / Vaka Analizleri' : 'Production Diary / Case Studies'}
            </h1>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
              {lang === 'tr'
                ? 'Binlerce iş parçasından seçilen kronolojik kayıtlar. Ağır torna, çap, boy, malzeme ve teslimat detaylarıyla şeffaf mühendislik arşivi.'
                : 'Chronological archive of real parts machined since 1992. Transparent engineering records with dimensions and metallurgy.'}
            </p>
          </div>

          {/* Arama Çubuğu */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'tr' ? 'Parça adı, çap, malzeme (örn: şaft, 4140, flanş)...' : 'Search part, material, diameter (e.g. shaft, 4140, flange)...'}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  aria-label="Aramayı temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Kronolojik Liste / Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="h-96 rounded-2xl bg-neutral-900 animate-pulse border border-neutral-800" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-neutral-400">
              <p className="text-lg mb-2">{lang === 'tr' ? 'Aramanızla eşleşen proje bulunamadı.' : 'No projects matched your search.'}</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-accent underline text-sm"
              >
                {lang === 'tr' ? 'Tüm projeleri göster' : 'Show all projects'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, i) => {
                const Icon = ICONS[i % ICONS.length]
                const title = lang === 'tr' ? project.title_tr : (project.title_en || project.title_tr)
                const description = lang === 'tr' ? project.description_tr : (project.description_en || project.description_tr)
                const clientType = lang === 'tr' ? project.client_type_tr : (project.client_type_en || project.client_type_tr)
                const specsRaw = lang === 'tr' ? project.specs_tr : (project.specs_en || project.specs_tr)
                const specs = specsRaw ? specsRaw.split('·').map((s) => s.trim()).filter(Boolean) : []

                const allMedia = [
                  ...(project.cover_image_url ? [project.cover_image_url] : []),
                  ...(project.media_urls || []).filter((u) => u !== project.cover_image_url),
                ]
                const currentMediaIdx = activeMediaIndex[project.id] || 0
                const currentMediaUrl = allMedia[currentMediaIdx] || project.cover_image_url
                const isVideo = isVideoUrl(currentMediaUrl)

                const waMsg = `Merhaba, "${project.title_tr}" projeniz hakkında bilgi almak istiyorum.`
                const waLink = getWhatsAppLink(WA_NUMBER, waMsg)

                return (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
                    className="
                      flex flex-col bg-neutral-900 border border-neutral-800/90 rounded-2xl overflow-hidden
                      hover:border-neutral-700 hover:shadow-2xl hover:shadow-black/70
                      transition-all duration-300 group
                    "
                  >
                    {/* Medya Alanı */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-950 flex-shrink-0">
                      {isVideo && currentMediaUrl ? (
                        <div
                          className="w-full h-full cursor-pointer relative"
                          onClick={() => setLightboxProject({ project, index: currentMediaIdx })}
                        >
                          <video
                            src={currentMediaUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-hidden="true"
                            tabIndex={-1}
                            className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                              ▶ Video Önizleme
                            </span>
                          </div>
                        </div>
                      ) : currentMediaUrl ? (
                        <div
                          className="w-full h-full cursor-pointer relative"
                          onClick={() => setLightboxProject({ project, index: currentMediaIdx })}
                        >
                          <img
                            src={getOptimizedImageUrl(currentMediaUrl, 600)}
                            alt={title}
                            width={600}
                            height={375}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-700">
                          <Icon className="w-12 h-12" aria-hidden="true" />
                        </div>
                      )}

                      {/* Rozet */}
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-lg text-white">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>

                      {/* Çoklu Medya Noktaları */}
                      {allMedia.length > 1 && (
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full z-10">
                          {allMedia.map((_, mi) => (
                            <button
                              key={mi}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMediaIndex((prev) => ({ ...prev, [project.id]: mi }))
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                currentMediaIdx === mi ? 'bg-accent w-3.5' : 'bg-white/50'
                              }`}
                              aria-label={`Görsel ${mi + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* İçerik */}
                    <div className="flex flex-col flex-1 p-5 sm:p-6">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mb-3">
                        {project.completion_date && (
                          <span className="inline-flex items-center gap-1 text-accent font-medium">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {formatDate(project.completion_date)}
                          </span>
                        )}
                        {clientType && (
                          <span className="inline-flex items-center gap-1 text-neutral-300">
                            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                            {clientType}
                          </span>
                        )}
                        {project.processing_time && (
                          <span className="inline-flex items-center gap-1 text-neutral-400">
                            <Clock className="w-3.5 h-3.5 text-neutral-500" />
                            {project.processing_time}
                          </span>
                        )}
                      </div>

                      {/* Başlık */}
                      <h3 className="text-white font-bold text-lg leading-snug mb-3 group-hover:text-accent transition-colors duration-200">
                        {title}
                      </h3>

                      {/* Spec Pills */}
                      {specs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {specs.map((spec, si) => (
                            <span
                              key={si}
                              className={`text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-md border ${
                                PILL_COLORS[si % PILL_COLORS.length]
                              }`}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Açıklama */}
                      {description && (
                        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-5">
                          {description}
                        </p>
                      )}

                      {/* WhatsApp CTA */}
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`"${title}" projesi hakkında WhatsApp'tan teklif al`}
                        className="
                          mt-auto flex items-center justify-between gap-2
                          px-4 py-3 rounded-xl
                          bg-neutral-800/80 hover:bg-accent
                          text-neutral-200 hover:text-white
                          text-xs sm:text-sm font-semibold
                          border border-neutral-700/60 hover:border-accent
                          transition-all duration-200 group/btn
                        "
                      >
                        <span>{lang === 'tr' ? 'Detay & Fiyat Sor' : 'Inquire Details & Quote'}</span>
                        <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover/btn:translate-x-1 transition-transform duration-200" />
                      </a>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>

        {/* Sosyal Medya Çağrı Alanı */}
        <SocialCallToAction />
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxProject(null)}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            >
              {(() => {
                const { project, index } = lightboxProject
                const allMedia = [
                  ...(project.cover_image_url ? [project.cover_image_url] : []),
                  ...(project.media_urls || []).filter((u) => u !== project.cover_image_url),
                ]
                const activeUrl = allMedia[index] || project.cover_image_url || ''
                const isVid = isVideoUrl(activeUrl)
                const pTitle = lang === 'tr' ? project.title_tr : (project.title_en || project.title_tr)

                return (
                  <>
                    <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
                      {isVid ? (
                        <video src={activeUrl} controls autoPlay playsInline className="max-h-[70vh] w-full object-contain" />
                      ) : (
                        <img
                          src={getOptimizedImageUrl(activeUrl, 1200)}
                          alt={pTitle}
                          className="max-h-[70vh] w-auto object-contain mx-auto"
                        />
                      )}

                      {/* Çoklu Medya Gezinme */}
                      {allMedia.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxProject({
                                project,
                                index: (index - 1 + allMedia.length) % allMedia.length,
                              })
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10"
                            aria-label="Önceki Medya"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxProject({
                                project,
                                index: (index + 1) % allMedia.length,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10"
                            aria-label="Sonraki Medya"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="p-6 bg-neutral-950 text-white border-t border-neutral-800">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="font-bold text-lg sm:text-xl">{pTitle}</h3>
                        {project.completion_date && (
                          <span className="text-xs text-accent font-medium">
                            {formatDate(project.completion_date)}
                          </span>
                        )}
                      </div>
                      {project.specs_tr && (
                        <p className="text-xs text-neutral-400 mb-2 font-mono">
                          {lang === 'tr' ? project.specs_tr : (project.specs_en || project.specs_tr)}
                        </p>
                      )}
                      {project.description_tr && (
                        <p className="text-sm text-neutral-300 leading-relaxed">
                          {lang === 'tr' ? project.description_tr : (project.description_en || project.description_tr)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setLightboxProject(null)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors border border-white/10"
                      aria-label="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
