import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Ruler, Factory, Globe, Shield, Truck, Settings2, type LucideProps } from 'lucide-react'

type IconComponent = React.ComponentType<LucideProps>

interface CapacityCard {
  icon: IconComponent
  titleTr: string
  titleEn: string
  valueTr: string
  valueEn: string
  detailTr: string
  detailEn: string
  accent: string
}

const capacityCards: CapacityCard[] = [
  {
    icon: Ruler,
    titleTr: 'Ağır İşleme Kapasitesi',
    titleEn: 'Heavy Duty Turning',
    valueTr: '7500 mm işleme boyu',
    valueEn: '7500 mm machining length',
    detailTr:
      'Ayna önü (swing over bed) maks. Ø1200 mm, kater üzeri (swing over carriage) maks. Ø800 mm çap işleme kapasitesi.',
    detailEn:
      'Max. Ø1200 mm swing over bed, max. Ø800 mm swing over carriage turning capacity.',
    accent: '#F97316',
  },
  {
    icon: Settings2,
    titleTr: '3–5 Eksen İşleme Merkezi',
    titleEn: '3–5 Axis Machining Center',
    valueTr: 'Freze & Delme Kapasitesi',
    valueEn: 'Milling & Drilling Capacity',
    detailTr:
      'CNC freze ve işleme merkezi ile karmaşık geometrili parçalar, flanşlar ve prototip imalat için eksiksiz altyapı.',
    detailEn:
      'Full capability for complex geometry parts, flanges and prototype manufacturing via CNC milling and machining center.',
    accent: '#3B82F6',
  },
  {
    icon: Shield,
    titleTr: 'Sıfır Hata Prensibi',
    titleEn: 'Zero-Defect Principle',
    valueTr: 'Kalite Kontrol Raporlaması',
    valueEn: 'Quality Control Reporting',
    detailTr:
      'Her kritik parça için boyutsal kontrol ve kalite belgesi. Uluslararası sevkiyata hazır teknik dokümantasyon.',
    detailEn:
      'Dimensional inspection and quality documentation for each critical part. Technical documentation ready for international shipment.',
    accent: '#10B981',
  },
  {
    icon: Truck,
    titleTr: 'Vinç Destekli Lojistik',
    titleEn: 'Crane-Assisted Logistics',
    valueTr: '3 Ton Vinç Kapasitesi',
    valueEn: '3-Ton Overhead Crane',
    detailTr:
      'Köprülü vinç altyapısıyla ağır sanayi parçalarının güvenli yüklenmesi ve uluslararası sevkiyata hazır paketlenmesi.',
    detailEn:
      'Safe handling of heavy industrial parts with overhead crane infrastructure, packaged for international export.',
    accent: '#8B5CF6',
  },
  {
    icon: Factory,
    titleTr: 'Çalışılan Malzemeler',
    titleEn: 'Workpiece Materials',
    valueTr: 'Çelik · Dökme Demir · Titanyum',
    valueEn: 'Steel · Cast Iron · Titanium',
    detailTr:
      'AISI 4140, 4340 alaşımlı çelik, paslanmaz çelik, dökme demir, bronz ve alüminyum alaşımlarında talaşlı imalat.',
    detailEn:
      'Machining of AISI 4140, 4340 alloy steel, stainless steel, cast iron, bronze and aluminium alloys.',
    accent: '#F59E0B',
  },
  {
    icon: Globe,
    titleTr: 'İhracata Hazır Üretim',
    titleEn: 'Export-Ready Production',
    valueTr: 'Avrupa & Global Tedarik',
    valueEn: 'Europe & Global Supply',
    detailTr:
      'Almanya, Hollanda ve diğer Avrupa ülkelerine outsourcing desteği. Mühendislik çiziminizi gönderin, teslim edelim.',
    detailEn:
      'Outsourcing support for Germany, Netherlands and other European countries. Send your engineering drawing, we deliver.',
    accent: '#EC4899',
  },
]

export default function CapacitySection() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  return (
    <section id="capacity" className="section-padding bg-white dark:bg-neutral-900">
      <div className="container-max mx-auto">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            {lang === 'tr' ? 'Teknik Altyapı' : 'Technical Infrastructure'}
          </span>
          <h2 className="heading-lg mb-4">
            {lang === 'tr'
              ? 'Üretim Kapasitemiz & Global Vizyonumuz'
              : 'Manufacturing Capacity & Global Reach'}
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {lang === 'tr'
              ? 'Ağır sanayi ve hassas imalatta 20+ yıllık deneyim. Verilerle desteklenen, abartısız teknik kapasite.'
              : '20+ years in heavy industry and precision machining. Data-backed, accurate technical capacity.'}
          </p>
        </motion.div>

        {/* Kart Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {capacityCards.map((card, i) => {
            const Icon = card.icon
            const title = lang === 'tr' ? card.titleTr : card.titleEn
            const value = lang === 'tr' ? card.valueTr : card.valueEn
            const detail = lang === 'tr' ? card.detailTr : card.detailEn

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <div
                  className="
                    group relative h-full
                    bg-neutral-50 dark:bg-neutral-800/60
                    border border-neutral-200 dark:border-neutral-700/60
                    rounded-2xl p-6
                    transition-all duration-300
                    hover:border-neutral-300 dark:hover:border-neutral-600
                    hover:shadow-lg hover:shadow-neutral-200/60 dark:hover:shadow-black/30
                    hover:-translate-y-1
                    overflow-hidden
                  "
                >
                  {/* Subtle accent glow arka plan */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at top left, ${card.accent}10 0%, transparent 70%)`,
                    }}
                  />

                  {/* İkon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${card.accent}18` }}
                  >
                    <Icon
                      className="w-6 h-6 transition-colors duration-300"
                      style={{ color: card.accent }}
                    />
                  </div>

                  {/* Başlık */}
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">
                    {title}
                  </p>

                  {/* Değer */}
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3 leading-snug">
                    {value}
                  </h3>

                  {/* Detay */}
                  <p className="text-sm text-muted leading-relaxed">
                    {detail}
                  </p>

                  {/* Alt çizgi dekorasyon */}
                  <div
                    className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
                    style={{ backgroundColor: card.accent }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Alt Not — şeffaflık */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted mt-10 max-w-xl mx-auto"
        >
          {lang === 'tr'
            ? '* Tüm kapasite değerleri mevcut tezgah parkuruna dayanmaktadır. Projeye özel değerlendirme için teknik ekibimizle iletişime geçin.'
            : '* All capacity values are based on current machine inventory. Contact our technical team for project-specific assessments.'}
        </motion.p>
      </div>
    </section>
  )
}
