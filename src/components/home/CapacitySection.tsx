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
}

const capacityCards: CapacityCard[] = [
  {
    icon: Ruler,
    titleTr: 'Ağır İşleme Kapasitesi',
    titleEn: 'Heavy Duty Turning',
    valueTr: '5500 mm işleme boyu',
    valueEn: '5500 mm machining length',
    detailTr:
      'Ayna önü (swing over bed) maks. Ø1200 mm, kater üzeri (swing over carriage) maks. Ø800 mm çap işleme kapasitesi.',
    detailEn:
      'Max. Ø1200 mm swing over bed, max. Ø800 mm swing over carriage turning capacity.',
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
  },
]

export default function CapacitySection() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'tr' | 'en'

  return (
    <section id="capacity" className="section-padding bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-900 transition-colors">
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-600 dark:text-accent mb-3">
            {lang === 'tr' ? 'Teknik Altyapı' : 'Technical Infrastructure'}
          </span>
          <h2 className="heading-lg mb-3 text-zinc-900 dark:text-white">
            {lang === 'tr'
              ? 'Üretim Kapasitemiz & Global Vizyonumuz'
              : 'Manufacturing Capacity & Global Reach'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            {lang === 'tr'
              ? 'Ağır sanayi ve hassas imalatta 20+ yıllık deneyim. Verilerle desteklenen, abartısız teknik kapasite.'
              : '20+ years in heavy industry and precision machining. Data-backed, accurate technical capacity.'}
          </p>
        </motion.div>

        {/* Sade, düz ve pürüzsüz kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capacityCards.map((card, i) => {
            const Icon = card.icon
            const title = lang === 'tr' ? card.titleTr : card.titleEn
            const value = lang === 'tr' ? card.valueTr : card.valueEn
            const detail = lang === 'tr' ? card.detailTr : card.detailEn

            return (
              <div
                key={i}
                className="h-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 rounded-xl p-6 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                    {title}
                  </p>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2.5">
                    {value}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {detail}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-10 max-w-xl mx-auto">
          {lang === 'tr'
            ? '* Tüm kapasite değerleri mevcut tezgah parkuruna dayanmaktadır. Projeye özel değerlendirme için teknik ekibimizle iletişime geçin.'
            : '* All capacity values are based on current machine inventory. Contact our technical team for project-specific assessments.'}
        </p>
      </div>
    </section>
  )
}
