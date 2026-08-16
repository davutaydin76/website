import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWhatsAppLink } from '@/lib/utils'

interface FloatingWhatsAppProps {
  phone?: string | null
}

const WA_MESSAGE = 'Merhaba, Aydın Torna CNC hizmetleriniz hakkında bilgi ve fiyat teklifi almak istiyorum.'

export default function FloatingWhatsApp({ phone }: FloatingWhatsAppProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Sayfa yüklendikten 2sn sonra tooltip'i göster (ilk kez dikkat çekme)
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setShowTooltip(true)
      // 5sn sonra otomatik kapat
      setTimeout(() => setShowTooltip(false), 5000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const waPhone = phone || import.meta.env.VITE_WHATSAPP_NUMBER || '905058807700'
  const href = getWhatsAppLink(waPhone, WA_MESSAGE)

  if (!mounted) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip Balonu */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="
              hidden sm:flex items-center gap-2
              bg-white dark:bg-neutral-900
              text-neutral-800 dark:text-neutral-100
              text-sm font-medium
              px-4 py-2.5 rounded-2xl
              shadow-xl border border-neutral-100 dark:border-neutral-800
              max-w-[220px] leading-tight
            "
          >
            {/* WhatsApp logo rengi nokta */}
            <span className="w-2 h-2 rounded-full bg-[#25D366] flex-shrink-0 animate-pulse" />
            Bize WhatsApp'tan Ulaşın
            <button
              onClick={() => setShowTooltip(false)}
              className="ml-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex-shrink-0"
              aria-label="Kapat"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ana Yüzen Buton */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp İletişim Hattı"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative flex items-center justify-center"
      >
        {/* Pulsing / Ripple efekti — arka plan */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping"
          aria-hidden="true"
        />
        {/* İkinci halka — daha yavaş */}
        <span
          className="absolute inset-[-6px] rounded-full bg-[#25D366] opacity-15 animate-ping"
          style={{ animationDelay: '0.3s', animationDuration: '1.8s' }}
          aria-hidden="true"
        />

        {/* Buton gövdesi */}
        <motion.div
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="
            relative z-10
            w-14 h-14 rounded-full
            bg-[#25D366] text-white
            shadow-2xl
            flex items-center justify-center
            hover:shadow-[0_0_28px_rgba(37,211,102,0.55)]
            transition-shadow duration-300
          "
        >
          {/* WhatsApp SVG ikonu (Lucide'de resmi WA ikonu yok, doğrudan SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.535 5.873L.057 23.428a.75.75 0 0 0 .921.921l5.557-1.478A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.745 9.745 0 0 1-5.032-1.392l-.36-.214-3.737.993.993-3.737-.215-.36A9.745 9.745 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
          </svg>
        </motion.div>
      </a>
    </div>
  )
}
