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
import { getOptimizedImageUrl } from '@/lib/utils'
import type { ProjectData } from '@/types'

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
    media_urls: ['/images/long-lathe.webp'],
    cover_image_url: '/images/long-lathe.webp',
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
    media_urls: ['/images/lathe-chuck.webp'],
    cover_image_url: '/images/lathe-chuck.webp',
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
    media_urls: ['/images/lathe-workpiece.webp'],
    cover_image_url: '/images/lathe-workpiece.webp',
    is_active: true,
    sort_order: 2,
    meta_keywords: 'prototip imalat, 5 eksen frezeleme, enerji sektörü cnc',
  },
]

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxProject(null)
    }
    if (lightboxProject) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxProject])

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

      <div className="pt-24 lg:pt-32 bg-white dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-white transition-colors">
        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </Link>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-600 dark:text-accent mb-3">
              {lang === 'tr' ? '1992’den Beri Üretim Hafızamız' : 'Production Archive Since 1992'}
            </span>
            <h1 className="heading-xl text-zinc-900 dark:text-white mb-3">
              {lang === 'tr' ? 'Üretim Günlüğü / Vaka Analizleri' : 'Production Diary / Case Studies'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
              {lang === 'tr'
                ? 'Binlerce iş parçasından seçilen kronolojik kayıtlar. Ağır torna, çap, boy, malzeme ve teslimat detaylarıyla şeffaf mühendislik arşivi.'
                : 'Chronological archive of real parts machined since 1992. Transparent engineering records with dimensions and metallurgy.'}
            </p>
          </div>

          {/* Arama Çubuğu */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'tr' ? 'Parça adı, çap, malzeme (örn: şaft, 4140, flanş)...' : 'Search part, material, diameter...'}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-accent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
                  aria-label="Aramayı temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="h-96 rounded-xl bg-zinc-200 dark:bg-zinc-900 animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 dark:text-zinc-400">
              <p className="text-base mb-2">{lang === 'tr' ? 'Aramanızla eşleşen proje bulunamadı.' : 'No projects matched your search.'}</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-accent underline text-sm"
              >
                {lang === 'tr' ? 'Tüm projeleri göster' : 'Show all projects'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProjects.map((project) => {
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

                return (
                  <article
                    key={project.id}
                    className="
                      flex flex-col bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm
                    "
                  >
                    {/* Medya */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-zinc-200 dark:bg-zinc-900 flex-shrink-0">
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
                            className="w-full h-full object-cover pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <span className="bg-black/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                              ▶ Video
                            </span>
                          </div>
                        </div>
                      ) : currentMediaUrl ? (
                        <div
                          className="w-full h-full cursor-pointer relative"
                          onClick={() => setLightboxProject({ project, index: currentMediaIdx })}
                        >
                          <img
                            src={getOptimizedImageUrl(currentMediaUrl, 600, 70)}
                            alt={title}
                            width={600}
                            height={375}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 right-2.5 bg-black/60 p-1 rounded text-white opacity-80">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                          <Wrench className="w-10 h-10" aria-hidden="true" />
                        </div>
                      )}

                      {allMedia.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full z-10">
                          {allMedia.map((_, mi) => (
                            <button
                              key={mi}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMediaIndex((prev) => ({ ...prev, [project.id]: mi }))
                              }}
                              className={`w-1.5 h-1.5 rounded-full ${
                                currentMediaIdx === mi ? 'bg-accent w-3' : 'bg-white/40'
                              }`}
                              aria-label={`Görsel ${mi + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* İçerik */}
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-2.5">
                        {project.completion_date && (
                          <span className="inline-flex items-center gap-1 text-orange-600 dark:text-accent font-medium">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {formatDate(project.completion_date)}
                          </span>
                        )}
                        {clientType && (
                          <span className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                            <Building2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                            {clientType}
                          </span>
                        )}
                        {project.processing_time && (
                          <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                            {project.processing_time}
                          </span>
                        )}
                      </div>

                      <h3 className="text-zinc-900 dark:text-white font-semibold text-lg leading-snug mb-2.5">
                        {title}
                      </h3>

                      {specs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {specs.map((spec, si) => (
                            <span
                              key={si}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300/50 dark:border-zinc-700/50"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {description && (
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-5">
                          {description}
                        </p>
                      )}

                      {/* Teklif Al — Doğrudan /offer sayfasına */}
                      <Link
                        to="/offer"
                        className="
                          mt-auto flex items-center justify-between gap-2
                          px-4 py-2.5 rounded-lg
                          bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700
                          text-zinc-900 dark:text-white text-xs font-semibold
                          transition-colors
                        "
                      >
                        <span>{lang === 'tr' ? 'Teklif İste' : 'Request Quote'}</span>
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      </Link>
                    </div>
                  </article>
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
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-zinc-950 rounded-xl overflow-hidden flex flex-col border border-zinc-800"
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
                    <div className="relative bg-black flex items-center justify-center min-h-[280px] max-h-[70vh] overflow-hidden">
                      {isVid ? (
                        <video src={activeUrl} controls autoPlay playsInline className="max-h-[70vh] w-full object-contain" />
                      ) : (
                        <img
                          src={getOptimizedImageUrl(activeUrl, 1200, 75)}
                          alt={pTitle}
                          className="max-h-[70vh] w-auto object-contain mx-auto"
                        />
                      )}

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
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center"
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center"
                            aria-label="Sonraki Medya"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="p-5 bg-zinc-950 text-white border-t border-zinc-800">
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <h3 className="font-semibold text-lg">{pTitle}</h3>
                        {project.completion_date && (
                          <span className="text-xs text-accent font-medium">
                            {formatDate(project.completion_date)}
                          </span>
                        )}
                      </div>
                      {project.specs_tr && (
                        <p className="text-xs text-zinc-400 mb-2 font-mono">
                          {lang === 'tr' ? project.specs_tr : (project.specs_en || project.specs_tr)}
                        </p>
                      )}
                      {project.description_tr && (
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {lang === 'tr' ? project.description_tr : (project.description_en || project.description_tr)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setLightboxProject(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center"
                      aria-label="Kapat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
