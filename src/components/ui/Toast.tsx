import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useToast, type Toast, type ToastType } from '@/contexts/ToastContext'
import { cn } from '@/lib/utils'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const styles: Record<ToastType, string> = {
  success:
    'bg-white dark:bg-neutral-900 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400',
  error:
    'bg-white dark:bg-neutral-900 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400',
  warning:
    'bg-white dark:bg-neutral-900 border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-400',
  info:
    'bg-white dark:bg-neutral-900 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400',
}

function ToastItem({ t }: { t: Toast }) {
  const { dismiss } = useToast()
  const Icon = icons[t.type]
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    const duration = t.duration ?? 5000
    el.style.transition = `width ${duration}ms linear`
    requestAnimationFrame(() => {
      el.style.width = '0%'
    })
  }, [t.duration])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className={cn(
        'relative w-80 max-w-[calc(100vw-2rem)] rounded-xl border shadow-lg overflow-hidden',
        styles[t.type]
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t.title}</p>
          {t.message && (
            <p className="text-xs mt-0.5 text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t.message}
            </p>
          )}
        </div>
        <button
          onClick={() => dismiss(t.id)}
          className="flex-shrink-0 rounded-md p-0.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-black/5 dark:bg-white/10">
        <div
          ref={progressRef}
          className="h-full bg-current opacity-40"
          style={{ width: '100%' }}
        />
      </div>
    </motion.div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem t={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
